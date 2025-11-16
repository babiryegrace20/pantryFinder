import { PantryCard } from "../PantryCard";

export default function PantryCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <PantryCard
        id="1"
        name="St. Joseph Community Food Pantry"
        distance={1.2}
        address="123 Main St, South Bend, IN 46601"
        isOpen={true}
        hours="9:00 AM - 5:00 PM"
        availableCategories={["Canned Goods", "Fresh Produce", "Dairy"]}
        hasSurplus={true}
        onViewDetails={(id) => console.log("View details:", id)}
        onRequest={(id) => console.log("Request from:", id)}
      />
      <PantryCard
        id="2"
        name="Hope Center Food Distribution"
        distance={2.5}
        address="456 Oak Ave, Mishawaka, IN 46545"
        isOpen={true}
        hours="10:00 AM - 6:00 PM"
        availableCategories={["Baby Formula", "Canned Goods", "Bread", "Meat"]}
        closingSoon={true}
        onViewDetails={(id) => console.log("View details:", id)}
        onRequest={(id) => console.log("Request from:", id)}
      />
      <PantryCard
        id="3"
        name="Community Harvest"
        distance={3.8}
        address="789 Elm St, South Bend, IN 46617"
        isOpen={false}
        hours="Opens at 8:00 AM tomorrow"
        availableCategories={["Fresh Produce", "Frozen Items"]}
        onViewDetails={(id) => console.log("View details:", id)}
        onRequest={(id) => console.log("Request from:", id)}
      />
    </div>
  );
}
