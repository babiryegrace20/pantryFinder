import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Clock, Phone, Mail, Package } from "lucide-react";
import type { Pantry, InventoryItem } from "@shared/schema";

interface PantryWithInventory extends Pantry {
  inventory?: InventoryItem[];
  address?: string;
}

export default function PantryDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { data: pantries, isLoading } = useQuery<PantryWithInventory[]>({
    queryKey: ["/api/pantries"],
  });

  const pantry = pantries?.find((p) => p.id === id);
  
  // Build address from pantry data
  const fullAddress = pantry 
    ? `${pantry.street}, ${pantry.city}, ${pantry.state} ${pantry.zip}`
    : "";
  
  // Format hours for display
  const hoursDisplay = pantry?.hours 
    ? Object.entries(pantry.hours).map(([day, time]) => `${day}: ${time}`).join(", ")
    : "Hours not available";
  
  // Transform user for Header component
  const headerUser = user && user.name 
    ? { name: user.name, role: user.role as "individual" | "pantry-admin" | "admin" }
    : null;

  const requestMutation = useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!user) throw new Error("Please sign in to make a request");
      
      setPendingItemId(item.id);
      
      return await apiRequest("POST", "/api/requests", {
        userId: user.id,
        pantryId: id,
        requestedItems: [{
          category: item.category,
          quantity: 1, // Default to requesting 1 unit
        }],
        status: "pending",
        needsDelivery: needsDelivery ? 1 : 0,
        deliveryAddress: needsDelivery ? deliveryAddress : null,
      });
    },
    onSuccess: () => {
      setPendingItemId(null);
      setNeedsDelivery(false);
      setDeliveryAddress("");
      toast({
        title: "Request Submitted",
        description: needsDelivery 
          ? "Your request with delivery assistance has been sent to the food pantry."
          : "Your request has been sent to the food pantry.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: Error) => {
      setPendingItemId(null);
      
      // If user not found, clear localStorage and redirect to login
      if (error.message.includes("User not found")) {
        localStorage.removeItem("food-pantry-user");
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/login"), 1500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRequestItem = (item: InventoryItem) => {
    requestMutation.mutate(item);
  };

  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          currentUser={headerUser}
          onGetHelp={() => console.log("Get help")}
          onSignOut={handleSignOut}
        />
        <div className="container px-4 md:px-6 py-8 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!pantry) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          currentUser={headerUser}
          onGetHelp={() => console.log("Get help")}
          onSignOut={handleSignOut}
        />
        <div className="container px-4 md:px-6 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Pantry Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The pantry you're looking for doesn't exist.</p>
              <Button
                className="mt-4"
                onClick={() => setLocation("/")}
                data-testid="button-go-back"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const inventory = pantry.inventory || [];
  const availableItems = inventory.filter((item) => item.quantity > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={headerUser}
        onGetHelp={() => console.log("Get help")}
      />
      
      <div className="container px-4 md:px-6 py-8 max-w-4xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            ← Back to Search
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl" data-testid="text-pantry-name">
                  {pantry.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span data-testid="text-pantry-address">{fullAddress}</span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span data-testid="text-pantry-hours">{hoursDisplay}</span>
            </div>

            {pantry.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${pantry.contactPhone}`}
                  className="text-primary hover:underline"
                  data-testid="link-pantry-phone"
                >
                  {pantry.contactPhone}
                </a>
              </div>
            )}

            {pantry.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a
                  href={`mailto:${pantry.contactEmail}`}
                  className="text-primary hover:underline"
                  data-testid="link-pantry-email"
                >
                  {pantry.contactEmail}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Items
            </CardTitle>
            <CardDescription>
              {availableItems.length > 0
                ? `${availableItems.length} items currently in stock`
                : "No items currently available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && user.role === "individual" && availableItems.length > 0 && (
              <div className="mb-6 p-4 border rounded-md space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="needs-delivery"
                    checked={needsDelivery}
                    onCheckedChange={setNeedsDelivery}
                    data-testid="switch-needs-delivery"
                  />
                  <Label htmlFor="needs-delivery" className="cursor-pointer">
                    I need delivery assistance
                  </Label>
                </div>
                
                {needsDelivery && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-address">Delivery Address</Label>
                    <Input
                      id="delivery-address"
                      placeholder="Enter your delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      data-testid="input-delivery-address"
                    />
                  </div>
                )}
              </div>
            )}

            {availableItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                This pantry has no items in stock at the moment. Please check back later.
              </p>
            ) : (
              <div className="space-y-3">
                {availableItems.map((item: InventoryItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`item-${item.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </h4>
                        {item.isSurplus && (
                          <Badge variant="secondary" className="text-xs">
                            Surplus
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {item.category}</span>
                        <span data-testid={`text-item-quantity-${item.id}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRequestItem(item)}
                      disabled={pendingItemId === item.id || !user}
                      data-testid={`button-request-${item.id}`}
                    >
                      {pendingItemId === item.id ? "Requesting..." : "Request"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
