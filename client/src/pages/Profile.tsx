import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, MapPin, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Address } from "@shared/schema";

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Halal",
  "Kosher",
];

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  familySize: z.number().min(1, "Family size must be at least 1").optional().nullable(),
  dietaryRestrictions: z.array(z.string()).optional().nullable(),
});

const addressFormSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  zip: z.string().length(5, "ZIP must be 5 digits"),
  isDefault: z.number().default(0),
});

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/users", user?.id],
    enabled: !!user?.id,
  });

  const { data: addresses = [] } = useQuery<Address[]>({
    queryKey: ["/api/users", user?.id, "addresses"],
    enabled: !!user?.id,
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      familySize: null,
      dietaryRestrictions: [],
    },
  });

  useEffect(() => {
    if (userData) {
      profileForm.reset({
        name: userData.name || "",
        familySize: userData.familySize ?? null,
        dietaryRestrictions: userData.dietaryRestrictions || [],
      });
      if (userData.dietaryRestrictions) {
        setSelectedRestrictions(userData.dietaryRestrictions);
      }
    }
  }, [userData, profileForm]);

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zip: "",
      isDefault: 0,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return await apiRequest(`/api/users/${user?.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addressFormSchema>) => {
      return await apiRequest("/api/addresses", "POST", {
        ...data,
        userId: user?.id,
        lat: null,
        lon: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "addresses"] });
      setIsAddressDialogOpen(false);
      addressForm.reset();
      toast({
        title: "Address added",
        description: "Your address has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return await apiRequest(`/api/addresses/${addressId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "addresses"] });
      toast({
        title: "Address deleted",
        description: "Your address has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate({
      ...data,
      dietaryRestrictions: selectedRestrictions.length > 0 ? selectedRestrictions : null,
    });
  };

  const onAddressSubmit = (data: z.infer<typeof addressFormSchema>) => {
    createAddressMutation.mutate(data);
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSignOut = () => {
    logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          currentUser={null}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Not Logged In
              </CardTitle>
              <CardDescription>
                Please log in to view your profile.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        currentUser={user && user.name ? { name: user.name, role: user.role as "individual" | "pantry-admin" | "admin" } : null}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-profile-title">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and addresses
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Enter your name"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="familySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Family Size
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsed = value === '' ? null : parseInt(value);
                              field.onChange(parsed);
                            }}
                            data-testid="input-family-size"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Dietary Restrictions</Label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_RESTRICTIONS.map((restriction) => (
                        <Badge
                          key={restriction}
                          variant={selectedRestrictions.includes(restriction) ? "default" : "outline"}
                          className="cursor-pointer hover-elevate active-elevate-2"
                          onClick={() => toggleRestriction(restriction)}
                          data-testid={`badge-restriction-${restriction.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
                <CardDescription>
                  Manage your saved addresses
                </CardDescription>
              </div>
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-address">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                    <DialogDescription>
                      Add a new address to your profile
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addressForm}>
                    <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                      <FormField
                        control={addressForm.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="123 Main St" data-testid="input-street" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addressForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City" data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addressForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="IN" maxLength={2} data-testid="input-state" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={addressForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="46601" maxLength={5} data-testid="input-zip" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={createAddressMutation.isPending}
                        data-testid="button-submit-address"
                      >
                        {createAddressMutation.isPending ? "Adding..." : "Add Address"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-addresses">
                  No addresses added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`card-address-${address.id}`}
                    >
                      <div>
                        <p className="font-medium" data-testid={`text-address-street-${address.id}`}>
                          {address.street}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-address-city-${address.id}`}>
                          {address.city}, {address.state} {address.zip}
                        </p>
                        {address.isDefault === 1 && (
                          <Badge variant="secondary" className="mt-2">
                            Default
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAddressMutation.mutate(address.id)}
                        disabled={deleteAddressMutation.isPending}
                        data-testid={`button-delete-address-${address.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
