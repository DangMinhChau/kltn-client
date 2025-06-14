"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/context/CartContext";
import { orderApi, voucherApi, shippingApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CreateOrderRequest,
  PaymentMethod,
  ShippingInfo,
  VoucherValidationResult,
  convertCartToOrderItems,
} from "@/types";

export default function CheckoutPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  // Form states
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] =
    useState<VoucherValidationResult | null>(null);

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Pricing states
  const [shippingFee, setShippingFee] = useState(30000); // Default
  const [discountAmount, setDiscountAmount] = useState(0);

  // Calculate totals
  const subtotal = state.totalAmount;
  const finalTotal = subtotal + shippingFee - discountAmount;

  // Calculate shipping fee when address changes
  useEffect(() => {
    if (
      shippingInfo.province &&
      shippingInfo.district &&
      shippingInfo.ward &&
      state.items.length > 0
    ) {
      calculateShippingFee();
    }
  }, [shippingInfo.province, shippingInfo.district, shippingInfo.ward]);

  const calculateShippingFee = async () => {
    if (!shippingInfo.province || !shippingInfo.district || !shippingInfo.ward)
      return;

    setIsCalculatingShipping(true);
    try {
      const items = state.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const result = await shippingApi.calculateShippingFee(items, {
        province: shippingInfo.province,
        district: shippingInfo.district,
        ward: shippingInfo.ward,
      });

      setShippingFee(result.standardFee);
    } catch (error) {
      console.error("Failed to calculate shipping fee:", error);
      // Keep default shipping fee
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleVoucherApply = async () => {
    if (!voucherCode.trim()) return;

    setIsValidatingVoucher(true);
    try {
      const result = await voucherApi.validateVoucher(voucherCode, subtotal);

      if (result.isValid && result.voucher) {
        setAppliedVoucher(result);
        setDiscountAmount(result.discountAmount);
      } else {
        alert(result.message || "Mã giảm giá không hợp lệ");
        setAppliedVoucher(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Failed to validate voucher:", error);
      alert("Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleVoucherRemove = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const validateForm = (): boolean => {
    const required = [
      "fullName",
      "phone",
      "email",
      "address",
      "ward",
      "district",
      "province",
    ];

    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        alert(
          `Vui lòng điền ${
            field === "fullName"
              ? "họ tên"
              : field === "phone"
              ? "số điện thoại"
              : field === "email"
              ? "email"
              : field === "address"
              ? "địa chỉ"
              : field === "ward"
              ? "phường/xã"
              : field === "district"
              ? "quận/huyện"
              : field === "province"
              ? "tỉnh/thành phố"
              : field
          }`
        );
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      alert("Email không hợp lệ");
      return false;
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s/g, ""))) {
      alert("Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const orderItems = state.items.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const orderData: CreateOrderRequest = {
        items: orderItems,
        shippingInfo,
        paymentMethod,
        shippingMethod: "standard",
        voucherCode: appliedVoucher?.voucher?.code,
        notes: shippingInfo.notes,
      };

      const order = await orderApi.createOrder(orderData);

      // Clear cart on success
      clearCart();

      // Redirect to order success page
      router.push(`/orders/${order.orderNumber}?success=true`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

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
              Thêm sản phẩm vào giỏ hàng để tiến hành thanh toán
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
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
          <Button variant="outline" asChild className="mb-4">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại giỏ hàng
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-2 text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          {/* Order Summary */}
          <div className="lg:col-span-7">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.color} • {item.size}
                        </p>
                        <div className="mt-1 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(
                            (item.discountPrice || item.price) * item.quantity
                          )}
                        </p>
                        {item.discountPrice && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>{" "}
            {/* Customer Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Họ và tên *</label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Số điện thoại *
                    </label>
                    <Input
                      placeholder="0987654321"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Địa chỉ cụ thể *
                  </label>
                  <Input
                    placeholder="Số nhà, tên đường..."
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Tỉnh/Thành phố *
                    </label>
                    <Input
                      placeholder="Hồ Chí Minh"
                      value={shippingInfo.province}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          province: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quận/Huyện *</label>
                    <Input
                      placeholder="Quận 1"
                      value={shippingInfo.district}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phường/Xã *</label>
                    <Input
                      placeholder="Phường Bến Nghé"
                      value={shippingInfo.ward}
                      onChange={(e) =>
                        setShippingInfo((prev) => ({
                          ...prev,
                          ward: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Ghi chú (tùy chọn)
                  </label>
                  <Input
                    placeholder="Ghi chú cho đơn hàng..."
                    value={shippingInfo.notes}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            {/* Voucher Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {appliedVoucher.voucher?.name}
                        </p>
                        <p className="text-xs text-green-600">
                          Giảm {formatPrice(appliedVoucher.discountAmount)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoucherRemove}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá..."
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleVoucherApply}
                      disabled={isValidatingVoucher || !voucherCode.trim()}
                    >
                      {isValidatingVoucher ? "Kiểm tra..." : "Áp dụng"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={() => setPaymentMethod(PaymentMethod.COD)}
                      className="h-4 w-4 text-primary"
                    />
                    <label
                      htmlFor="cod"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Thanh toán khi nhận hàng (COD)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="payment"
                      checked={paymentMethod === PaymentMethod.BANK_TRANSFER}
                      onChange={() =>
                        setPaymentMethod(PaymentMethod.BANK_TRANSFER)
                      }
                      className="h-4 w-4 text-primary"
                    />
                    <label
                      htmlFor="bank_transfer"
                      className="text-sm font-medium"
                    >
                      Chuyển khoản ngân hàng
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="momo"
                      name="payment"
                      checked={paymentMethod === PaymentMethod.MOMO}
                      onChange={() => setPaymentMethod(PaymentMethod.MOMO)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor="momo" className="text-sm font-medium">
                      Ví MoMo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="vnpay"
                      name="payment"
                      checked={paymentMethod === PaymentMethod.VNPAY}
                      onChange={() => setPaymentMethod(PaymentMethod.VNPAY)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor="vnpay" className="text-sm font-medium">
                      VNPay
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tạm tính ({state.totalItems} sản phẩm)
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(state.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Phí vận chuyển
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(shippingFee)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Tổng cộng</span>
                    <span className="text-base font-semibold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Thanh toán an toàn 100%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Miễn phí vận chuyển đơn từ 500K</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Hỗ trợ nhiều hình thức thanh toán</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Đang xử lý..." : "Đặt hàng ngay"}
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
