import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InventoryItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  status: "available" | "reserved" | "claimed";
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onEdit?.({ ...editForm, id: editingId } as InventoryItem);
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
              {editingId === item.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="h-8"
                      data-testid="input-edit-category"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="h-8"
                      data-testid="input-edit-name"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                        className="h-8 w-20"
                        data-testid="input-edit-quantity"
                      />
                      <Input
                        value={editForm.unit}
                        onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                        className="h-8 w-20"
                        data-testid="input-edit-unit"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={editForm.expirationDate}
                      onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })}
                      className="h-8"
                      data-testid="input-edit-expiration"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
                    >
                      <SelectTrigger className="h-8" data-testid="select-edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="claimed">Claimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={saveEdit} data-testid="button-save-edit">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} data-testid="button-cancel-edit">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.expirationDate || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "available" ? "default" : "secondary"}
                      data-testid={`badge-status-${item.status}`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(item)}
                        data-testid="button-edit-item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete?.(item.id)}
                        data-testid="button-delete-item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
