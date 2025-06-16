"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Tag,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/context/UnifiedCartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { VoucherValidationResult } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import VoucherInput from "@/components/cart/VoucherInput";
import PayPalButton from "@/components/payments/PayPalButton";
import { orderApi, voucherApi } from "@/lib/api/orders";
import { toast } from "sonner";

interface ShippingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải trang thanh toán...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [appliedVoucher, setAppliedVoucher] =
    useState<VoucherValidationResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any>(null);
  const [autoApplyingVoucher, setAutoApplyingVoucher] = useState(false);
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    customerName: user?.fullName || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phoneNumber || "",
    shippingAddress: "",
    note: "",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Calculate totals
  const subtotal = totalAmount;
  const shippingFee = 30000; // Fixed shipping fee for demo
  const discount = appliedVoucher?.discountAmount || 0;
  const finalTotal = subtotal + shippingFee - discount;

  const handleVoucherApplied = (voucher: VoucherValidationResult) => {
    setAppliedVoucher(voucher);
    toast.success(`Áp dụng voucher ${voucher.voucher?.code} thành công!`);
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(null);
    toast.info("Đã gỡ voucher");
  };

  const handleInputChange = (field: keyof ShippingForm, value: string) => {
    setShippingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!shippingForm.customerName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }
    if (!shippingForm.customerEmail.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }
    if (!shippingForm.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!shippingForm.shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return false;
    }
    return true;
  };
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData: any = {
        customerName: shippingForm.customerName,
        customerEmail: shippingForm.customerEmail,
        customerPhone: shippingForm.customerPhone,
        shippingAddress: shippingForm.shippingAddress,
        items: items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.discountPrice || item.price,
        })),
        voucherId: appliedVoucher?.voucher?.id,
        subTotal: subtotal,
        shippingFee,
        discount,
        totalPrice: finalTotal,
        note: shippingForm.note,
      };

      // Only include userId if user is authenticated
      if (user?.id) {
        orderData.userId = user.id;
      }

      const response = await orderApi.createOrder(orderData);
      const order = response.data || response;

      setOrderCreated(order);

      // Handle payment based on selected method
      if (paymentMethod === "cash") {
        // Create COD payment record
        const paymentHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add auth token only if user is authenticated
        if (isAuthenticated) {
          paymentHeaders.Authorization = `Bearer ${localStorage.getItem(
            "accessToken"
          )}`;
        }

        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
            method: "POST",
            headers: paymentHeaders,
            body: JSON.stringify({
              orderId: order.id,
              method: "COD",
              amount: finalTotal,
              note: "Cash on Delivery",
            }),
          });
        } catch (paymentError) {
          // Don't fail the order for this
        }

        toast.success("Đặt hàng thành công!");
        await clearCart();
        router.push(
          `/checkout/success?orderNumber=${order.orderNumber || order.id}`
        );
      }
      // PayPal payment will be handled by PayPalButton component
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi đặt hàng";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handlePayPalSuccess = async () => {
    toast.success("Thanh toán PayPal thành công!");
    await clearCart();
    router.push(
      `/checkout/success?orderNumber=${
        orderCreated?.orderNumber || orderCreated?.id
      }`
    );
    setLoading(false);
  };

  const handlePayPalError = (error: any) => {
    console.error("PayPal payment error:", error);
    toast.error("Lỗi thanh toán PayPal. Vui lòng thử lại.");
    setLoading(false);
  };

  // Auto-load voucher from URL params (from cart)
  useEffect(() => {
    const voucherCode = searchParams.get("voucherCode");
    if (voucherCode && !appliedVoucher && !autoApplyingVoucher) {
      const autoApplyVoucher = async () => {
        setAutoApplyingVoucher(true);
        try {
          const validation = await voucherApi.validateVoucher(
            voucherCode,
            subtotal
          );
          if (validation.isValid && validation.voucher) {
            setAppliedVoucher({
              isValid: true,
              voucher: validation.voucher,
              discountAmount:
                typeof validation.discountAmount === "number"
                  ? validation.discountAmount
                  : parseFloat(validation.discountAmount?.toString() || "0"),
              message: "Voucher applied successfully",
            });
            toast.success(
              `Voucher ${voucherCode} đã được áp dụng từ giỏ hàng!`
            );

            // Clear voucher code from URL after successful application
            const url = new URL(window.location.href);
            url.searchParams.delete("voucherCode");
            window.history.replaceState({}, "", url.toString());
          } else {
            toast.error(
              validation.error ||
                `Voucher ${voucherCode} không hợp lệ hoặc đã hết hạn`
            );
          }
        } catch (error) {
          toast.error(`Không thể áp dụng voucher ${voucherCode}`);
        } finally {
          setAutoApplyingVoucher(false);
        }
      };

      autoApplyVoucher();
    }
  }, [searchParams, subtotal, appliedVoucher, autoApplyingVoucher]);

  // Test API connection function
  const testApiConnection = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  // Test API connection on component mount
  useEffect(() => {
    testApiConnection().then((connected) => {
      if (!connected) {
        console.warn(
          "API connection test failed. Check NEXT_PUBLIC_API_URL environment variable."
        );
      }
    });
  }, []);

  // Debug function for testing PayPal connection
  const testPayPalConnection = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      if (clientId) {
        toast.success("PayPal Client ID đã được cấu hình!");
      } else {
        toast.error("Chưa cấu hình PayPal Client ID");
      }
    } catch (error) {
      toast.error("Lỗi kết nối PayPal");
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Thanh toán</h1>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={shippingForm.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={shippingForm.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingForm.customerEmail}
                    onChange={(e) =>
                      handleInputChange("customerEmail", e.target.value)
                    }
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                  <Textarea
                    id="address"
                    value={shippingForm.shippingAddress}
                    onChange={(e) =>
                      handleInputChange("shippingAddress", e.target.value)
                    }
                    placeholder="Nhập địa chỉ chi tiết"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="note"
                    value={shippingForm.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Ghi chú cho đơn hàng"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                {" "}
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Thanh toán khi nhận hàng (COD)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label
                      htmlFor="paypal"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-8 h-5"
                            viewBox="0 0 32 20"
                            fill="none"
                          >
                            <rect
                              width="32"
                              height="20"
                              rx="4"
                              fill="#0070BA"
                            />
                            <text
                              x="16"
                              y="12"
                              textAnchor="middle"
                              fill="white"
                              fontSize="7"
                              fontWeight="bold"
                            >
                              PayPal
                            </text>
                          </svg>
                          <span>Thanh toán qua PayPal</span>
                        </div>
                        <div className="ml-2 text-xs text-blue-600">
                          (PayPal Balance, Credit Card, Debit Card)
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {/* PayPal Security Notice */}
                {paymentMethod === "paypal" && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 text-blue-600 mt-0.5">
                        <svg
                          className="w-full h-full"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">
                          Thanh toán an toàn với PayPal
                        </p>
                        <p className="mt-1">
                          • Bảo vệ người mua với PayPal Purchase Protection
                          <br />
                          • Hỗ trợ thẻ tín dụng, thẻ ghi nợ và tài khoản PayPal
                          <br />• Giao dịch được mã hóa SSL 256-bit
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={testPayPalConnection}
                          className="mt-2 text-xs"
                        >
                          Kiểm tra cấu hình PayPal
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voucher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                {autoApplyingVoucher && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Đang áp dụng voucher từ giỏ hàng...
                      </span>
                    </div>
                  </div>
                )}
                <VoucherInput
                  cartTotal={subtotal}
                  onVoucherApplied={handleVoucherApplied}
                  onVoucherRemoved={handleVoucherRemoved}
                  appliedVoucher={appliedVoucher}
                  disabled={autoApplyingVoucher}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right - Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder-image.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.variant?.color?.name} •{" "}
                          {item.variant?.size?.name} • x{item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(
                          (item.discountPrice || item.price) * item.quantity
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                {/* Calculations */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {appliedVoucher && discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá ({appliedVoucher.voucher?.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>{" "}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={
                    loading || items.length === 0 || paymentMethod === "paypal"
                  }
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {paymentMethod === "paypal"
                        ? "Đang tạo đơn hàng..."
                        : "Đang xử lý..."}
                    </div>
                  ) : paymentMethod === "paypal" ? (
                    "Tạo đơn hàng"
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>
                {/* PayPal Button - Show after order is created and PayPal is selected */}
                {orderCreated && paymentMethod === "paypal" && (
                  <div className="mt-4">
                    <PayPalButton
                      amount={finalTotal}
                      orderId={orderCreated.id}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
