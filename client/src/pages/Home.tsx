import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { PantryCard } from "@/components/PantryCard";
import { FilterPanel } from "@/components/FilterPanel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Search, Package, MapPin } from "lucide-react";
import type { Pantry, InventoryItem } from "@shared/schema";
import { isPantryOpen, getTodayHours } from "@/lib/pantryHours";

// Haversine formula to calculate distance between two points (in miles)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface PantryWithInventory extends Pantry {
  inventory?: InventoryItem[];
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showSurplusOnly, setShowSurplusOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { data: pantries = [], isLoading } = useQuery<PantryWithInventory[]>({
    queryKey: ["/api/pantries"],
  });

  // Calculate distances and add to pantries if user location is available
  const pantriesWithDistance = pantries.map((pantry) => ({
    ...pantry,
    distance: (userLocation && pantry.lat && pantry.lon)
      ? calculateDistance(userLocation.lat, userLocation.lon, pantry.lat, pantry.lon)
      : null
  }));

  // Filter pantries
  const filteredPantries = pantriesWithDistance.filter((pantry) => {
    if (showOpenOnly && !isPantryOpen(pantry.hours as any)) {
      return false;
    }
    
    if (selectedCategories.length > 0) {
      if (!pantry.inventory || pantry.inventory.length === 0) return false;
      const hasCategory = selectedCategories.some((cat) =>
        pantry.inventory!.some((item) => item.category === cat)
      );
      if (!hasCategory) return false;
    }
    
    if (showSurplusOnly) {
      if (!pantry.inventory || pantry.inventory.length === 0) return false;
      const hasSurplus = pantry.inventory.some((item) => item.isSurplus === 1);
      if (!hasSurplus) return false;
    }
    
    return true;
  });

  // Sort by distance if available, otherwise by name
  const sortedPantries = [...filteredPantries].sort((a, b) => {
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });

  const handleGetHelp = () => {
    if (!user) {
      setLocation("/login");
    } else {
      setLocation("/");
    }
  };

  const handleSignIn = () => {
    if (user) {
      if (user.role === "pantry-admin") {
        setLocation("/pantry-dashboard");
      } else if (user.role === "admin") {
        setLocation("/admin-dashboard");
      }
    } else {
      setLocation("/login");
    }
  };

  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  const handleViewDetails = (id: string) => {
    setLocation(`/pantries/${id}`);
  };

  const handleRequest = (id: string) => {
    if (!user) {
      setLocation("/login");
    } else {
      setLocation(`/pantries/${id}`);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        toast({
          title: "Location Found",
          description: "Showing pantries near you, sorted by distance.",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentUser={user && user.name ? { name: user.name, role: user.role as "individual" | "pantry-admin" | "admin" } : null}
        onGetHelp={handleGetHelp} 
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/80" />
        <div className="relative container px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Find Food Assistance Near You
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with local food pantries showing real-time availability
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Live Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{pantries.length} Pantries</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Real-time Inventory</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <SearchBar
            onSearch={(location) => console.log("Search:", location)}
            onUseMyLocation={handleUseMyLocation}
          />
          {isGettingLocation && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Getting your location...
            </p>
          )}
          {userLocation && (
            <p className="text-center text-sm text-primary mt-2 flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Showing pantries near your location (sorted by distance)</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <FilterPanel
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              showOpenOnly={showOpenOnly}
              onOpenOnlyChange={setShowOpenOnly}
              showSurplusOnly={showSurplusOnly}
              onSurplusOnlyChange={setShowSurplusOnly}
              onReset={() => {
                setSelectedCategories([]);
                setShowOpenOnly(false);
                setShowSurplusOnly(false);
              }}
            />
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-semibold">
                {isLoading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  `${sortedPantries.length} Pantries Found`
                )}
              </h2>
              {(selectedCategories.length > 0 || showOpenOnly || showSurplusOnly) && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((cat) => (
                    <Badge key={cat} variant="secondary" data-testid={`badge-category-${cat}`}>
                      {cat}
                    </Badge>
                  ))}
                  {showOpenOnly && <Badge variant="secondary">Open Now</Badge>}
                  {showSurplusOnly && <Badge variant="secondary">Surplus</Badge>}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedPantries.map((pantry) => {
                    const categories = pantry.inventory
                      ? Array.from(new Set(pantry.inventory.map((item) => item.category)))
                      : [];
                    const hasSurplus = pantry.inventory?.some((item) => item.isSurplus === 1) || false;
                    const isOpen = isPantryOpen(pantry.hours as any);
                    const todayHours = getTodayHours(pantry.hours as any);
                    
                    return (
                      <PantryCard
                        key={pantry.id}
                        id={pantry.id}
                        name={pantry.name}
                        distance={pantry.distance !== null ? pantry.distance : undefined}
                        address={`${pantry.street}, ${pantry.city}, ${pantry.state} ${pantry.zip}`}
                        isOpen={isOpen}
                        hours={todayHours}
                        availableCategories={categories}
                        hasSurplus={hasSurplus}
                        onViewDetails={handleViewDetails}
                        onRequest={handleRequest}
                      />
                    );
                  })}
                </div>

                {sortedPantries.length === 0 && !isLoading && (
                  <div className="text-center py-12" data-testid="text-no-pantries">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No pantries found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search in a different area
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
