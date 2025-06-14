/**
 * Enhanced Checkout Page with Server Actions and Improved Error Handling
 * Uses Next.js 14+ features: Server Actions, Suspense, Error Boundaries
 */

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Import enhanced types and server actions
import {
  CreateOrderDto,
  CreateShippingDto,
  OrderApiResponse,
  ShippingCalculationDto,
  VoucherValidationDto,
} from "@/types/api-order";
import {
  PaymentMethod,
  ShippingMethod,
  ShippingInfo,
  OrderStatus,
  convertCartToOrderItems,
} from "@/types";
import { orderApi } from "@/lib/api";
import OrderErrorBoundary from "@/components/common/OrderErrorBoundary";
import {
  CheckoutSkeleton,
  CheckoutLoading,
} from "@/components/common/OrderSuspense";
import { useVietnamLocations } from "@/hooks/useVietnamLocations";
import {
  useCreateOrder,
  useCalculateShippingFee,
} from "@/hooks/useEnhancedOrder";

// Enhanced interfaces for better type safety
interface CheckoutFormData {
  // Personal info
  recipientName: string;
  recipientPhone: string;
  // Address info
  address: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  ward: string;
  district: string;
  province: string;
  // Additional
  note?: string;
}

interface VoucherState {
  code: string;
  isValid: boolean;
  discount: number;
  discountPercent?: number;
  maxDiscount?: number;
  message?: string;
  error?: string;
}

interface ShippingCalculation {
  fee: number;
  estimatedDays: number;
  method: ShippingMethod;
  error?: string;
}

