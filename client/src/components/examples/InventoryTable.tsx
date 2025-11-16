import { InventoryTable, type InventoryItem } from "../InventoryTable";

const mockItems: InventoryItem[] = [
  { id: "1", category: "Canned Goods", name: "Tomato Soup", quantity: 50, unit: "cans", expirationDate: "2025-06-30", status: "available" },
  { id: "2", category: "Fresh Produce", name: "Apples", quantity: 25, unit: "lbs", expirationDate: "2025-01-25", status: "available" },
  { id: "3", category: "Dairy", name: "Milk", quantity: 10, unit: "gallons", expirationDate: "2025-01-22", status: "reserved" },
  { id: "4", category: "Baby Formula", name: "Infant Formula", quantity: 15, unit: "cans", status: "available" },
];

export default function InventoryTableExample() {
  return (
    <div className="p-6">
      <InventoryTable
        items={mockItems}
        onEdit={(item) => console.log("Edit:", item)}
        onDelete={(id) => console.log("Delete:", id)}
      />
    </div>
  );
}
