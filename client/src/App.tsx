import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/Home";
import PantryDetail from "@/pages/PantryDetail";
import PantryDashboard from "@/pages/PantryDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import DeliveryDashboard from "@/pages/DeliveryDashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pantries/:id" component={PantryDetail} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/pantry-dashboard" component={PantryDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/delivery-dashboard" component={DeliveryDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
