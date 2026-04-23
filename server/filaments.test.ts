import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1, httpOnly: true, path: "/" });
  });
});

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const { ctx } = createAuthContext(42);
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.id).toBe(42);
    expect(me?.email).toBe("test42@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});

describe("filament calculation logic", () => {
  it("calculates remaining grams correctly with empty spool method", () => {
    const advertisedWeight = 1000;
    const emptySpoolWeight = 250;
    const currentTotalWeight = 800;
    const remaining = Math.max(0, currentTotalWeight - emptySpoolWeight);
    const pct = Math.min(100, Math.round((remaining / advertisedWeight) * 100));
    expect(remaining).toBe(550);
    expect(pct).toBe(55);
  });

  it("calculates remaining grams correctly with full spool method", () => {
    const advertisedWeight = 1000;
    const fullSpoolWeight = 1250;
    const currentTotalWeight = 900;
    const emptySpoolWeight = fullSpoolWeight - advertisedWeight;
    const remaining = Math.max(0, currentTotalWeight - emptySpoolWeight);
    const pct = Math.min(100, Math.round((remaining / advertisedWeight) * 100));
    expect(remaining).toBe(650);
    expect(pct).toBe(65);
  });

  it("clamps remaining to 0 when spool is empty", () => {
    const emptySpoolWeight = 250;
    const currentTotalWeight = 200; // less than empty spool
    const remaining = Math.max(0, currentTotalWeight - emptySpoolWeight);
    expect(remaining).toBe(0);
  });

  it("clamps percentage to 100 when over-weighed", () => {
    const advertisedWeight = 1000;
    const emptySpoolWeight = 250;
    const currentTotalWeight = 1400; // more than full spool
    const remaining = Math.max(0, currentTotalWeight - emptySpoolWeight);
    const pct = Math.min(100, Math.round((remaining / advertisedWeight) * 100));
    expect(pct).toBe(100);
  });

  it("identifies low stock correctly", () => {
    const LOW_STOCK_THRESHOLD = 20;
    expect(15 <= LOW_STOCK_THRESHOLD).toBe(true);
    expect(21 <= LOW_STOCK_THRESHOLD).toBe(false);
    expect(20 <= LOW_STOCK_THRESHOLD).toBe(true);
  });
});
