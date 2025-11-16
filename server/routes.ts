import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIO } from "socket.io";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertPantrySchema,
  insertInventoryItemSchema,
  insertRequestSchema,
  insertAddressSchema,
  insertDonorSchema,
} from "@shared/schema";
import { z } from "zod";
import { generateDonorNotification } from "./ai";

// Simple session type
interface UserSession {
  userId: string;
  role: string;
}

// Extend Express Request to include session
declare module "express-serve-static-core" {
  interface Request {
    session?: UserSession;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIO(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Simple session middleware (in production, use proper session management)
  app.use((req, res, next) => {
    const userId = req.headers["x-user-id"] as string;
    const role = req.headers["x-user-role"] as string;
    if (userId && role) {
      req.session = { userId, role };
    }
    next();
  });

  // WebSocket connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-pantry", (pantryId: string) => {
      socket.join(`pantry-${pantryId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Helper to broadcast inventory updates
  const broadcastInventoryUpdate = (pantryId: string, data: any) => {
    io.to(`pantry-${pantryId}`).emit("inventory-update", data);
  };

  // ===== AUTH ROUTES =====
  
  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create/login user by email (simplified for demo)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, name, role } = req.body;
      
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        const userData = insertUserSchema.parse({ email, name, role: role || "individual" });
        user = await storage.createUser(userData);
      }

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== PANTRY ROUTES =====
  
  // Search pantries
  app.get("/api/pantries", async (req: Request, res: Response) => {
    try {
      const { lat, lon, category, isOpen, hasSurplus } = req.query;
      
      const params = {
        lat: lat ? parseFloat(lat as string) : undefined,
        lon: lon ? parseFloat(lon as string) : undefined,
        category: category as string,
        isOpen: isOpen === "true",
        hasSurplus: hasSurplus === "true",
      };

      const pantries = await storage.searchPantries(params);
      
      // Fetch all inventory in one query
      const pantryIds = pantries.map(p => p.id);
      const allInventory = await storage.getInventoryByPantryIds(pantryIds);
      
      // Group inventory by pantry ID
      const inventoryByPantry = allInventory.reduce((acc, item) => {
        if (!acc[item.pantryId]) {
          acc[item.pantryId] = [];
        }
        acc[item.pantryId].push(item);
        return acc;
      }, {} as Record<string, typeof allInventory>);
      
      // Attach inventory to each pantry (always an array)
      const pantriesWithInventory = pantries.map(pantry => ({
        ...pantry,
        inventory: inventoryByPantry[pantry.id] || [],
      }));

      res.json(pantriesWithInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single pantry
  app.get("/api/pantries/:id", async (req: Request, res: Response) => {
    try {
      const pantry = await storage.getPantry(req.params.id);
      if (!pantry) {
        return res.status(404).json({ error: "Pantry not found" });
      }
      res.json(pantry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create pantry (admin only)
  app.post("/api/pantries", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pantryData = insertPantrySchema.parse(req.body);
      const pantry = await storage.createPantry(pantryData);
      res.status(201).json(pantry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update pantry
  app.put("/api/pantries/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pantry = await storage.updatePantry(req.params.id, req.body);
      if (!pantry) {
        return res.status(404).json({ error: "Pantry not found" });
      }
      res.json(pantry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== INVENTORY ROUTES =====
  
  // Get pantry inventory
  app.get("/api/pantries/:pantryId/inventory", async (req: Request, res: Response) => {
    try {
      const items = await storage.getInventoryByPantry(req.params.pantryId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add inventory item
  app.post("/api/pantries/:pantryId/inventory", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const itemData = insertInventoryItemSchema.parse({
        ...req.body,
        pantryId: req.params.pantryId,
      });
      
      const item = await storage.createInventoryItem(itemData);
      
      // Broadcast update
      broadcastInventoryUpdate(req.params.pantryId, {
        type: "item-added",
        item,
      });

      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update inventory item
  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const item = await storage.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Broadcast update
      broadcastInventoryUpdate(item.pantryId, {
        type: "item-updated",
        item,
      });

      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete inventory item
  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      await storage.deleteInventoryItem(req.params.id);

      // Broadcast update
      broadcastInventoryUpdate(item.pantryId, {
        type: "item-deleted",
        itemId: req.params.id,
      });

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== REQUEST ROUTES =====
  
  // Get all requests (admin only)
  app.get("/api/requests", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const requests = await storage.getAllRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's requests
  app.get("/api/requests/user/:userId", async (req: Request, res: Response) => {
    try {
      const requests = await storage.getRequestsByUser(req.params.userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pantry's requests
  app.get("/api/requests/pantry/:pantryId", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const requests = await storage.getRequestsByPantry(req.params.pantryId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create request
  app.post("/api/requests", async (req: Request, res: Response) => {
    try {
      const requestData = insertRequestSchema.parse(req.body);
      
      // Verify user exists
      const user = await storage.getUser(requestData.userId);
      if (!user) {
        return res.status(400).json({ error: "User not found. Please log in again." });
      }
      
      // Verify pantry exists
      const pantry = await storage.getPantry(requestData.pantryId);
      if (!pantry) {
        return res.status(400).json({ error: "Pantry not found" });
      }
      
      const request = await storage.createRequest(requestData);
      
      // Notify pantry about new request
      io.to(`pantry-${request.pantryId}`).emit("new-request", request);

      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update request status
  app.put("/api/requests/:id/status", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { status } = req.body;
      const request = await storage.updateRequestStatus(req.params.id, status);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      // Notify user about status change
      io.emit(`request-update-${request.userId}`, request);

      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update request (for delivery status)
  app.patch("/api/requests/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const request = await storage.updateRequest(req.params.id, req.body);
      
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get delivery requests by date
  app.get("/api/deliveries/:date", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pantryId = req.query.pantryId as string;
      if (!pantryId) {
        return res.status(400).json({ error: "pantryId is required" });
      }

      const deliveries = await storage.getDeliveryRequestsByDate(pantryId, req.params.date);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== USER PROFILE ROUTES =====
  
  // Get user profile
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user profile
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user addresses
  app.get("/api/users/:userId/addresses", async (req: Request, res: Response) => {
    try {
      const addresses = await storage.getAddressesByUserId(req.params.userId);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add address
  app.post("/api/addresses", async (req: Request, res: Response) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(addressData);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update address
  app.put("/api/addresses/:id", async (req: Request, res: Response) => {
    try {
      const address = await storage.updateAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.json(address);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete address
  app.delete("/api/addresses/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteAddress(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== DONOR ROUTES =====

  // Get donors by pantry
  app.get("/api/pantries/:pantryId/donors", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const donors = await storage.getDonorsByPantry(req.params.pantryId);
      res.json(donors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create donor
  app.post("/api/donors", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const donorData = insertDonorSchema.parse(req.body);
      const donor = await storage.createDonor(donorData);
      res.status(201).json(donor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update donor
  app.put("/api/donors/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const donor = await storage.updateDonor(req.params.id, req.body);
      if (!donor) {
        return res.status(404).json({ error: "Donor not found" });
      }
      res.json(donor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete donor
  app.delete("/api/donors/:id", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteDonor(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check low stock and notify donors (AI-powered)
  app.post("/api/pantries/:pantryId/notify-donors", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin" && req.session?.role !== "pantry-admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pantryId = req.params.pantryId;
      const pantry = await storage.getPantry(pantryId);
      if (!pantry) {
        return res.status(404).json({ error: "Pantry not found" });
      }

      const lowStockItems = await storage.getLowStockItems(pantryId);
      if (lowStockItems.length === 0) {
        return res.json({ message: "No low stock items found", notificationsSent: 0 });
      }

      const donors = await storage.getDonorsByPantry(pantryId);
      const activeDonors = donors.filter(d => d.status === "active");

      if (activeDonors.length === 0) {
        return res.json({ message: "No active donors found", notificationsSent: 0 });
      }

      const notifications = [];
      for (const donor of activeDonors) {
        const relevantItems = donor.preferredCategories && donor.preferredCategories.length > 0
          ? lowStockItems.filter(item => donor.preferredCategories!.includes(item.category))
          : lowStockItems;

        if (relevantItems.length > 0) {
          const message = await generateDonorNotification(
            pantry.name,
            relevantItems,
            donor
          );
          notifications.push({
            donorId: donor.id,
            donorEmail: donor.email,
            message,
          });
        }
      }

      res.json({
        message: `Generated ${notifications.length} donor notifications`,
        notifications,
        notificationsSent: notifications.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Get system statistics
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    try {
      if (req.session?.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const pantries = await storage.getAllPantries();
      
      // Calculate aggregate stats
      let totalItems = 0;
      let surplusItems = 0;

      for (const pantry of pantries) {
        const inventory = await storage.getInventoryByPantry(pantry.id);
        totalItems += inventory.reduce((sum, item) => sum + item.quantity, 0);
        surplusItems += inventory.filter(item => item.isSurplus).length;
      }

      res.json({
        activePantries: pantries.length,
        totalItems,
        surplusItems,
        // More stats can be added here
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
