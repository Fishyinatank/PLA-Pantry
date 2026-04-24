import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { filaments, InsertFilament, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] User upsert skipped: SQL database is not configured"); return; }

  const values: InsertUser = { openId: user.openId };
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
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Filaments ────────────────────────────────────────────────────────────────

function calculateRemaining(data: Partial<InsertFilament>): { remainingGrams: number | null; remainingPercent: number | null } {
  const advertised = data.advertisedWeight ? Number(data.advertisedWeight) : null;
  const current = data.currentTotalWeight ? Number(data.currentTotalWeight) : null;

  if (current === null) return { remainingGrams: null, remainingPercent: null };

  if (data.measurementMethod === "empty_spool" && data.emptySpoolWeight != null) {
    const empty = Number(data.emptySpoolWeight);
    const remaining = Math.max(0, current - empty);
    const pct = advertised ? Math.min(100, Math.round((remaining / advertised) * 100)) : null;
    return { remainingGrams: Math.round(remaining), remainingPercent: pct };
  }

  if (data.measurementMethod === "full_spool" && data.fullSpoolWeight != null) {
    const full = Number(data.fullSpoolWeight);
    const remaining = Math.max(0, current - (full - (advertised ?? 0)));
    const pct = advertised ? Math.min(100, Math.round((remaining / advertised) * 100)) : null;
    return { remainingGrams: Math.round(remaining), remainingPercent: pct };
  }

  return { remainingGrams: null, remainingPercent: null };
}

export async function getFilamentsByUser(userId: number, opts?: { search?: string; brand?: string; material?: string; lowStock?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(filaments.userId, userId), eq(filaments.isArchived, false)];

  if (opts?.search) {
    const s = `%${opts.search}%`;
    conditions.push(
      or(
        like(filaments.brand, s),
        like(filaments.colorName, s),
        like(filaments.materialFamily, s),
        like(filaments.materialSubtype, s),
        like(filaments.notes, s)
      )!
    );
  }
  if (opts?.brand) conditions.push(eq(filaments.brand, opts.brand));
  if (opts?.material) conditions.push(eq(filaments.materialFamily, opts.material));
  if (opts?.lowStock) {
    conditions.push(sql`${filaments.remainingPercent} IS NOT NULL AND ${filaments.remainingPercent} <= 20`);
  }

  return db.select().from(filaments).where(and(...conditions)).orderBy(desc(filaments.updatedAt));
}

export async function getFilamentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(filaments).where(and(eq(filaments.id, id), eq(filaments.userId, userId))).limit(1);
  return result[0] ?? null;
}

export async function createFilament(userId: number, data: Omit<InsertFilament, "id" | "userId" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Filament create skipped: SQL database is not configured"); return null; }
  const { remainingGrams, remainingPercent } = calculateRemaining(data);
  const values: InsertFilament = {
    ...data,
    userId,
    remainingGrams: remainingGrams?.toString() as any,
    remainingPercent: remainingPercent?.toString() as any,
  };
  const result = await db.insert(filaments).values(values);
  return result;
}

export async function updateFilament(id: number, userId: number, data: Partial<InsertFilament>) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Filament update skipped: SQL database is not configured"); return; }
  const existing = await getFilamentById(id, userId);
  if (!existing) throw new Error("Filament not found");
  const merged = { ...existing, ...data };
  const { remainingGrams, remainingPercent } = calculateRemaining(merged);
  await db.update(filaments).set({
    ...data,
    remainingGrams: remainingGrams?.toString() as any,
    remainingPercent: remainingPercent?.toString() as any,
  }).where(and(eq(filaments.id, id), eq(filaments.userId, userId)));
}

export async function deleteFilament(id: number, userId: number) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Filament delete skipped: SQL database is not configured"); return; }
  await db.delete(filaments).where(and(eq(filaments.id, id), eq(filaments.userId, userId)));
}

export async function getFilamentStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const all = await db.select().from(filaments).where(and(eq(filaments.userId, userId), eq(filaments.isArchived, false)));

  const totalSpools = all.length;
  const totalGrams = all.reduce((sum, f) => sum + (f.remainingGrams ? Number(f.remainingGrams) : 0), 0);
  const lowStockCount = all.filter(f => f.remainingPercent !== null && Number(f.remainingPercent) <= 20).length;

  const brandMap: Record<string, number> = {};
  const materialMap: Record<string, number> = {};
  for (const f of all) {
    brandMap[f.brand] = (brandMap[f.brand] ?? 0) + 1;
    materialMap[f.materialFamily] = (materialMap[f.materialFamily] ?? 0) + 1;
  }

  const brandDistribution = Object.entries(brandMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const materialDistribution = Object.entries(materialMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const avgRemaining = totalSpools > 0
    ? Math.round(all.reduce((sum, f) => sum + (f.remainingPercent ? Number(f.remainingPercent) : 0), 0) / totalSpools)
    : 0;

  return { totalSpools, totalGrams: Math.round(totalGrams), lowStockCount, brandDistribution, materialDistribution, avgRemaining };
}
