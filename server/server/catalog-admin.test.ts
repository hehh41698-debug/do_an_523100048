import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type Role = "user" | "admin";

function createContext(role?: Role): TrpcContext {
  return {
    user: role
      ? {
          id: role === "admin" ? 2 : 1,
          openId: `${role}-demo`,
          email: `${role}@nexa.store`,
          name: role === "admin" ? "Admin Demo" : "User Demo",
          loginMethod: "test",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("catalog procedures", () => {
  it("filters public catalog by query", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.catalog.list({ query: "Nova Slim", group: "Laptop" });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Nova Slim 15");
  });
});

describe("admin procedures", () => {
  it("rejects a normal user", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.admin.summary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an admin to read summary data", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.summary();
    expect(result.newOrders).toBe(86);
    expect(result.lowStock).toBe(2);
  });
});
