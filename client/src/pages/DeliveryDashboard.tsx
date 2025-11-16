import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Truck, MapPin, Calendar, Package } from "lucide-react";
import type { Request } from "@shared/schema";

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: pantries } = useQuery<any[]>({
    queryKey: ["/api/pantries"],
    enabled: user?.role === "pantry-admin",
  });

  const userPantryId = user?.role === "pantry-admin" 
    ? pantries?.find((p: any) => p.managerId === user.id)?.id
    : null;

  const { data: deliveries, isLoading } = useQuery<Request[]>({
    queryKey: ["/api/deliveries", selectedDate, userPantryId],
    queryFn: async () => {
      if (!userPantryId) return [];
      const res = await fetch(`/api/deliveries/${selectedDate}?pantryId=${userPantryId}`, {
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      return res.json();
    },
    enabled: (user?.role === "pantry-admin" || user?.role === "admin") && !!userPantryId,
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ id, deliveryStatus }: { id: string; deliveryStatus: string }) => {
      return await apiRequest("PATCH", `/api/requests/${id}`, {
        deliveryStatus,
      });
    },
    onSuccess: () => {
      toast({
        title: "Delivery Updated",
        description: "Delivery status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries", selectedDate, userPantryId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const headerUser = user && user.name
    ? { name: user.name, role: user.role as "individual" | "pantry-admin" | "admin" }
    : null;

  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  if (user?.role !== "pantry-admin" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header currentUser={headerUser} onGetHelp={() => console.log("Get help")} onSignOut={handleSignOut} />
        <div className="container px-4 md:px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Only pantry administrators can access the delivery dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const scheduledDeliveries = deliveries?.filter(d => d.deliveryStatus === "scheduled") || [];
  const inTransitDeliveries = deliveries?.filter(d => d.deliveryStatus === "in_transit") || [];
  const completedDeliveries = deliveries?.filter(d => d.deliveryStatus === "delivered") || [];

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={headerUser} onGetHelp={() => console.log("Get help")} />
      
      <div className="container px-4 md:px-6 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Volunteer Delivery Dashboard</h1>
          <p className="text-muted-foreground">
            Manage daily food delivery requests from parish volunteers
          </p>
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="input-delivery-date"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{scheduledDeliveries.length}</div>
                    <div className="text-xs text-muted-foreground">Scheduled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{inTransitDeliveries.length}</div>
                    <div className="text-xs text-muted-foreground">In Transit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{completedDeliveries.length}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : deliveries && deliveries.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} data-testid={`delivery-card-${delivery.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      <CardTitle className="text-base">Delivery Request</CardTitle>
                    </div>
                    <Badge
                      variant={
                        delivery.deliveryStatus === "delivered" ? "default" :
                        delivery.deliveryStatus === "in_transit" ? "secondary" :
                        "outline"
                      }
                      data-testid={`badge-status-${delivery.id}`}
                    >
                      {delivery.deliveryStatus === "delivered" ? "Delivered" :
                       delivery.deliveryStatus === "in_transit" ? "In Transit" :
                       delivery.deliveryStatus === "scheduled" ? "Scheduled" :
                       "Not Scheduled"}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    Request ID: {delivery.id.slice(0, 8)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span data-testid={`text-address-${delivery.id}`}>
                      {delivery.deliveryAddress || "Address not provided"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Package className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="space-y-1">
                      {delivery.requestedItems.map((item, idx) => (
                        <div key={idx}>
                          {item.category} {item.quantity ? `(${item.quantity})` : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {delivery.deliveryStatus === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryMutation.mutate({ id: delivery.id, deliveryStatus: "in_transit" })}
                        disabled={updateDeliveryMutation.isPending}
                        data-testid={`button-start-${delivery.id}`}
                      >
                        Start Delivery
                      </Button>
                    )}
                    {delivery.deliveryStatus === "in_transit" && (
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryMutation.mutate({ id: delivery.id, deliveryStatus: "delivered" })}
                        disabled={updateDeliveryMutation.isPending}
                        data-testid={`button-complete-${delivery.id}`}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No deliveries scheduled for {new Date(selectedDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
