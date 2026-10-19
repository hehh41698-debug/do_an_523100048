import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { catalogProducts, demoUsers } from "@shared/catalog";
import { addOrUpdateCartItem, createContactMessage, createMessage, createOrderFromCart, createProductReview, createFavorite, getActiveProductVariant, getOrderDetailsForUser, listAllMessages, listAllOrders, listCartItems, listContactMessages, listMessagesForUser, listProductVariants, listPublishedReviews, listUserOrders, findFavorite, listFavorites, markMessagesRead, removeOwnedCartItem, replyToContactMessage, restoreFavorite, softDeleteFavorite, updateInvoicePaymentStatus, updateOrderStatus, updateOwnedCartItem } from "./db";
import { orderEvents, publishOrderStatus, type OrderStatus, type PaymentStatus } from "./realtime";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Chỉ quản trị viên mới có quyền truy cập." });
  }
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure
      .input(z.object({ query: z.string().optional(), category: z.string().optional(), group: z.string().optional() }).optional())
      .query(({ input }) => {
        const query = input?.query?.trim().toLowerCase() ?? "";
        return catalogProducts.filter(product => {
          const matchesQuery = !query || `${product.name} ${product.brand} ${product.category} ${product.specs.join(" ")}`.toLowerCase().includes(query);
          const matchesCategory = !input?.category || input.category === "Tất cả" || product.category === input.category;
          const matchesGroup = !input?.group || product.group === input.group;
          return matchesQuery && matchesCategory && matchesGroup;
        });
      }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => {
      const product = catalogProducts.find(item => item.id === input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy sản phẩm." });
      return product;
    }),
    variants: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(async ({ input }) => {
      const product = catalogProducts.find(item => item.id === input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy sản phẩm." });
      const variants = await listProductVariants(input.productId);
      return variants.length ? variants : [{ id: 0, productId: product.id, sku: `DEMO-${product.id}`, name: "Cấu hình tiêu chuẩn", cpu: product.specs[0], gpu: product.specs[2], ram: product.specs[1], storage: product.specs[2], color: undefined, priceAdjustment: "0", stock: product.stock, isActive: true }];
    }),
  }),
  cart: router({
    list: protectedProcedure.query(({ ctx }) => listCartItems(ctx.user.id)),
    add: protectedProcedure.input(z.object({ productId: z.number().int().positive(), variantId: z.number().int().nonnegative().optional(), quantity: z.number().int().min(1).max(99) })).mutation(async ({ ctx, input }) => {
      const product = catalogProducts.find(item => item.id === input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không tồn tại." });
      const variant = input.variantId && input.variantId > 0 ? await getActiveProductVariant(input.productId, input.variantId) : undefined;
      if (input.variantId && input.variantId > 0 && !variant) throw new TRPCError({ code: "NOT_FOUND", message: "Cấu hình sản phẩm không tồn tại." });
      const maxStock = variant?.stock ?? product.stock;
      if (maxStock < input.quantity) throw new TRPCError({ code: "BAD_REQUEST", message: "Số lượng vượt quá tồn kho." });
      try {
        return await addOrUpdateCartItem({ userId: ctx.user.id, productId: product.id, variantId: variant?.id, productName: product.name, variantName: variant?.name, unitPrice: (product.price + Number(variant?.priceAdjustment ?? 0)).toFixed(2), quantity: input.quantity, maxStock });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng." });
      }
    }),
    update: protectedProcedure.input(z.object({ itemId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).mutation(async ({ ctx, input }) => {
      const result = await updateOwnedCartItem(ctx.user.id, input.itemId, input.quantity);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không có trong giỏ của bạn." });
      return result;
    }),
    remove: protectedProcedure.input(z.object({ itemId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const removed = await removeOwnedCartItem(ctx.user.id, input.itemId);
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không có trong giỏ của bạn." });
      return { success: true } as const;
    }),
  }),
  orders: router({
    mine: protectedProcedure.query(({ ctx }) => listUserOrders(ctx.user.id)),
    detail: protectedProcedure.input(z.object({ orderId: z.number().int().positive() })).query(({ ctx, input }) => getOrderDetailsForUser(ctx.user.id, input.orderId)),
    create: protectedProcedure.input(z.object({ itemIds: z.array(z.number().int().positive()).min(1), recipientName: z.string().min(2).max(160), recipientPhone: z.string().min(8).max(32), shippingAddress: z.string().min(10).max(500), note: z.string().max(500).optional(), paymentMethod: z.enum(["cod", "bank_transfer", "vnpay", "momo"]) })).mutation(async ({ ctx, input }) => {
      try {
        return await createOrderFromCart({ ...input, userId: ctx.user.id });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Không thể tạo đơn hàng." });
      }
    }),
    updateStatus: adminProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["pending", "confirmed", "packing", "shipping", "delivered", "cancelled"]) })).mutation(async ({ input }) => {
      const updated = await updateOrderStatus(input.orderId, input.status);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy đơn hàng." });
      publishOrderStatus({ orderId: updated.id, orderNumber: updated.orderNumber, status: updated.status as OrderStatus, updatedAt: new Date().toISOString() });
      return updated;
    }),
    updatePayment: adminProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]), transactionReference: z.string().max(120).optional() })).mutation(async ({ input }) => {
      const updated = await updateInvoicePaymentStatus(input.orderId, input.status, input.transactionReference);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy hóa đơn." });
      orderEvents.emit("payment:updated", { orderId: input.orderId, status: input.status as PaymentStatus, transactionReference: input.transactionReference, updatedAt: new Date().toISOString() });
      return updated;
    }),
  }),
  reviews: router({
    list: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => listPublishedReviews(input.productId)),
    submit: protectedProcedure.input(z.object({ productId: z.number().int().positive(), orderId: z.number().int().positive().optional(), rating: z.number().int().min(1).max(5), title: z.string().max(160).optional(), content: z.string().min(10).max(2000) })).mutation(async ({ ctx, input }) => {
      if (!catalogProducts.some(product => product.id === input.productId)) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không tồn tại." });
      await createProductReview({ ...input, userId: ctx.user.id });
      return { success: true, status: "pending" as const };
    }),
  }),
  contact: router({
    send: publicProcedure.input(z.object({ name: z.string().min(2).max(160), email: z.string().email(), subject: z.string().min(3).max(180), message: z.string().min(10).max(3000) })).mutation(async ({ ctx, input }) => {
      await createContactMessage({ ...input, userId: ctx.user?.id });
      return { success: true } as const;
    }),
    mine: protectedProcedure.query(({ ctx }) => listContactMessages().then(messages => messages.filter(message => message.userId === ctx.user.id))),
    reply: adminProcedure.input(z.object({ conversationId: z.number().int().positive(), message: z.string().min(1).max(3000) })).mutation(async ({ ctx, input }) => {
      const updated = await replyToContactMessage(input.conversationId, ctx.user.id, input.message);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy cuộc hội thoại." });
      orderEvents.emit("contact:reply", { conversationId: updated.id, from: "admin", message: input.message, updatedAt: new Date().toISOString() });
      return updated;
    }),
  }),
  messages: router({
    mine: protectedProcedure.query(({ ctx }) => listMessagesForUser(ctx.user.id)),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), receiverId: z.number().int().positive(), content: z.string().min(1).max(3000) })).mutation(async ({ ctx, input }) => {
      const created = await createMessage({ ...input, senderId: ctx.user.id });
      orderEvents.emit("contact:message", { conversationId: input.conversationId, from: ctx.user.role === "admin" ? "admin" : "user", message: input.content, updatedAt: new Date().toISOString() });
      return created;
    }),
    markRead: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(({ ctx, input }) => markMessagesRead(ctx.user.id, input.conversationId).then(() => ({ success: true } as const))),
    adminList: adminProcedure.query(() => listAllMessages()),
  }),
  favorites: router({
    list: protectedProcedure.query(({ ctx }) => listFavorites(ctx.user.id)),
    check: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const product = catalogProducts.find(item => item.id === input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không tồn tại." });
        const favorite = await findFavorite(ctx.user.id, "product", input.productId);
        return { isFavorite: Boolean(favorite && !favorite.deletedAt) };
      }),
    toggle: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const product = catalogProducts.find(item => item.id === input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Sản phẩm không tồn tại." });
        const favorite = await findFavorite(ctx.user.id, "product", input.productId);
        if (favorite && !favorite.deletedAt) {
          await softDeleteFavorite(favorite.id);
          return { success: true, isFavorite: false } as const;
        }
        if (favorite && favorite.deletedAt) await restoreFavorite(favorite.id);
        else await createFavorite({ userId: ctx.user.id, favoritableType: "product", favoritableId: input.productId });
        return { success: true, isFavorite: true } as const;
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const favorite = await findFavorite(ctx.user.id, "product", input.productId);
        if (favorite && !favorite.deletedAt) await softDeleteFavorite(favorite.id);
        return { success: true } as const;
      }),
  }),
  admin: router({
    summary: adminProcedure.query(() => ({
      revenue: 428600000,
      newOrders: 86,
      averageOrder: 14800000,
      lowStock: catalogProducts.filter(product => product.stock <= 5).length,
    })),
    products: adminProcedure.query(() => catalogProducts),
    users: adminProcedure.query(() => demoUsers),
    orders: adminProcedure.query(() => listAllOrders()),
    contacts: adminProcedure.query(() => listContactMessages()),
  }),
});

export type AppRouter = typeof appRouter;
