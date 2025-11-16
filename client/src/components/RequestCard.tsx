import { Clock, User, Package } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface RequestCardProps {
  id: string;
  userName: string;
  items: string[];
  status: "pending" | "accepted" | "declined" | "completed";
  timestamp: string;
  familySize?: number;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function RequestCard({
  id,
  userName,
  items,
  status,
  timestamp,
  familySize,
  onAccept,
  onDecline,
}: RequestCardProps) {
  const statusColors = {
    pending: "default",
    accepted: "default",
    declined: "destructive",
    completed: "secondary",
  } as const;

  return (
    <Card data-testid={`card-request-${id}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{userName}</h3>
              {familySize && (
                <p className="text-sm text-muted-foreground">
                  Family of {familySize}
                </p>
              )}
            </div>
          </div>
          <Badge variant={statusColors[status]} data-testid={`badge-status-${status}`}>
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" data-testid={`badge-item-${index}`}>
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timestamp}</span>
        </div>
      </CardContent>

      {status === "pending" && (
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onDecline?.(id)}
            data-testid="button-decline-request"
          >
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={() => onAccept?.(id)}
            data-testid="button-accept-request"
          >
            Accept
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
