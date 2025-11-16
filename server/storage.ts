import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Pantry,
  type InsertPantry,
  type Address,
  type InsertAddress,
  type InventoryItem,
  type InsertInventoryItem,
  type Request,
  type InsertRequest,
  type Donor,
  type InsertDonor,
  users,
  pantries,
  addresses,
  inventoryItems,
  requests,
  donors,
} from "@shared/schema";
import { eq, and, sql, inArray, desc, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Addresses
  getAddressesByUserId(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<void>;

  // Pantries
  getAllPantries(): Promise<Pantry[]>;
  getPantry(id: string): Promise<Pantry | undefined>;
  getPantriesByManager(managerId: string): Promise<Pantry[]>;
  createPantry(pantry: InsertPantry): Promise<Pantry>;
  updatePantry(id: string, pantry: Partial<InsertPantry>): Promise<Pantry | undefined>;
  searchPantries(params: {
    lat?: number;
    lon?: number;
    category?: string;
    isOpen?: boolean;
    hasSurplus?: boolean;
  }): Promise<(Pantry & { distance?: number })[]>;

  // Inventory
  getInventoryByPantry(pantryId: string): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<void>;

  // Requests
  getAllRequests(): Promise<Request[]>;
  getRequestsByUser(userId: string): Promise<Request[]>;
  getRequestsByPantry(pantryId: string): Promise<Request[]>;
  getRequest(id: string): Promise<Request | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequestStatus(id: string, status: string): Promise<Request | undefined>;
  updateRequest(id: string, request: Partial<InsertRequest>): Promise<Request | undefined>;
  getDeliveryRequestsByDate(pantryId: string, date: string): Promise<Request[]>;
  
  // Donors
  getDonorsByPantry(pantryId: string): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: string, donor: Partial<InsertDonor>): Promise<Donor | undefined>;
  deleteDonor(id: string): Promise<void>;
  
  // Low stock detection
  getLowStockItems(pantryId: string): Promise<InventoryItem[]>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  // Addresses
  async getAddressesByUserId(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return updated;
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Pantries
  async getAllPantries(): Promise<Pantry[]> {
    return await db.select().from(pantries).where(eq(pantries.status, "active"));
  }

  async getPantry(id: string): Promise<Pantry | undefined> {
    const [pantry] = await db.select().from(pantries).where(eq(pantries.id, id));
    return pantry;
  }

  async getPantriesByManager(managerId: string): Promise<Pantry[]> {
    return await db.select().from(pantries).where(eq(pantries.managerId, managerId));
  }

  async createPantry(pantry: InsertPantry): Promise<Pantry> {
    const [newPantry] = await db.insert(pantries).values(pantry).returning();
    return newPantry;
  }

  async updatePantry(id: string, pantry: Partial<InsertPantry>): Promise<Pantry | undefined> {
    const [updated] = await db.update(pantries).set(pantry).where(eq(pantries.id, id)).returning();
    return updated;
  }

  async searchPantries(params: {
    lat?: number;
    lon?: number;
    category?: string;
    isOpen?: boolean;
    hasSurplus?: boolean;
  }): Promise<(Pantry & { distance?: number })[]> {
    let query = db.select().from(pantries).where(eq(pantries.status, "active"));
    
    const allPantries = await query;
    
    // Calculate distances if lat/lon provided
    let results = allPantries.map(p => ({
      ...p,
      distance: params.lat && params.lon 
        ? this.calculateDistance(params.lat, params.lon, p.lat, p.lon)
        : undefined
    }));

    // Filter by category if needed
    if (params.category) {
      const pantryIds = await db
        .select({ pantryId: inventoryItems.pantryId })
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.category, params.category),
            eq(inventoryItems.status, "available")
          )
        );
      
      const pantryIdSet = new Set(pantryIds.map(p => p.pantryId));
      results = results.filter(p => pantryIdSet.has(p.id));
    }

    // Filter by surplus if needed
    if (params.hasSurplus) {
      const surplusPantryIds = await db
        .select({ pantryId: inventoryItems.pantryId })
        .from(inventoryItems)
        .where(eq(inventoryItems.isSurplus, 1));
      
      const surplusSet = new Set(surplusPantryIds.map(p => p.pantryId));
      results = results.filter(p => surplusSet.has(p.id));
    }

    // Sort by distance
    if (params.lat && params.lon) {
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return results;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Inventory
  async getInventoryByPantry(pantryId: string): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.pantryId, pantryId));
  }

  async getInventoryByPantryIds(pantryIds: string[]): Promise<InventoryItem[]> {
    if (pantryIds.length === 0) return [];
    return await db.select().from(inventoryItems).where(
      inArray(inventoryItems.pantryId, pantryIds)
    );
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updated] = await db
      .update(inventoryItems)
      .set({ ...item, lastUpdated: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  // Requests
  async getAllRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(desc(requests.createdAt));
  }

  async getRequestsByUser(userId: string): Promise<Request[]> {
    return await db.select().from(requests).where(eq(requests.userId, userId));
  }

  async getRequestsByPantry(pantryId: string): Promise<Request[]> {
    return await db.select().from(requests).where(eq(requests.pantryId, pantryId));
  }

  async getRequest(id: string): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [newRequest] = await db.insert(requests).values(request).returning();
    return newRequest;
  }

  async updateRequestStatus(id: string, status: string): Promise<Request | undefined> {
    const [updated] = await db
      .update(requests)
      .set({ status, updatedAt: new Date() })
      .where(eq(requests.id, id))
      .returning();
    return updated;
  }

  async updateRequest(id: string, request: Partial<InsertRequest>): Promise<Request | undefined> {
    const [updated] = await db
      .update(requests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(requests.id, id))
      .returning();
    return updated;
  }

  async getDeliveryRequestsByDate(pantryId: string, date: string): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.pantryId, pantryId),
          eq(requests.deliveryDate, date),
          eq(requests.needsDelivery, 1)
        )
      );
  }

  // Donors
  async getDonorsByPantry(pantryId: string): Promise<Donor[]> {
    return await db.select().from(donors).where(eq(donors.pantryId, pantryId));
  }

  async getDonor(id: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.id, id));
    return donor;
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
    const [newDonor] = await db.insert(donors).values(donor).returning();
    return newDonor;
  }

  async updateDonor(id: string, donor: Partial<InsertDonor>): Promise<Donor | undefined> {
    const [updated] = await db
      .update(donors)
      .set(donor)
      .where(eq(donors.id, id))
      .returning();
    return updated;
  }

  async deleteDonor(id: string): Promise<void> {
    await db.delete(donors).where(eq(donors.id, id));
  }

  // Low stock detection
  async getLowStockItems(pantryId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.pantryId, pantryId),
          sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`
        )
      );
  }
}

export const storage = new DbStorage();
