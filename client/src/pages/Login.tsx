import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"individual" | "pantry-admin" | "admin">("individual");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, name, role);
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      
      if (role === "pantry-admin") {
        setLocation("/pantry-dashboard");
      } else if (role === "admin") {
        setLocation("/admin-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Food Pantry Finder</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual" data-testid="option-individual">Individual</SelectItem>
                  <SelectItem value="pantry-admin" data-testid="option-pantry-admin">Pantry Admin</SelectItem>
                  <SelectItem value="admin" data-testid="option-admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Quick Access (Demo)
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("user@example.com");
                  setName("Jane Doe");
                  setRole("individual");
                }}
                data-testid="button-demo-individual"
              >
                Demo: Individual User
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("pantry@example.com");
                  setName("John Smith");
                  setRole("pantry-admin");
                }}
                data-testid="button-demo-pantry"
              >
                Demo: Pantry Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("admin@example.com");
                  setName("Admin User");
                  setRole("admin");
                }}
                data-testid="button-demo-admin"
              >
                Demo: System Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
