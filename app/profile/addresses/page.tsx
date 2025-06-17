"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, MapPin, Phone, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addressApi, Address } from "@/lib/api/addresses";
import { useAuth } from "@/lib/context/AuthContext";
import AddressForm from "@/components/address/UserAddressForm";
import AuthDebug from "@/components/debug/AuthDebug";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  const loadAddresses = async () => {
    try {
      setLoading(true);

      // Debug authentication status
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      console.log("Debug - Auth status:", {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
        tokenPreview: token ? token.substring(0, 20) + "..." : null,
      });

      if (!isAuthenticated || !token) {
        console.log("No authentication found, redirecting to login");
        router.push("/auth/login");
        return;
      }
      const data = await addressApi.getAddresses();
      console.log("Addresses API response:", data);
      console.log("Is addresses data an array?", Array.isArray(data));

      if (Array.isArray(data)) {
        setAddresses(data);
      } else {
        console.error("Addresses API returned non-array data:", data);
        setAddresses([]);
      }
    } catch (error: any) {
      console.error("Failed to load addresses:", error);

      // Handle authentication errors
      if (error?.response?.status === 401) {
        console.log("Authentication failed, redirecting to login");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/auth/login");
        return;
      }
      toast.error("Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses(); // Reload to update default status      toast.success("Default address updated successfully.");
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast.error("Failed to set default address. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingAddress) return;

    try {
      await addressApi.deleteAddress(deletingAddress.id);
      setAddresses(addresses.filter((addr) => addr.id !== deletingAddress.id));
      setDeletingAddress(null);
      toast.success("Address deleted successfully.");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };
  const handleFormSuccess = (address: Address) => {
    console.log("Address saved:", address);
    loadAddresses();
    setShowAddForm(false);
    setEditingAddress(null);
  };
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAddresses();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Addresses</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Authentication - Remove in production */}
      <AuthDebug />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Addresses</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No addresses found
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Add your first address to get started with faster checkout.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(addresses) &&
            addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {address.recipientName}
                      </CardTitle>
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAddress(address)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingAddress(address)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {address.phoneNumber}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{address.streetAddress}</div>
                        <div>
                          {address.ward}, {address.district}, {address.province}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!address.isDefault && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Set as Default
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Add Address Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>{" "}
          <AddressForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog
        open={!!editingAddress}
        onOpenChange={() => setEditingAddress(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>{" "}
          {editingAddress && (
            <AddressForm
              initialData={editingAddress}
              mode="edit"
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingAddress(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddress}
        onOpenChange={() => setDeletingAddress(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
              {deletingAddress?.isDefault && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  <strong>Warning:</strong> This is your default address. You
                  may want to set another address as default before deleting
                  this one.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
