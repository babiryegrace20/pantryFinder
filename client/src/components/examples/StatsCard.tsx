import { Store, Package, AlertCircle, TrendingUp } from "lucide-react";
import { StatsCard } from "../StatsCard";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      <StatsCard title="Active Pantries" value={23} icon={Store} trend={{ value: 8, label: "vs last month" }} />
      <StatsCard title="Total Items" value={1247} icon={Package} trend={{ value: 15, label: "vs last week" }} />
      <StatsCard title="Expiring Soon" value={34} icon={AlertCircle} />
      <StatsCard title="Weekly Requests" value={156} icon={TrendingUp} trend={{ value: 12, label: "vs last week" }} />
    </div>
  );
}
