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
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  directGhnService,
  GHNProvince,
  GHNDistrict,
  GHNWard,
} from "@/lib/services/directGhn";
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

interface DirectGHNAddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  initialData?: Partial<AddressFormData>;
  isLoading?: boolean;
}

const DirectGHNAddressForm: React.FC<DirectGHNAddressFormProps> = ({
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
    isDefault: initialData?.isDefault || false,
  });

  // GHN data state
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      setError(null);
      const data = await directGhnService.getProvinces();
      setProvinces(data);
    } catch (error: any) {
      console.error("Error loading provinces:", error);
      setError(
        "Không thể tải danh sách tỉnh/thành phố. Có thể do vấn đề CORS hoặc API key."
      );
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true);
      setDistricts([]);
      setWards([]);

      const data = await directGhnService.getDistricts(provinceId);
      setDistricts(data);

      // Reset district and ward in form
      setFormData((prev) => ({
        ...prev,
        district: "",
        ward: "",
        ghnDistrictId: undefined,
        ghnWardCode: undefined,
        ghnDistrictCode: undefined,
      }));
    } catch (error: any) {
      console.error("Error loading districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: number) => {
    try {
      setLoadingWards(true);
      setWards([]);

      const data = await directGhnService.getWards(districtId);
      setWards(data);

      // Reset ward in form
      setFormData((prev) => ({
        ...prev,
        ward: "",
        ghnWardCode: undefined,
      }));
    } catch (error: any) {
      console.error("Error loading wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (provinceIdStr: string) => {
    const provinceId = parseInt(provinceIdStr);
    const province = provinces.find((p) => p.ProvinceID === provinceId);
    if (province) {
      setFormData((prev) => ({
        ...prev,
        province: province.ProvinceName,
        ghnProvinceId: province.ProvinceID,
        ghnProvinceCode: province.Code,
      }));
      loadDistricts(provinceId);
    }
  };

  const handleDistrictChange = (districtIdStr: string) => {
    const districtId = parseInt(districtIdStr);
    const district = districts.find((d) => d.DistrictID === districtId);
    if (district) {
      setFormData((prev) => ({
        ...prev,
        district: district.DistrictName,
        ghnDistrictId: district.DistrictID,
        ghnDistrictCode: district.Code,
      }));
      loadWards(districtId);
    }
  };

  const handleWardChange = (wardCode: string) => {
    const ward = wards.find((w) => w.WardCode === wardCode);
    if (ward) {
      setFormData((prev) => ({
        ...prev,
        ward: ward.WardName,
        ghnWardCode: ward.WardCode,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.recipientName.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!formData.streetAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ cụ thể");
      return;
    }
    if (!formData.province) {
      toast.error("Vui lòng chọn tỉnh/thành phố");
      return;
    }
    if (!formData.district) {
      toast.error("Vui lòng chọn quận/huyện");
      return;
    }
    if (!formData.ward) {
      toast.error("Vui lòng chọn phường/xã");
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Thêm địa chỉ mới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <br />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={loadProvinces}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Thêm địa chỉ mới (Direct GHN API)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="streetAddress">Địa chỉ cụ thể *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) =>
                handleInputChange("streetAddress", e.target.value)
              }
              placeholder="Số nhà, tên đường..."
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tỉnh/Thành phố *</Label>
              <Select
                value={formData.ghnProvinceId?.toString() || ""}
                onValueChange={handleProvinceChange}
                disabled={isLoading || loadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"
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

            <div>
              <Label>Quận/Huyện *</Label>
              <Select
                value={formData.ghnDistrictId?.toString() || ""}
                onValueChange={handleDistrictChange}
                disabled={
                  isLoading || loadingDistricts || !formData.ghnProvinceId
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"
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

            <div>
              <Label>Phường/Xã *</Label>
              <Select
                value={formData.ghnWardCode || ""}
                onValueChange={handleWardChange}
                disabled={isLoading || loadingWards || !formData.ghnDistrictId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingWards ? "Đang tải..." : "Chọn phường/xã"
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                handleInputChange("isDefault", checked as boolean)
              }
              disabled={isLoading}
            />
            <Label htmlFor="isDefault">Đặt làm địa chỉ mặc định</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu địa chỉ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DirectGHNAddressForm;
