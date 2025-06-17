"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { ghnApi, GHNProvince, GHNDistrict, GHNWard } from "@/lib/api/ghn";
import { toast } from "sonner";

interface AddressFormData {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  province: string;
  district: string;
  ward: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceCode?: string;
  ghnDistrictCode?: string;
  isDefault: boolean;
}

interface GHNAddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AddressFormData>;
  isLoading?: boolean;
}

const GHNAddressForm: React.FC<GHNAddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    recipientName: initialData?.recipientName || "",
    phoneNumber: initialData?.phoneNumber || "",
    streetAddress: initialData?.streetAddress || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    ward: initialData?.ward || "",
    ghnProvinceId: initialData?.ghnProvinceId,
    ghnDistrictId: initialData?.ghnDistrictId,
    ghnWardCode: initialData?.ghnWardCode,
    ghnProvinceCode: initialData?.ghnProvinceCode,
    ghnDistrictCode: initialData?.ghnDistrictCode,
    isDefault: initialData?.isDefault || false,
  });

  // GHN data state
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.ghnProvinceId) {
      loadDistricts(formData.ghnProvinceId);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData((prev) => ({
        ...prev,
        district: "",
        ward: "",
        ghnDistrictId: undefined,
        ghnWardCode: undefined,
      }));
    }
  }, [formData.ghnProvinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.ghnDistrictId) {
      loadWards(formData.ghnDistrictId);
    } else {
      setWards([]);
      setFormData((prev) => ({
        ...prev,
        ward: "",
        ghnWardCode: undefined,
      }));
    }
  }, [formData.ghnDistrictId]);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const provincesData = await ghnService.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error("Error loading provinces:", error);
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true);
      const districtsData = await ghnService.getDistricts(provinceId);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: number) => {
    try {
      setLoadingWards(true);
      const wardsData = await ghnService.getWards(districtId);
      setWards(wardsData);
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(
      (p) => p.ProvinceID.toString() === value
    );
    if (selectedProvince) {
      setFormData((prev) => ({
        ...prev,
        province: selectedProvince.ProvinceName,
        ghnProvinceId: selectedProvince.ProvinceID,
        ghnProvinceCode: selectedProvince.Code,
        district: "",
        ward: "",
        ghnDistrictId: undefined,
        ghnWardCode: undefined,
      }));
    }
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districts.find(
      (d) => d.DistrictID.toString() === value
    );
    if (selectedDistrict) {
      setFormData((prev) => ({
        ...prev,
        district: selectedDistrict.DistrictName,
        ghnDistrictId: selectedDistrict.DistrictID,
        ghnDistrictCode: selectedDistrict.Code,
        ward: "",
        ghnWardCode: undefined,
      }));
    }
  };

  const handleWardChange = (value: string) => {
    const selectedWard = wards.find((w) => w.WardCode === value);
    if (selectedWard) {
      setFormData((prev) => ({
        ...prev,
        ward: selectedWard.WardName,
        ghnWardCode: selectedWard.WardCode,
      }));
    }
  };

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.recipientName.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!formData.streetAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return false;
    }
    if (!formData.province) {
      toast.error("Vui lòng chọn tỉnh/thành phố");
      return false;
    }
    if (!formData.district) {
      toast.error("Vui lòng chọn quận/huyện");
      return false;
    }
    if (!formData.ward) {
      toast.error("Vui lòng chọn phường/xã");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Thêm địa chỉ giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName">Tên người nhận *</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) =>
                  handleInputChange("recipientName", e.target.value)
                }
                placeholder="Nhập tên người nhận"
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
          </div>

          {/* Address Details */}
          <div>
            <Label htmlFor="streetAddress">Địa chỉ cụ thể *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) =>
                handleInputChange("streetAddress", e.target.value)
              }
              placeholder="Số nhà, tên đường..."
              required
            />
          </div>

          {/* Location Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province */}
            <div>
              <Label>Tỉnh/Thành phố *</Label>
              <Select
                value={formData.ghnProvinceId?.toString() || ""}
                onValueChange={handleProvinceChange}
                disabled={loadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem
                      key={province.ProvinceID}
                      value={province.ProvinceID.toString()}
                    >
                      {province.ProvinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div>
              <Label>Quận/Huyện *</Label>
              <Select
                value={formData.ghnDistrictId?.toString() || ""}
                onValueChange={handleDistrictChange}
                disabled={loadingDistricts || !formData.ghnProvinceId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDistricts
                        ? "Đang tải..."
                        : !formData.ghnProvinceId
                        ? "Chọn tỉnh/thành trước"
                        : "Chọn quận/huyện"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem
                      key={district.DistrictID}
                      value={district.DistrictID.toString()}
                    >
                      {district.DistrictName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward */}
            <div>
              <Label>Phường/Xã *</Label>
              <Select
                value={formData.ghnWardCode || ""}
                onValueChange={handleWardChange}
                disabled={loadingWards || !formData.ghnDistrictId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingWards
                        ? "Đang tải..."
                        : !formData.ghnDistrictId
                        ? "Chọn quận/huyện trước"
                        : "Chọn phường/xã"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                handleInputChange("isDefault", !!checked)
              }
            />
            <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                "Lưu địa chỉ"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GHNAddressForm;
