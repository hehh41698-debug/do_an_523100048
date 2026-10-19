import { and, desc, eq, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { carts, cartItems, Favorite, InsertUser, favorites, invoices, messages, orders, orderItems, productReviews, productVariants, contactMessages, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listFavorites(userId: number): Promise<Favorite[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favorites)
    .where(and(eq(favorites.userId, userId), isNull(favorites.deletedAt)))
    .orderBy(desc(favorites.createdAt));
}

export async function findFavorite(userId: number, favoritableType: string, favoritableId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(favorites).where(and(
    eq(favorites.userId, userId),
    eq(favorites.favoritableType, favoritableType),
  )).limit(100);
  return result.find(item => item.favoritableId === favoritableId);
}

export async function restoreFavorite(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(favorites).set({ deletedAt: null }).where(eq(favorites.id, id));
}

export async function createFavorite(input: { userId: number; favoritableType: string; favoritableId: number }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(favorites).values(input);
}

export async function softDeleteFavorite(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(favorites).set({ deletedAt: new Date() }).where(eq(favorites.id, id));
}

export async function listProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true))).orderBy(productVariants.id);
}

export async function getActiveProductVariant(productId: number, variantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productVariants).where(and(
    eq(productVariants.id, variantId),
    eq(productVariants.productId, productId),
    eq(productVariants.isActive, true),
  )).limit(1);
  return result[0];
}

export async function getOrCreateActiveCart(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.status, "active"))).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(carts).values({ userId, status: "active" });
  const created = await db.select().from(carts).where(and(eq(carts.userId, userId), eq(carts.status, "active"))).limit(1);
  return created[0];
}

export async function listCartItems(userId: number) {
  const cart = await getOrCreateActiveCart(userId);
  const db = await getDb();
  if (!db || !cart) return [];
  return db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).orderBy(desc(cartItems.createdAt));
}

export async function findOwnedCartItem(userId: number, itemId: number) {
  const cart = await getOrCreateActiveCart(userId);
  const db = await getDb();
  if (!db || !cart) return undefined;
  const result = await db.select().from(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id))).limit(1);
  return result[0];
}

export async function findCartItem(userId: number, productId: number, variantId?: number) {
  const cart = await getOrCreateActiveCart(userId);
  const db = await getDb();
  if (!db || !cart) return undefined;
  const conditions = [eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)];
  conditions.push(variantId ? eq(cartItems.variantId, variantId) : isNull(cartItems.variantId));
  const result = await db.select().from(cartItems).where(and(...conditions)).limit(1);
  return result[0];
}

export async function addOrUpdateCartItem(input: { userId: number; productId: number; variantId?: number; productName: string; variantName?: string; unitPrice: string; quantity: number; maxStock: number }) {
  const db = await getDb();
  const cart = await getOrCreateActiveCart(input.userId);
  if (!db || !cart) return undefined;
  const existing = await findCartItem(input.userId, input.productId, input.variantId);
  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (nextQuantity > input.maxStock) throw new Error("Số lượng vượt quá tồn kho hiện tại.");
  if (existing) {
    await db.update(cartItems).set({ quantity: nextQuantity, unitPrice: input.unitPrice, updatedAt: new Date() }).where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ cartId: cart.id, productId: input.productId, variantId: input.variantId, productName: input.productName, variantName: input.variantName, unitPrice: input.unitPrice, quantity: input.quantity });
  }
  return listCartItems(input.userId);
}

export async function updateOwnedCartItem(userId: number, itemId: number, quantity: number) {
  const db = await getDb();
  const item = await findOwnedCartItem(userId, itemId);
  if (!db || !item) return undefined;
  await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(eq(cartItems.id, itemId));
  return listCartItems(userId);
}

export async function removeOwnedCartItem(userId: number, itemId: number) {
  const db = await getDb();
  const item = await findOwnedCartItem(userId, itemId);
  if (!db || !item) return false;
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return true;
}

export async function createOrderFromCart(input: { userId: number; itemIds: number[]; recipientName: string; recipientPhone: string; shippingAddress: string; note?: string; paymentMethod: "cod" | "bank_transfer" | "vnpay" | "momo" }) {
  const db = await getDb();
  const cart = await getOrCreateActiveCart(input.userId);
  if (!db || !cart) throw new Error("Database chưa sẵn sàng.");
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
  const selected = items.filter(item => input.itemIds.includes(item.id));
  if (!selected.length) throw new Error("Chưa chọn sản phẩm để đặt hàng.");
  const subtotal = selected.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shippingFee = subtotal >= 5000000 ? 0 : 30000;
  const total = subtotal + shippingFee;
  const orderNumber = `NX-${Date.now().toString(36).toUpperCase()}`;
  await db.insert(orders).values({ orderNumber, userId: input.userId, status: "pending", subtotal: subtotal.toFixed(2), shippingFee: shippingFee.toFixed(2), discount: "0", total: total.toFixed(2), recipientName: input.recipientName, recipientPhone: input.recipientPhone, shippingAddress: input.shippingAddress, note: input.note });
  const created = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = created[0];
  if (!order) throw new Error("Không thể tạo đơn hàng.");
  await db.insert(orderItems).values(selected.map(item => ({ orderId: order.id, productId: item.productId, variantId: item.variantId, productName: item.productName, variantName: item.variantName, unitPrice: String(item.unitPrice), quantity: item.quantity })));
  await db.insert(invoices).values({ orderId: order.id, invoiceNumber: `INV-${orderNumber}`, total: total.toFixed(2), paymentMethod: input.paymentMethod, paymentStatus: input.paymentMethod === "cod" ? "unpaid" : "pending" });
  await db.delete(cartItems).where(eq(cartItems.id, selected[0].id));
  for (const item of selected.slice(1)) await db.delete(cartItems).where(eq(cartItems.id, item.id));
  return order;
}

export async function listUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function listAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
  const updated = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return updated[0];
}

export async function getOrderDetailsForUser(userId: number, orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const found = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  const order = found[0];
  if (!order) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const invoice = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  return { order, items, invoice: invoice[0] };
}

export async function updateInvoicePaymentStatus(orderId: number, paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded", transactionReference?: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(invoices).set({ paymentStatus, transactionReference, paidAt: paymentStatus === "paid" ? new Date() : null }).where(eq(invoices.orderId, orderId));
  const updated = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  return updated[0];
}

export async function listPublishedReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.status, "published"))).orderBy(desc(productReviews.createdAt));
}

export async function createProductReview(input: { userId: number; productId: number; rating: number; title?: string; content: string; orderId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database chưa sẵn sàng.");
  await db.insert(productReviews).values({ ...input, status: "pending" });
}

export async function createContactMessage(input: { userId?: number; name: string; email: string; subject: string; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database chưa sẵn sàng.");
  await db.insert(contactMessages).values(input);
}

export async function listContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function replyToContactMessage(id: number, repliedBy: number, adminReply: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(contactMessages).set({ adminReply, repliedBy, repliedAt: new Date(), status: "in_progress" }).where(eq(contactMessages.id, id));
  const updated = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return updated[0];
}

export async function createMessage(input: { conversationId: number; senderId: number; receiverId: number; content: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database chưa sẵn sàng.");
  const created = await db.insert(messages).values(input);
  return created;
}

export async function listMessagesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId))).orderBy(desc(messages.createdAt));
}

export async function listAllMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessagesRead(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ isRead: true }).where(and(eq(messages.receiverId, userId), eq(messages.conversationId, conversationId)));
}
