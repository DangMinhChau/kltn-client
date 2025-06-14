"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useVietnamLocations } from "@/hooks/useVietnamLocations";
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/lib/api/addresses";

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddressForm = ({ address, onSuccess, onCancel }: AddressFormProps) => {
  const [formData, setFormData] = useState({
    recipientName: "",
    phoneNumber: "",
    streetAddress: "",
    province: "",
    district: "",
    ward: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  const {
    provinces,
    districts,
    wards,
    loading: provincesLoading,
    loadingDistricts,
    loadingWards,
    loadDistricts,
    loadWards,
  } = useVietnamLocations();

  // Load form data when address prop changes
  useEffect(() => {
    if (address) {
      setFormData({
        recipientName: address.recipientName,
        phoneNumber: address.phoneNumber,
        streetAddress: address.streetAddress,
        province: address.province,
        district: address.district,
        ward: address.ward,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const handleProvinceChange = async (value: string) => {
    const selectedProvince = provinces.find((p) => p.code.toString() === value);
    if (selectedProvince) {
      setFormData((prev) => ({
        ...prev,
        province: selectedProvince.name,
        district: "",
        ward: "",
      }));
      try {
        await loadDistricts(value);
      } catch (error) {
        toast.error("Failed to load districts");
      }
    }
  };

  const handleDistrictChange = async (value: string) => {
    const selectedDistrict = districts.find((d) => d.code.toString() === value);
    if (selectedDistrict) {
      setFormData((prev) => ({
        ...prev,
        district: selectedDistrict.name,
        ward: "",
      }));
      try {
        await loadWards(value);
      } catch (error) {
        toast.error("Failed to load wards");
      }
    }
  };

  const handleWardChange = (value: string) => {
    const selectedWard = wards.find((w) => w.code.toString() === value);
    if (selectedWard) {
      setFormData((prev) => ({
        ...prev,
        ward: selectedWard.name,
      }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.recipientName ||
      !formData.phoneNumber ||
      !formData.streetAddress ||
      !formData.province ||
      !formData.district ||
      !formData.ward
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Please enter a valid phone number (10-11 digits)");
      return;
    }

    try {
      setLoading(true);

      const { addressApi } = await import("@/lib/api/addresses");

      if (address) {
        // Update existing address
        await addressApi.updateAddress(address.id, formData);
      } else {
        // Create new address
        await addressApi.createAddress(formData);
      }
      toast.success(
        address
          ? "Address updated successfully"
          : "Address created successfully"
      );

      onSuccess();
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipientName" className="text-sm font-medium">
            Recipient Name *
          </Label>
          <Input
            id="recipientName"
            value={formData.recipientName}
            onChange={(e) => handleInputChange("recipientName", e.target.value)}
            placeholder="Enter recipient name"
            className="h-10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number *
          </Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            placeholder="Enter phone number (10-11 digits)"
            className="h-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress" className="text-sm font-medium">
          Street Address *
        </Label>
        <Input
          id="streetAddress"
          value={formData.streetAddress}
          onChange={(e) => handleInputChange("streetAddress", e.target.value)}
          placeholder="Enter street address"
          className="h-10"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Province *</Label>
          <Select
            value={
              provinces
                .find((p) => p.name === formData.province)
                ?.code.toString() || ""
            }
            onValueChange={handleProvinceChange}
            disabled={provincesLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={
                  provincesLoading ? "Loading..." : "Select province"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem
                  key={province.code}
                  value={province.code.toString()}
                >
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">District *</Label>
          <Select
            value={
              districts
                .find((d) => d.name === formData.district)
                ?.code.toString() || ""
            }
            onValueChange={handleDistrictChange}
            disabled={!formData.province || loadingDistricts}
          >
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={
                  !formData.province
                    ? "Select province first"
                    : loadingDistricts
                    ? "Loading..."
                    : "Select district"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem
                  key={district.code}
                  value={district.code.toString()}
                >
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Ward *</Label>
          <Select
            value={
              wards.find((w) => w.name === formData.ward)?.code.toString() || ""
            }
            onValueChange={handleWardChange}
            disabled={!formData.district || loadingWards}
          >
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={
                  !formData.district
                    ? "Select district first"
                    : loadingWards
                    ? "Loading..."
                    : "Select ward"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code.toString()}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) =>
            handleInputChange("isDefault", checked as boolean)
          }
        />
        <Label
          htmlFor="isDefault"
          className="text-sm font-medium cursor-pointer"
        >
          Set as default address
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : address ? (
            "Update Address"
          ) : (
            "Add Address"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