function CheckoutPageContent() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Enhanced hooks for API operations
  const createOrderMutation = useCreateOrder();
  const shippingCalculation = useCalculateShippingFee();

  // Location hooks
  const {
    provinces,
    districts,
    wards,
    loading: locationLoading,
    loadingDistricts,
    loadingWards,
    loadDistricts,
    loadWards,
  } = useVietnamLocations();
  // Form states
  const [formData, setFormData] = useState<CheckoutFormData>({
    recipientName: "",
    recipientPhone: "",
    address: "",
    wardCode: "",
    districtId: 0,
    provinceId: 0,
    ward: "",
    district: "",
    province: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD
  );

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(
    ShippingMethod.STANDARD
  );

  const [voucher, setVoucher] = useState<VoucherState>({
    code: "",
    isValid: false,
    discount: 0,
  });

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Pricing states
  const [shippingFee, setShippingFee] = useState(30000);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  // Calculate totals
  const subtotal = state.totalAmount;
  const finalTotal = subtotal + shippingFee - voucher.discount;
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Vui lòng nhập họ tên";
    }

    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = "Vui lòng nhập số điện thoại";
    } else if (
      !/^[0-9]{10,11}$/.test(formData.recipientPhone.replace(/\s/g, ""))
    ) {
      newErrors.recipientPhone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.province) {
      newErrors.province = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!formData.district) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    if (!formData.ward) {
      newErrors.ward = "Vui lòng chọn phường/xã";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate shipping fee
  const handleCalculateShippingFee = async () => {
    if (
      !formData.province ||
      !formData.district ||
      !formData.ward ||
      state.items.length === 0
    ) {
      return;
    }
    setIsCalculatingShipping(true);
    try {
      // Simplified shipping calculation - for now just set a default fee
      const baseFee = 30000; // 30k VND base fee
      const expressFee = shippingMethod === ShippingMethod.EXPRESS ? 20000 : 0;
      setShippingFee(baseFee + expressFee);
    } catch (error) {
      console.error("Failed to calculate shipping fee:", error);
      toast.error("Không thể tính phí vận chuyển");
    } finally {
      setIsCalculatingShipping(false);
    }
  };
  // Apply voucher
  const handleVoucherApply = async () => {
    if (!voucher.code.trim()) return;

    setIsValidatingVoucher(true);
    try {
      // Simplified voucher validation - for demo purposes
      const mockVouchers = [
        { code: "SAVE10", name: "Save 10%", discount: 0.1, type: "percent" },
        { code: "SAVE50K", name: "Save 50K", discount: 50000, type: "fixed" },
        {
          code: "FREESHIP",
          name: "Free Shipping",
          discount: 0,
          type: "free_shipping",
        },
      ];

      const foundVoucher = mockVouchers.find(
        (v) => v.code.toLowerCase() === voucher.code.toLowerCase()
      );
      if (foundVoucher) {
        const discountAmount =
          foundVoucher.type === "percent"
            ? subtotal * foundVoucher.discount
            : foundVoucher.discount;
        setVoucher({
          code: voucher.code,
          isValid: true,
          discount: discountAmount,
          message: `Áp dụng thành công: ${foundVoucher.name}`,
        });
        toast.success(`Áp dụng thành công: ${foundVoucher.name}`);
      } else {
        setVoucher({
          code: voucher.code,
          isValid: false,
          discount: 0,
          message: "Mã giảm giá không hợp lệ",
        });
        toast.error("Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Failed to validate voucher:", error);
      toast.error("Không thể áp dụng mã giảm giá");
      setVoucher((prev) => ({ ...prev, isValid: false, discount: 0 }));
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Remove voucher
  const handleVoucherRemove = () => {
    setVoucher({
      code: "",
      isValid: false,
      discount: 0,
    });
    toast.info("Đã bỏ mã giảm giá");
  };
  // Handle form input changes
  const handleInputChange = (
    field: keyof CheckoutFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle checkout with server action
  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (state.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare shipping info
      const shippingInfo: CreateShippingDto = {
        orderId: "", // Will be filled by server
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        address: formData.address,
        wardCode: formData.wardCode,
        districtId: formData.districtId,
        provinceId: formData.provinceId,
        ward: formData.ward,
        district: formData.district,
        province: formData.province,
        shippingMethod: shippingMethod,
        note: formData.note,
      };

      // Convert cart items to order items
      const orderItems = convertCartToOrderItems(state.items);

      // Prepare order data
      const orderData: CreateOrderDto = {
        userId: "current-user", // Will be replaced with actual user ID by server action
        customerName: formData.recipientName,
        customerEmail: "user@example.com", // Should be from user context
        customerPhone: formData.recipientPhone,
        shippingAddress: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`,
        items: orderItems.map((item) => ({
          variantId: item.variantId!,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        subTotal: subtotal,
        shippingFee: shippingFee,
        discount: voucher.discount,
        totalPrice: finalTotal,
        voucherId: voucher.isValid ? voucher.code : undefined,
        note: formData.note,
      };

      // Use server action to create order
      startTransition(async () => {
        const result = await orderApi.createOrder(orderData); // Order API returns BaseResponseDto<Order>
        if (result && result.data) {
          // Clear cart on success
          clearCart();

          toast.success("Đặt hàng thành công!");

          // Redirect to order page
          router.push(`/orders/${result.data.orderNumber}?success=true`);
        } else {
          toast.error("Không thể tạo đơn hàng");
        }
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Đã xảy ra lỗi khi đặt hàng");
    } finally {
      setIsProcessing(false);
    }
  };

  // Effects
  useEffect(() => {
    handleCalculateShippingFee();
  }, [formData.province, formData.district, formData.ward, shippingMethod]);

  // Empty cart state
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng trống</h1>
            <p className="mt-2 text-gray-600">
              Thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán
            </p>
            <Link href="/products">
              <Button className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại giỏ hàng
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="recipientName">Họ và tên *</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) =>
                        handleInputChange("recipientName", e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      className={errors.recipientName ? "border-red-500" : ""}
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientPhone">Số điện thoại *</Label>
                    <Input
                      id="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={(e) =>
                        handleInputChange("recipientPhone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                      className={errors.recipientPhone ? "border-red-500" : ""}
                    />
                    {errors.recipientPhone && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.recipientPhone}
                      </p>
                    )}
                  </div>
                </div>{" "}
                <div>
                  <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Số nhà, tên đường"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                    <select
                      id="province"
                      value={formData.province}
                      onChange={(e) => {
                        const selectedProvince = provinces.find(
                          (p) => p.name === e.target.value
                        );
                        handleInputChange("province", e.target.value);
                        handleInputChange(
                          "provinceId",
                          selectedProvince?.code
                            ? parseInt(selectedProvince.code.toString())
                            : 0
                        );
                        handleInputChange("district", "");
                        handleInputChange("ward", "");
                        handleInputChange("districtId", 0);
                        handleInputChange("wardCode", "");
                        if (selectedProvince) {
                          loadDistricts(selectedProvince.code.toString());
                        }
                      }}
                      className={`w-full rounded-md border px-3 py-2 ${
                        errors.province ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={locationLoading}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.province}
                      </p>
                    )}
                  </div>{" "}
                  <div>
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <select
                      id="district"
                      value={formData.district}
                      onChange={(e) => {
                        const selectedDistrict = districts.find(
                          (d) => d.name === e.target.value
                        );
                        handleInputChange("district", e.target.value);
                        handleInputChange(
                          "districtId",
                          selectedDistrict?.code
                            ? selectedDistrict.code.toString()
                            : ""
                        );
                        handleInputChange("ward", "");
                        handleInputChange("wardCode", "");
                        if (selectedDistrict) {
                          loadWards(selectedDistrict.code.toString());
                        }
                      }}
                      className={`w-full rounded-md border px-3 py-2 ${
                        errors.district ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!formData.province || loadingDistricts}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <select
                      id="ward"
                      value={formData.ward}
                      onChange={(e) => {
                        const selectedWard = wards.find(
                          (w) => w.name === e.target.value
                        );
                        handleInputChange("ward", e.target.value);
                        handleInputChange("wardCode", selectedWard?.code || "");
                      }}
                      className={`w-full rounded-md border px-3 py-2 ${
                        errors.ward ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!formData.district || loadingWards}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p className="text-sm text-red-500 mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
                  <Textarea
                    id="notes"
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Ghi chú cho đơn hàng..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Phương thức vận chuyển
                </CardTitle>
              </CardHeader>{" "}
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <input
                      type="radio"
                      value={ShippingMethod.STANDARD}
                      id="standard"
                      name="shippingMethod"
                      checked={shippingMethod === ShippingMethod.STANDARD}
                      onChange={(e) =>
                        setShippingMethod(e.target.value as ShippingMethod)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Giao hàng tiêu chuẩn</p>
                          <p className="text-sm text-muted-foreground">
                            3-5 ngày làm việc
                          </p>
                        </div>
                        <div className="text-right">
                          {isCalculatingShipping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <p className="font-medium">
                              {formatPrice(shippingFee)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>{" "}
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <input
                      type="radio"
                      value={ShippingMethod.EXPRESS}
                      id="express"
                      name="shippingMethod"
                      checked={shippingMethod === ShippingMethod.EXPRESS}
                      onChange={(e) =>
                        setShippingMethod(e.target.value as ShippingMethod)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Giao hàng nhanh</p>
                          <p className="text-sm text-muted-foreground">
                            1-2 ngày làm việc
                          </p>
                        </div>
                        <div className="text-right">
                          {isCalculatingShipping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <p className="font-medium">
                              {formatPrice(shippingFee + 20000)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>{" "}
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <input
                      type="radio"
                      value={PaymentMethod.COD}
                      id="cod"
                      name="paymentMethod"
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Thanh toán khi nhận hàng (COD)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt khi nhận hàng
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>{" "}
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <input
                      type="radio"
                      value={PaymentMethod.CREDIT_CARD}
                      id="bank"
                      name="paymentMethod"
                      checked={paymentMethod === PaymentMethod.CREDIT_CARD}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-muted-foreground">
                            Chuyển khoản qua ngân hàng hoặc ví điện tử
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>{" "}
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <input
                      type="radio"
                      value={PaymentMethod.VNPAY}
                      id="vnpay"
                      name="paymentMethod"
                      checked={paymentMethod === PaymentMethod.VNPAY}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">VNPay</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán trực tuyến qua VNPay
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder-image.jpg"}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>{" "}
                      <p className="text-xs text-muted-foreground">
                        {item.variant.color?.name || "Default"} /{" "}
                        {item.variant.size?.name || "Default"}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Voucher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                {voucher.isValid ? (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {voucher.code}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoucherRemove}
                      className="h-auto p-1 text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={voucher.code}
                        onChange={(e) =>
                          setVoucher((prev) => ({
                            ...prev,
                            code: e.target.value,
                          }))
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={handleVoucherApply}
                        disabled={isValidatingVoucher || !voucher.code.trim()}
                        size="sm"
                      >
                        {isValidatingVoucher ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Áp dụng"
                        )}
                      </Button>
                    </div>
                    {voucher.message && !voucher.isValid && (
                      <p className="text-sm text-red-500">{voucher.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng kết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({state.totalItems} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span>
                    {isCalculatingShipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                {voucher.isValid && voucher.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(voucher.discount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-lg">{formatPrice(finalTotal)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || isPending || isCalculatingShipping}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing || isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Đặt hàng
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link href="/terms" className="underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="underline">
                    Chính sách bảo mật
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with error boundary and suspense
export default function CheckoutPage() {
  return (
    <OrderErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="text-lg font-semibold">Lỗi thanh toán</h2>
                <p className="text-sm text-muted-foreground">
                  Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.
                </p>
                <Link href="/cart">
                  <Button>Quay lại giỏ hàng</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <React.Suspense fallback={<CheckoutLoading />}>
        <CheckoutPageContent />
      </React.Suspense>
    </OrderErrorBoundary>
  );
}
