import { MapPin, Clock, Package, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PantryCardProps {
  id: string;
  name: string;
  distance?: number;
  address: string;
  isOpen: boolean;
  hours: string;
  availableCategories: string[];
  hasSurplus?: boolean;
  closingSoon?: boolean;
  onViewDetails?: (id: string) => void;
  onRequest?: (id: string) => void;
}

export function PantryCard({
  id,
  name,
  distance,
  address,
  isOpen,
  hours,
  availableCategories,
  hasSurplus,
  closingSoon,
  onViewDetails,
  onRequest,
}: PantryCardProps) {
  return (
    <Card className="hover-elevate overflow-visible" data-testid={`card-pantry-${id}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-medium line-clamp-2">{name}</h3>
          <div className="flex flex-col items-end gap-1">
            {distance !== undefined && (
              <div className="text-2xl font-bold text-primary" data-testid="text-distance">
                {distance.toFixed(1)} mi
              </div>
            )}
            {hasSurplus && (
              <Badge variant="default" className="whitespace-nowrap" data-testid="badge-surplus">
                Surplus Available
              </Badge>
            )}
            {closingSoon && (
              <Badge variant="destructive" className="whitespace-nowrap gap-1" data-testid="badge-closing">
                <AlertCircle className="h-3 w-3" />
                Closes Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{address}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className={isOpen ? "text-primary font-medium" : "text-muted-foreground"}>
            {isOpen ? "Open" : "Closed"} · {hours}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {availableCategories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" data-testid={`badge-category-${category}`}>
                {category}
              </Badge>
            ))}
            {availableCategories.length > 3 && (
              <Badge variant="secondary">+{availableCategories.length - 3} more</Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetails?.(id)}
          data-testid="button-view-details"
        >
          View Details
        </Button>
        <Button
          className="flex-1"
          onClick={() => onRequest?.(id)}
          data-testid="button-request-items"
        >
          Request Items
        </Button>
      </CardFooter>
    </Card>
  );
}
