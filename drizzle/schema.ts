import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const filaments = mysqlTable("filaments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // Identity
  brand: varchar("brand", { length: 128 }).notNull(),
  productLine: varchar("productLine", { length: 128 }),
  materialFamily: varchar("materialFamily", { length: 64 }).notNull(),
  materialSubtype: varchar("materialSubtype", { length: 64 }),
  colorName: varchar("colorName", { length: 128 }),
  colorHex: varchar("colorHex", { length: 7 }).notNull().default("#888888"),

  // Weight fields
  advertisedWeight: decimal("advertisedWeight", { precision: 8, scale: 2 }), // grams
  spoolType: varchar("spoolType", { length: 64 }), // standard, refill, reusable
  spoolMaterial: varchar("spoolMaterial", { length: 64 }), // cardboard, plastic, other
  measurementMethod: mysqlEnum("measurementMethod", ["empty_spool", "full_spool"]).default("empty_spool"),
  emptySpoolWeight: decimal("emptySpoolWeight", { precision: 8, scale: 2 }), // grams
  fullSpoolWeight: decimal("fullSpoolWeight", { precision: 8, scale: 2 }), // grams
  currentTotalWeight: decimal("currentTotalWeight", { precision: 8, scale: 2 }), // grams

  // Calculated (stored for fast queries)
  remainingGrams: decimal("remainingGrams", { precision: 8, scale: 2 }),
  remainingPercent: decimal("remainingPercent", { precision: 5, scale: 2 }),

  // Purchase & supplier
  purchaseLink: text("purchaseLink"),
  supplier: varchar("supplier", { length: 128 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  datePurchased: timestamp("datePurchased"),

  // Storage
  storageLocation: varchar("storageLocation", { length: 128 }),
  isDryBox: boolean("isDryBox").default(false),
  lastDriedAt: timestamp("lastDriedAt"),

  // Meta
  notes: text("notes"),
  customLabels: text("customLabels"), // JSON array stored as text
  isArchived: boolean("isArchived").default(false),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Filament = typeof filaments.$inferSelect;
export type InsertFilament = typeof filaments.$inferInsert;
