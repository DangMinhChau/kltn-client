"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { addressApi, Address } from "@/lib/api/addresses";
import GuestAddressForm, { GuestAddressData } from "./GuestAddressForm";

interface AddressSelectorProps {
  onAddressSelect: (address: Address | GuestAddressData) => void;
  selectedAddress?: Address | GuestAddressData | null;
}

export default function AddressSelector({
  onAddressSelect,
  selectedAddress,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    ""
  );

  useEffect(() => {
    fetchAddresses();
  }, []);
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const addressList = await addressApi.getAddresses();
      setAddresses(addressList);

      // Auto-select default address if available
      const defaultAddress = addressList.find(
        (addr: Address) => addr.isDefault
      );
      if (defaultAddress && !selectedAddress) {
        setSelectedAddressId(defaultAddress.id);
        onAddressSelect(defaultAddress);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // User not authenticated, this is handled by parent component
        console.log("User not authenticated");
      } else {
        console.error("Error fetching addresses:", error);
        toast.error("Không thể tải danh sách địa chỉ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      setShowNewAddressForm(true);
    } else {
      setShowNewAddressForm(false);
      const address = addresses.find((addr) => addr.id === addressId);
      if (address) {
        onAddressSelect(address);
      }
    }
  };
  const handleNewAddressSubmit = (newAddress: GuestAddressData | null) => {
    if (newAddress) {
      setShowNewAddressForm(false);
      onAddressSelect(newAddress);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Đang tải địa chỉ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAddressId}
        onValueChange={handleAddressSelection}
        className="space-y-3"
      >
        {/* Existing addresses */}
        {addresses.map((address) => (
          <div key={address.id} className="space-y-2">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={address.id} id={address.id} />
              <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.recipientName}</span>
                    {address.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.phoneNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.streetAddress}, {address.ward}, {address.district},{" "}
                    {address.province}
                  </div>
                </div>
              </Label>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}

        {/* Add new address option */}
        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 border-dashed">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Thêm địa chỉ mới</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Nhập địa chỉ giao hàng mới
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* New address form */}
      {showNewAddressForm && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h4 className="font-medium">Nhập địa chỉ mới</h4>
              <p className="text-sm text-muted-foreground">
                Điền thông tin địa chỉ giao hàng
              </p>
            </div>{" "}
            <GuestAddressForm onAddressChange={handleNewAddressSubmit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
