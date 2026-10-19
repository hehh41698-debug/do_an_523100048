import { EventEmitter } from "node:events";
import type { Server as SocketIOServer } from "socket.io";

export type OrderStatus = "pending" | "confirmed" | "packing" | "shipping" | "delivered" | "cancelled";
export type OrderStatusEvent = { orderId: number | string; orderNumber?: string; status: OrderStatus; updatedAt: string };
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";
export type PaymentStatusEvent = { orderId: number | string; status: PaymentStatus; transactionReference?: string; updatedAt: string };
export type InventoryStatusEvent = { productId: number; stock: number; updatedAt: string };
export type ContactEvent = { conversationId: number | string; from: "user" | "admin"; message: string; authorName?: string; updatedAt: string };

export const orderEvents = new EventEmitter();
let io: SocketIOServer | null = null;

export function registerRealtimeServer(server: SocketIOServer) {
  io = server;
  io.on("connection", socket => {
    socket.join("orders");
    socket.on("subscribe:orders", () => socket.join("orders"));
    socket.on("admin:order-status", (event: OrderStatusEvent) => {
      const allowed: OrderStatus[] = ["pending", "confirmed", "packing", "shipping", "delivered", "cancelled"];
      if (!event || !allowed.includes(event.status) || (typeof event.orderId !== "number" && typeof event.orderId !== "string")) return;
      publishOrderStatus({ ...event, updatedAt: new Date().toISOString() });
    });
    socket.on("admin:payment-status", (event: PaymentStatusEvent) => {
      const allowed: PaymentStatus[] = ["unpaid", "pending", "paid", "failed", "refunded"];
      if (!event || !allowed.includes(event.status)) return;
      orderEvents.emit("payment:updated", { ...event, updatedAt: new Date().toISOString() });
    });
    socket.on("admin:inventory-updated", (event: InventoryStatusEvent) => {
      if (!event || !Number.isInteger(event.productId) || event.stock < 0) return;
      orderEvents.emit("inventory:updated", { ...event, updatedAt: new Date().toISOString() });
    });
    socket.on("contact:message", (event: ContactEvent) => {
      if (!event?.message?.trim()) return;
      orderEvents.emit("contact:message", { ...event, updatedAt: new Date().toISOString() });
    });
    socket.on("contact:reply", (event: ContactEvent) => {
      if (!event?.message?.trim()) return;
      orderEvents.emit("contact:reply", { ...event, updatedAt: new Date().toISOString() });
    });
  });
  orderEvents.on("order:updated", (event: OrderStatusEvent) => {
    io?.to("orders").emit("order:updated", event);
  });
  orderEvents.on("payment:updated", event => io?.to("orders").emit("payment:updated", event));
  orderEvents.on("inventory:updated", event => io?.to("orders").emit("inventory:updated", event));
  orderEvents.on("contact:message", event => io?.to("orders").emit("contact:message", event));
  orderEvents.on("contact:reply", event => io?.to("orders").emit("contact:reply", event));
}

export function publishOrderStatus(event: OrderStatusEvent) {
  orderEvents.emit("order:updated", event);
}
