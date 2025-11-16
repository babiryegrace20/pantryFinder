import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("individual"),
  familySize: integer("family_size"),
  dietaryRestrictions: jsonb("dietary_restrictions").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  lat: real("lat"),
  lon: real("lon"),
  isDefault: integer("is_default").default(0),
});

export const pantries = pgTable("pantries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  hours: jsonb("hours").$type<{ [key: string]: string }>(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  serviceArea: jsonb("service_area").$type<string[]>(),
  status: text("status").notNull().default("active"),
  managerId: varchar("manager_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pantryId: varchar("pantry_id").notNull().references(() => pantries.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  expirationDate: text("expiration_date"),
  status: text("status").notNull().default("available"),
  isSurplus: integer("is_surplus").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pantryId: varchar("pantry_id").notNull().references(() => pantries.id, { onDelete: "cascade" }),
  requestedItems: jsonb("requested_items").$type<{ category: string; quantity?: number }[]>().notNull(),
  status: text("status").notNull().default("pending"),
  needsDelivery: integer("needs_delivery").default(0),
  deliveryAddress: text("delivery_address"),
  deliveryDate: text("delivery_date"),
  deliveryStatus: text("delivery_status").default("not_scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pantryId: varchar("pantry_id").notNull().references(() => pantries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organization: text("organization"),
  preferredCategories: jsonb("preferred_categories").$type<string[]>(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  role: z.enum(["individual", "pantry-admin", "admin"]).default("individual"),
  familySize: z.number().optional().nullable(),
  dietaryRestrictions: z.array(z.string()).optional().nullable(),
});

export const insertAddressSchema = z.object({
  userId: z.string().optional().nullable(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  lat: z.number().optional().nullable(),
  lon: z.number().optional().nullable(),
  isDefault: z.number().default(0).optional(),
});

export const insertPantrySchema = z.object({
  name: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  lat: z.number(),
  lon: z.number(),
  hours: z.record(z.string()).optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  serviceArea: z.array(z.string()).optional().nullable(),
  status: z.string().default("active").optional(),
  managerId: z.string().optional().nullable(),
});

export const insertInventoryItemSchema = z.object({
  pantryId: z.string(),
  category: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  expirationDate: z.string().optional().nullable(),
  status: z.enum(["available", "reserved", "claimed"]).default("available"),
  isSurplus: z.number().default(0).optional(),
  lowStockThreshold: z.number().default(10).optional(),
  notes: z.string().optional().nullable(),
});

export const insertRequestSchema = z.object({
  userId: z.string(),
  pantryId: z.string(),
  requestedItems: z.array(z.object({
    category: z.string(),
    quantity: z.number().optional(),
  })),
  status: z.enum(["pending", "accepted", "declined", "completed", "cancelled"]).default("pending"),
  needsDelivery: z.number().default(0).optional(),
  deliveryAddress: z.string().optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  deliveryStatus: z.enum(["not_scheduled", "scheduled", "in_transit", "delivered"]).default("not_scheduled").optional(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.needsDelivery === 1) {
      return data.deliveryAddress && data.deliveryAddress.trim().length > 0;
    }
    return true;
  },
  {
    message: "Delivery address is required when delivery is needed",
    path: ["deliveryAddress"],
  }
);

export const insertDonorSchema = z.object({
  pantryId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  preferredCategories: z.array(z.string()).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active").optional(),
});

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Pantry = typeof pantries.$inferSelect;
export type InsertPantry = z.infer<typeof insertPantrySchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;
