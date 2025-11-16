import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Store, Package, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Pantry, InventoryItem, Request } from "@shared/schema";

interface PantryWithInventory extends Pantry {
  inventory?: InventoryItem[];
}

interface AdminStats {
  activePantries: number;
  totalItems: number;
  surplusItems: number;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === "admin",
  });

  const { data: pantries = [], isLoading: pantriesLoading } = useQuery<PantryWithInventory[]>({
    queryKey: ["/api/pantries"],
  });

  const { data: allRequests = [] } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
    enabled: user?.role === "admin",
  });

  // Calculate weekly requests (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyRequests = allRequests.filter(
    req => new Date(req.createdAt) >= weekAgo
  ).length;

  // Calculate category stats from all pantries
  const categoryStats = pantries.reduce((acc, pantry) => {
    pantry.inventory?.forEach(item => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: stats && stats.totalItems > 0 ? Math.round((count / stats.totalItems) * 100) : 0,
    }));
  
  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  // Redirect if not admin
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={user && user.name ? { name: user.name, role: user.role as "individual" | "pantry-admin" | "admin" } : null}
        onGetHelp={() => console.log("Get help")}
        onSignOut={handleSignOut}
      />

      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatsCard
                title="Active Pantries"
                value={stats?.activePantries || 0}
                icon={Store}
                data-testid="stat-active-pantries"
              />
              <StatsCard
                title="Total Items"
                value={stats?.totalItems || 0}
                icon={Package}
                data-testid="stat-total-items"
              />
              <StatsCard
                title="Surplus Items"
                value={stats?.surplusItems || 0}
                icon={AlertCircle}
                data-testid="stat-surplus-items"
              />
              <StatsCard
                title="Weekly Requests"
                value={weeklyRequests}
                icon={TrendingUp}
                data-testid="stat-weekly-requests"
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pantry Network</CardTitle>
          </CardHeader>
          <CardContent>
            {pantriesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pantries.map((pantry) => {
                    const itemCount = pantry.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    return (
                      <TableRow key={pantry.id} data-testid={`row-pantry-${pantry.id}`}>
                        <TableCell className="font-medium" data-testid={`text-pantry-name-${pantry.id}`}>
                          {pantry.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {pantry.city}, {pantry.state}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pantry.status === "active" ? "default" : "secondary"} data-testid="badge-status">
                            {pantry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-item-count-${pantry.id}`}>
                          {itemCount}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Food Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {pantriesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ) : topCategories.length > 0 ? (
                <div className="space-y-3">
                  {topCategories.map((category) => (
                    <div key={category.name} className="space-y-2" data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-muted-foreground">{category.count} items</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No inventory data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {allRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent requests</p>
              ) : (
                <div className="space-y-4">
                  {allRequests.slice(0, 5).map((request) => {
                    const pantry = pantries.find(p => p.id === request.pantryId);
                    const timeAgo = getTimeAgo(new Date(request.createdAt));
                    return (
                      <div key={request.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0" data-testid={`request-${request.id}`}>
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Request {request.status}</p>
                          <p className="text-sm text-muted-foreground">{pantry?.name || "Unknown pantry"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
