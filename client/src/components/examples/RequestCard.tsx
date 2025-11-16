import { RequestCard } from "../RequestCard";

export default function RequestCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <RequestCard
        id="1"
        userName="Sarah Johnson"
        items={["Canned Goods", "Fresh Produce"]}
        status="pending"
        timestamp="5 minutes ago"
        familySize={4}
        onAccept={(id) => console.log("Accept:", id)}
        onDecline={(id) => console.log("Decline:", id)}
      />
      <RequestCard
        id="2"
        userName="Michael Chen"
        items={["Baby Formula", "Dairy"]}
        status="accepted"
        timestamp="1 hour ago"
        familySize={3}
      />
      <RequestCard
        id="3"
        userName="Anonymous User"
        items={["Bread & Bakery"]}
        status="completed"
        timestamp="2 days ago"
      />
    </div>
  );
}
