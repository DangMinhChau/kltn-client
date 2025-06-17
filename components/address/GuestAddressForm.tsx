"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Loader2 } from "lucide-react";
import { ghnApi, GHNProvince, GHNDistrict, GHNWard } from "@/lib/api/ghn";

export interface GuestAddressData {
  recipientName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  province: string;
  district: string;
  ward: string;
  // GHN IDs for backend
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  [key: string]: string | number | undefined;
}

interface GuestAddressFormProps {
  initialData?: Partial<GuestAddressData>;
  onAddressChange: (address: GuestAddressData | null) => void;
  disabled?: boolean;
}

export default function GuestAddressForm({
  initialData,
  onAddressChange,
  disabled = false,
}: GuestAddressFormProps) {
  const [formData, setFormData] = useState<GuestAddressData>({
    recipientName: initialData?.recipientName || "",
    phoneNumber: initialData?.phoneNumber || "",
    email: initialData?.email || "",
    streetAddress: initialData?.streetAddress || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    ward: initialData?.ward || "",
  });

  // GHN Data states
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // Selected IDs for GHN API
  const [selectedIds, setSelectedIds] = useState({
    provinceId: initialData?.provinceId || null,
    districtId: initialData?.districtId || null,
    wardCode: initialData?.wardCode || null,
  });

  const [errors, setErrors] = useState<Partial<GuestAddressData>>({});

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    try {
      const provincesData = await ghnApi.getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error("Error loading provinces:", error);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (provinceId: number) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const districtsData = await ghnApi.getDistricts(provinceId);
      setDistricts(districtsData);
      // Reset district and ward selections
      setWards([]);
      setSelectedIds((prev) => ({ ...prev, districtId: null, wardCode: null }));
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    } catch (error) {
      console.error("Error loading districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const loadWards = async (districtId: number) => {
    setLoading((prev) => ({ ...prev, wards: true }));
    try {
      const wardsData = await ghnApi.getWards(districtId);
      setWards(wardsData);
      // Reset ward selection
      setSelectedIds((prev) => ({ ...prev, wardCode: null }));
      setFormData((prev) => ({ ...prev, ward: "" }));
    } catch (error) {
      console.error("Error loading wards:", error);
    } finally {
      setLoading((prev) => ({ ...prev, wards: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestAddressData> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Vui lòng nhập tên người nhận";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (
      !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Vui lòng nhập địa chỉ cụ thể";
    }
    if (!formData.province.trim()) {
      newErrors.province = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!formData.district.trim()) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    if (!formData.ward.trim()) {
      newErrors.ward = "Vui lòng chọn phường/xã";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (
    field: keyof GuestAddressData,
    value: string | number
  ) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Trigger validation
    validateAndNotifyParent(newFormData);
  };

  // Helper function to validate and notify parent
  const validateAndNotifyParent = (newFormData: GuestAddressData) => {
    // Simple validation for real-time feedback
    const tempErrors: Partial<GuestAddressData> = {};

    if (!newFormData.recipientName?.trim()) {
      tempErrors.recipientName = "Vui lòng nhập tên người nhận";
    }
    if (
      newFormData.phoneNumber &&
      !/^[0-9\s]{10,}$/.test(newFormData.phoneNumber)
    ) {
      tempErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }
    if (
      newFormData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newFormData.email)
    ) {
      tempErrors.email = "Email không hợp lệ";
    }

    // Only notify parent if form is complete and valid
    const isComplete = Object.entries(newFormData).every(([key, val]) => {
      // Skip optional ID fields
      if (key.includes("Id") || key.includes("Code")) return true;
      return typeof val === "string" ? val.trim() !== "" : val != null;
    });
    const hasErrors = Object.keys(tempErrors).length > 0;

    console.log("GuestAddressForm validation:", {
      isComplete,
      hasErrors,
      formData: newFormData,
      tempErrors,
    });

    if (isComplete && !hasErrors) {
      onAddressChange(newFormData);
    } else {
      onAddressChange(null);
    }
  };

  // Handler for province selection
  const handleProvinceChange = (value: string) => {
    // Ignore disabled values
    if (value === "loading" || value === "no-data") return;

    const selectedProvince = provinces.find(
      (p) => p.ProvinceID.toString() === value
    );
    if (selectedProvince) {
      setSelectedIds((prev) => ({
        ...prev,
        provinceId: selectedProvince.ProvinceID,
      }));

      // Update form data in one go
      const newFormData = {
        ...formData,
        province: selectedProvince.ProvinceName,
        provinceId: selectedProvince.ProvinceID,
        // Reset dependent fields
        district: "",
        ward: "",
        districtId: undefined,
        wardCode: undefined,
      };
      setFormData(newFormData);

      loadDistricts(selectedProvince.ProvinceID);

      // Trigger validation
      validateAndNotifyParent(newFormData);
    }
  };
  // Handler for district selection
  const handleDistrictChange = (value: string) => {
    // Ignore disabled values
    if (value === "loading" || value === "no-data") return;

    const selectedDistrict = districts.find(
      (d) => d.DistrictID.toString() === value
    );
    if (selectedDistrict) {
      setSelectedIds((prev) => ({
        ...prev,
        districtId: selectedDistrict.DistrictID,
      }));

      // Update form data in one go
      const newFormData = {
        ...formData,
        district: selectedDistrict.DistrictName,
        districtId: selectedDistrict.DistrictID,
        // Reset dependent fields
        ward: "",
        wardCode: undefined,
      };
      setFormData(newFormData);

      loadWards(selectedDistrict.DistrictID);

      // Trigger validation
      validateAndNotifyParent(newFormData);
    }
  }; // Handler for ward selection
  const handleWardChange = (value: string) => {
    // Ignore disabled values
    if (value === "loading" || value === "no-data") return;

    const selectedWard = wards.find((w) => w.WardCode === value);
    if (selectedWard) {
      setSelectedIds((prev) => ({ ...prev, wardCode: selectedWard.WardCode }));

      // Update form data in one go
      const newFormData = {
        ...formData,
        ward: selectedWard.WardName,
        wardCode: selectedWard.WardCode,
      };
      setFormData(newFormData);

      // Trigger validation
      validateAndNotifyParent(newFormData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Thông tin giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">
              Tên người nhận <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) =>
                handleInputChange("recipientName", e.target.value)
              }
              placeholder="Nhập tên người nhận"
              disabled={disabled}
              className={errors.recipientName ? "border-red-500" : ""}
            />
            {errors.recipientName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.recipientName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="Nhập số điện thoại"
              disabled={disabled}
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Nhập email"
            disabled={disabled}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="streetAddress">
            Địa chỉ cụ thể <span className="text-red-500">*</span>
          </Label>
          <Input
            id="streetAddress"
            value={formData.streetAddress}
            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            placeholder="Số nhà, tên đường..."
            disabled={disabled}
            className={errors.streetAddress ? "border-red-500" : ""}
          />
          {errors.streetAddress && (
            <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="province">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </Label>{" "}
            <Select
              value={selectedIds.provinceId?.toString()}
              onValueChange={handleProvinceChange}
              disabled={disabled}
            >
              <SelectTrigger
                className={errors.province ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>{" "}
              <SelectContent>
                {loading.provinces ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Đang tải tỉnh/thành phố...
                  </SelectItem>
                ) : provinces.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    Không tìm thấy tỉnh/thành phố
                  </SelectItem>
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
            {errors.province && (
              <p className="text-sm text-red-500 mt-1">{errors.province}</p>
            )}
          </div>

          <div>
            <Label htmlFor="district">
              Quận/Huyện <span className="text-red-500">*</span>
            </Label>{" "}
            <Select
              value={selectedIds.districtId?.toString()}
              onValueChange={handleDistrictChange}
              disabled={disabled || districts.length === 0}
            >
              <SelectTrigger
                className={errors.district ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn quận/huyện" />
              </SelectTrigger>{" "}
              <SelectContent>
                {loading.districts ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Đang tải quận/huyện...
                  </SelectItem>
                ) : districts.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    Không tìm thấy quận/huyện
                  </SelectItem>
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
            {errors.district && (
              <p className="text-sm text-red-500 mt-1">{errors.district}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ward">
              Phường/Xã <span className="text-red-500">*</span>
            </Label>{" "}
            <Select
              value={selectedIds.wardCode || ""}
              onValueChange={handleWardChange}
              disabled={disabled || wards.length === 0}
            >
              <SelectTrigger className={errors.ward ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn phường/xã" />
              </SelectTrigger>{" "}
              <SelectContent>
                {loading.wards ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Đang tải phường/xã...
                  </SelectItem>
                ) : wards.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    Không tìm thấy phường/xã
                  </SelectItem>
                ) : (
                  wards.map((ward) => (
                    <SelectItem key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.ward && (
              <p className="text-sm text-red-500 mt-1">{errors.ward}</p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Mẹo:</p>
          <p>
            Nếu bạn có tài khoản, hãy{" "}
            <span className="font-medium">đăng nhập</span> để lưu địa chỉ này
            cho lần mua tiếp theo!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
