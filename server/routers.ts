import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { catalogProducts, demoUsers } from "@shared/catalog";
import { createFavorite, findFavorite, listFavorites, restoreFavorite, softDeleteFavorite } from "./db";
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
  }),
});

export type AppRouter = typeof appRouter;
