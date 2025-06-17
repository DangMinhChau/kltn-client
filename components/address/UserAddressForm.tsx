"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ghnApi, GHNProvince, GHNDistrict, GHNWard } from "@/lib/api/ghn";
import { addressApi, Address, CreateAddressRequest } from "@/lib/api/addresses";

interface UserAddressFormProps {
  initialData?: Address;
  onSuccess?: (address: Address) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export default function UserAddressForm({
  initialData,
  onSuccess,
  onCancel,
  mode = "create",
}: UserAddressFormProps) {
  const [formData, setFormData] = useState({
    recipientName: initialData?.recipientName || "",
    phoneNumber: initialData?.phoneNumber || "",
    streetAddress: initialData?.streetAddress || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    ward: initialData?.ward || "",
    isDefault: initialData?.isDefault || false,
    // GHN IDs - load from initialData if editing
    provinceId: initialData?.ghnProvinceId || 0,
    districtId: initialData?.ghnDistrictId || 0,
    wardCode: initialData?.ghnWardCode || "",
    // GHN Codes - load from initialData if editing
    ghnProvinceCode: initialData?.ghnProvinceCode || "",
    ghnDistrictCode: initialData?.ghnDistrictCode || "",
  });

  // GHN Data states
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.provinceId) {
      loadDistricts(formData.provinceId);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.provinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtId) {
      loadWards(formData.districtId);
    } else {
      setWards([]);
    }
  }, [formData.districtId]);
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const provinces = await ghnApi.getProvinces();
      setProvinces(provinces || []);
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
      const districts = await ghnApi.getDistricts(provinceId);
      setDistricts(districts || []);
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
      const wards = await ghnApi.getWards(districtId);
      setWards(wards || []);
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provinces.find(
      (p) => p.ProvinceID.toString() === provinceId
    );
    if (selectedProvince) {
      setFormData((prev) => ({
        ...prev,
        province: selectedProvince.ProvinceName,
        provinceId: selectedProvince.ProvinceID,
        district: "",
        districtId: 0,
        ward: "",
        wardCode: "",
        // Add province code
        ghnProvinceCode: selectedProvince.Code,
      }));
    }
  };

  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = districts.find(
      (d) => d.DistrictID.toString() === districtId
    );
    if (selectedDistrict) {
      setFormData((prev) => ({
        ...prev,
        district: selectedDistrict.DistrictName,
        districtId: selectedDistrict.DistrictID,
        ward: "",
        wardCode: "",
        // Add district code
        ghnDistrictCode: selectedDistrict.Code,
      }));
    }
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.WardCode === wardCode);
    if (selectedWard) {
      setFormData((prev) => ({
        ...prev,
        ward: selectedWard.WardName,
        wardCode: selectedWard.WardCode,
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "recipientName",
      "phoneNumber",
      "streetAddress",
      "province",
      "district",
      "ward",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Vui lòng điền ${getFieldLabel(field)}`);
        return false;
      }
    }

    // Validate phone number
    if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const getFieldLabel = (field: string) => {
    const labels = {
      recipientName: "tên người nhận",
      phoneNumber: "số điện thoại",
      streetAddress: "địa chỉ chi tiết",
      province: "tỉnh/thành phố",
      district: "quận/huyện",
      ward: "phường/xã",
    };
    return labels[field as keyof typeof labels] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const addressData: CreateAddressRequest = {
        recipientName: formData.recipientName,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        isDefault: formData.isDefault,
        // Include GHN IDs and codes for backend
        ghnProvinceId: formData.provinceId,
        ghnDistrictId: formData.districtId,
        ghnWardCode: formData.wardCode,
        ghnProvinceCode: formData.ghnProvinceCode,
        ghnDistrictCode: formData.ghnDistrictCode,
      };

      let result: Address;
      if (mode === "create") {
        result = await addressApi.createAddress(addressData);
        toast.success("Thêm địa chỉ thành công!");
      } else {
        result = await addressApi.updateAddress(initialData!.id, addressData);
        toast.success("Cập nhật địa chỉ thành công!");
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          mode === "create"
            ? "Không thể thêm địa chỉ"
            : "Không thể cập nhật địa chỉ"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {mode === "create" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
        </CardTitle>
      </CardHeader>{" "}
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Thông tin người nhận</h3>
            <p className="text-sm text-muted-foreground">
              Nhập đầy đủ thông tin để giao hàng chính xác
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">
                Tên người nhận <span className="text-red-500">*</span>
              </Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) =>
                  handleInputChange("recipientName", e.target.value)
                }
                placeholder="Nhập họ và tên đầy đủ"
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Ví dụ: 0901234567"
                disabled={isSubmitting}
                className="h-11"
              />
            </div>
          </div>
        </div>{" "}
        {/* Location Section */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Địa chỉ giao hàng</h3>
            <p className="text-sm text-muted-foreground">
              Chọn địa chỉ từ hệ thống Giao Hàng Nhanh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.provinceId.toString()}
                onValueChange={handleProvinceChange}
                disabled={loadingProvinces || isSubmitting}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProvinces ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    provinces.map((province) => (
                      <SelectItem
                        key={province.ProvinceID}
                        value={province.ProvinceID.toString()}
                      >
                        {province.ProvinceName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>{" "}
            <div className="space-y-2">
              <Label htmlFor="district">
                Quận/Huyện <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.districtId.toString()}
                onValueChange={handleDistrictChange}
                disabled={
                  !formData.provinceId || loadingDistricts || isSubmitting
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {loadingDistricts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    districts.map((district) => (
                      <SelectItem
                        key={district.DistrictID}
                        value={district.DistrictID.toString()}
                      >
                        {district.DistrictName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">
                Phường/Xã <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.wardCode}
                onValueChange={handleWardChange}
                disabled={!formData.districtId || loadingWards || isSubmitting}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWards ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : (
                    wards.map((ward) => (
                      <SelectItem key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="streetAddress">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) =>
                handleInputChange("streetAddress", e.target.value)
              }
              placeholder="Số nhà, tên đường, ngõ, ngách..."
              disabled={isSubmitting}
              className="h-11"
            />{" "}
            <p className="text-xs text-muted-foreground">
              Ví dụ: Số 123, Đường Nguyễn Văn A, Ngõ 45
            </p>
          </div>
        </div>
        {/* Settings Section */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium">Cài đặt</h3>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                handleInputChange("isDefault", checked)
              }
              disabled={isSubmitting}
            />
            <div className="space-y-1">
              <Label htmlFor="isDefault" className="cursor-pointer font-medium">
                Đặt làm địa chỉ mặc định
              </Label>
              <p className="text-sm text-muted-foreground">
                Địa chỉ này sẽ được chọn tự động khi đặt hàng
              </p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-11"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "create" ? "Thêm địa chỉ" : "Cập nhật địa chỉ"}
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11"
              size="lg"
            >
              Hủy bỏ
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
