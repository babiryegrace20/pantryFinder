import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { InventoryTable, type InventoryItem } from "@/components/InventoryTable";
import { RequestCard } from "@/components/RequestCard";
import { Package, AlertCircle, Users, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockInventory: InventoryItem[] = [
  { id: "1", category: "Canned Goods", name: "Tomato Soup", quantity: 50, unit: "cans", expirationDate: "2025-06-30", status: "available" },
  { id: "2", category: "Fresh Produce", name: "Apples", quantity: 25, unit: "lbs", expirationDate: "2025-01-25", status: "available" },
  { id: "3", category: "Dairy", name: "Milk", quantity: 10, unit: "gallons", expirationDate: "2025-01-22", status: "reserved" },
  { id: "4", category: "Baby Formula", name: "Infant Formula", quantity: 15, unit: "cans", status: "available" },
  { id: "5", category: "Bread & Bakery", name: "Whole Wheat Bread", quantity: 30, unit: "loaves", expirationDate: "2025-01-24", status: "available" },
];

type RequestStatus = "pending" | "accepted" | "declined" | "completed";

interface Request {
  id: string;
  userName: string;
  items: string[];
  status: RequestStatus;
  timestamp: string;
  familySize: number;
}

const mockRequests: Request[] = [
  { id: "1", userName: "Sarah Johnson", items: ["Canned Goods", "Fresh Produce"], status: "pending", timestamp: "5 minutes ago", familySize: 4 },
  { id: "2", userName: "Michael Chen", items: ["Baby Formula", "Dairy"], status: "pending", timestamp: "1 hour ago", familySize: 3 },
  { id: "3", userName: "Emma Davis", items: ["Bread & Bakery"], status: "accepted", timestamp: "3 hours ago", familySize: 2 },
];

export default function PantryDashboard() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [inventory, setInventory] = useState(mockInventory);
  const [requests, setRequests] = useState(mockRequests);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAcceptRequest = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "accepted" as RequestStatus } : r)));
    console.log("Accept request:", id);
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "declined" as RequestStatus } : r)));
    console.log("Decline request:", id);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={{ name: "John Smith", role: "pantry-admin" }}
        onGetHelp={() => console.log("Get help")}
        onSignOut={handleSignOut}
      />

      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Pantry Dashboard</h1>
            <p className="text-muted-foreground">Manage your inventory and requests</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Items"
            value={inventory.reduce((sum, item) => sum + item.quantity, 0)}
            icon={Package}
          />
          <StatsCard
            title="Expiring Soon"
            value={inventory.filter((i) => i.expirationDate && new Date(i.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            icon={AlertCircle}
          />
          <StatsCard
            title="Active Requests"
            value={pendingRequests.length}
            icon={Users}
          />
          <StatsCard
            title="This Week"
            value={42}
            icon={TrendingUp}
            trend={{ value: 12, label: "vs last week" }}
          />
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Inventory Management</h2>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-inventory">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-add-item">
                  <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your pantry inventory
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="e.g., Canned Goods" data-testid="input-category" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input id="name" placeholder="e.g., Tomato Soup" data-testid="input-name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" placeholder="50" data-testid="input-quantity" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" placeholder="cans" data-testid="input-unit" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                      <Input id="expiration" type="date" data-testid="input-expiration" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="available">
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={() => setShowAddDialog(false)} data-testid="button-save-item">
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <InventoryTable
              items={inventory}
              onEdit={(item) => {
                setInventory(inventory.map((i) => (i.id === item.id ? item : i)));
                console.log("Edit item:", item);
              }}
              onDelete={(id) => {
                setInventory(inventory.filter((i) => i.id !== id));
                console.log("Delete item:", id);
              }}
            />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  {...request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </div>
            {requests.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground">
                  Requests from individuals will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
