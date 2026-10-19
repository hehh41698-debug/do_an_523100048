import { boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  fullName: varchar("fullName", { length: 160 }),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "banned", "pending"]).default("pending").notNull(),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userIdx: index("password_reset_tokens_user_idx").on(table.userId),
}));

export const loginLogs = mysqlTable("login_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  success: boolean("success").default(false).notNull(),
  failureReason: varchar("failureReason", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userIdx: index("login_logs_user_idx").on(table.userId),
  createdIdx: index("login_logs_created_idx").on(table.createdAt),
}));

export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("targetType", { length: 64 }),
  targetId: int("targetId"),
  metadata: text("metadata"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  adminIdx: index("admin_audit_logs_admin_idx").on(table.adminUserId),
  createdIdx: index("admin_audit_logs_created_idx").on(table.createdAt),
}));

export const favoriteCollections = mysqlTable("favorite_collections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false).notNull(),
  coverImage: varchar("coverImage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userIdx: index("favorite_collections_user_idx").on(table.userId),
}));

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  favoritableType: varchar("favoritableType", { length: 32 }).notNull(),
  favoritableId: int("favoritableId").notNull(),
  note: text("note"),
  collectionId: int("collectionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, table => ({
  ownerItemUnique: uniqueIndex("favorites_owner_item_unique").on(table.userId, table.favoritableType, table.favoritableId),
  userIdx: index("favorites_user_idx").on(table.userId),
  collectionIdx: index("favorites_collection_idx").on(table.collectionId),
  popularityIdx: index("favorites_popularity_idx").on(table.favoritableType, table.favoritableId, table.deletedAt),
}));

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type LoginLog = typeof loginLogs.$inferSelect;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type FavoriteCollection = typeof favoriteCollections.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

/** Product commerce model inspired by ZAVY's variants/cart/order flow, adapted for computer hardware. */
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  cpu: varchar("cpu", { length: 120 }),
  gpu: varchar("gpu", { length: 120 }),
  ram: varchar("ram", { length: 80 }),
  storage: varchar("storage", { length: 80 }),
  color: varchar("color", { length: 60 }),
  priceAdjustment: decimal("priceAdjustment", { precision: 12, scale: 2 }).default("0").notNull(),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  productIdx: index("product_variants_product_idx").on(table.productId),
  stockIdx: index("product_variants_stock_idx").on(table.stock),
}));

export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["active", "converted", "abandoned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  activeUserUnique: uniqueIndex("carts_active_user_unique").on(table.userId, table.status),
  userIdx: index("carts_user_idx").on(table.userId),
}));

export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  productId: int("productId").notNull(),
  variantId: int("variantId"),
  productName: varchar("productName", { length: 180 }).notNull(),
  variantName: varchar("variantName", { length: 180 }),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  cartProductUnique: uniqueIndex("cart_items_product_variant_unique").on(table.cartId, table.productId, table.variantId),
  cartIdx: index("cart_items_cart_idx").on(table.cartId),
}));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "packing", "shipping", "delivered", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingFee: decimal("shippingFee", { precision: 12, scale: 2 }).default("0").notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  recipientName: varchar("recipientName", { length: 160 }).notNull(),
  recipientPhone: varchar("recipientPhone", { length: 32 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userIdx: index("orders_user_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  createdIdx: index("orders_created_idx").on(table.createdAt),
}));

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  variantId: int("variantId"),
  productName: varchar("productName", { length: 180 }).notNull(),
  variantName: varchar("variantName", { length: 180 }),
  sku: varchar("sku", { length: 80 }),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  orderIdx: index("order_items_order_idx").on(table.orderId),
}));

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().unique(),
  invoiceNumber: varchar("invoiceNumber", { length: 48 }).notNull().unique(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cod", "bank_transfer", "vnpay", "momo"]).default("cod").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "refunded"]).default("unpaid").notNull(),
  transactionReference: varchar("transactionReference", { length: 120 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  paymentIdx: index("invoices_payment_idx").on(table.paymentStatus),
}));

export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  orderId: int("orderId"),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 160 }),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "published", "hidden"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  productIdx: index("product_reviews_product_idx").on(table.productId),
  userProductUnique: uniqueIndex("product_reviews_user_product_unique").on(table.userId, table.productId, table.orderId),
}));

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  adminReply: text("adminReply"),
  repliedBy: int("repliedBy"),
  repliedAt: timestamp("repliedAt"),
  status: mysqlEnum("status", ["new", "in_progress", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  statusIdx: index("contact_messages_status_idx").on(table.status),
  createdIdx: index("contact_messages_created_idx").on(table.createdAt),
}));

/** Normalized two-way inbox records. contact_messages remains the support request summary. */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  conversationIdx: index("messages_conversation_idx").on(table.conversationId, table.createdAt),
  receiverReadIdx: index("messages_receiver_read_idx").on(table.receiverId, table.isRead),
}));
