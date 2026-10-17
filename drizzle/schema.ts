import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
