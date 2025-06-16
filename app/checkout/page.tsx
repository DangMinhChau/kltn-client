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

  // Debug voucher state
  console.log("Checkout - Applied voucher:", appliedVoucher);
  console.log("Checkout - Discount amount:", discount);
  console.log("Checkout - Subtotal:", subtotal);
  console.log("Checkout - Final total:", finalTotal);

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
      console.log("Creating order with data:", orderData);

      const response = await orderApi.createOrder(orderData);
      console.log("Order creation response:", response); // Handle both wrapped and direct response formats
      const order = response.data || response;
      const orderId = order.id;
      const orderNumber = order.orderNumber || order.id; // Handle payment based on selected method
      if (paymentMethod === "vnpay") {
        // Create VNPay payment
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          console.log("API URL:", apiUrl);
          console.log("Environment variables check:", {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            origin: window.location.origin,
          }); // Test API connection before proceeding with a simpler endpoint
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const testResponse = await fetch(`${apiUrl}/health`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!testResponse.ok) {
              throw new Error(
                `API không khả dụng (status: ${testResponse.status})`
              );
            }
            console.log("API connection test successful");
          } catch (testError) {
            console.error("API connection test failed:", testError);
            throw new Error(
              "Không thể kết nối đến server thanh toán. Vui lòng thử lại sau."
            );
          }

          const paymentHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          };

          // Add auth token only if user is authenticated
          if (isAuthenticated) {
            const token = localStorage.getItem("accessToken");
            if (token) {
              paymentHeaders.Authorization = `Bearer ${token}`;
              console.log("Authorization header added");
            }
          }

          console.log("Creating VNPay payment with URL:", `${apiUrl}/payments`);
          console.log("Payment headers:", paymentHeaders);

          const paymentBody = {
            orderId: orderId,
            method: "VNPAY",
            amount: finalTotal,
            returnUrl: `${window.location.origin}/checkout/payment/result/vnpay`,
            clientIp: "127.0.0.1", // In production, get real IP
          };
          console.log("Payment request body:", paymentBody);

          const paymentController = new AbortController();
          const paymentTimeoutId = setTimeout(
            () => paymentController.abort(),
            30000
          ); // 30 second timeout

          const paymentResponse = await fetch(`${apiUrl}/payments`, {
            method: "POST",
            headers: paymentHeaders,
            body: JSON.stringify(paymentBody),
            signal: paymentController.signal,
          });

          clearTimeout(paymentTimeoutId);

          console.log("Payment response status:", paymentResponse.status);
          console.log(
            "Payment response headers:",
            Object.fromEntries(paymentResponse.headers.entries())
          );
          if (!paymentResponse.ok) {
            let errorText = "";
            try {
              errorText = await paymentResponse.text();
              console.error("Payment response error:", errorText);
            } catch (readError) {
              console.error("Could not read error response:", readError);
              errorText = `HTTP ${paymentResponse.status}: ${paymentResponse.statusText}`;
            }

            let errorMessage = "Failed to create VNPay payment";
            try {
              const errorData = JSON.parse(errorText);
              errorMessage =
                errorData.message || errorData.error || errorMessage;
            } catch (e) {
              errorMessage =
                errorText ||
                `HTTP ${paymentResponse.status}: ${paymentResponse.statusText}`;
            }

            throw new Error(errorMessage);
          }

          const paymentData = await paymentResponse.json();
          console.log("Payment data received:", paymentData);

          if (!paymentData.data?.paymentUrl && !paymentData.paymentUrl) {
            throw new Error("Payment URL not received from server");
          }

          const paymentUrl =
            paymentData.data?.paymentUrl || paymentData.paymentUrl;

          // Clear cart before redirect
          await clearCart();

          // Show success message before redirect
          toast.success("Đang chuyển hướng đến trang thanh toán VNPay...");

          // Small delay to show the toast
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);

          return;
        } catch (error: any) {
          console.error("VNPay payment error:", error);
          console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
          });

          // Enhanced error messages
          let errorMessage =
            "Không thể tạo thanh toán VNPay. Vui lòng thử lại.";
          if (error instanceof TypeError) {
            if (error.message.includes("fetch")) {
              errorMessage =
                "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
            }
          } else if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            errorMessage =
              "Yêu cầu thanh toán quá thời gian. Vui lòng thử lại.";
          } else if (error instanceof Error) {
            if (
              error.message.includes("401") ||
              error.message.includes("Unauthorized")
            ) {
              errorMessage =
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (
              error.message.includes("400") ||
              error.message.includes("Bad Request")
            ) {
              errorMessage =
                "Thông tin thanh toán không hợp lệ. Vui lòng kiểm tra lại.";
            } else if (
              error.message.includes("500") ||
              error.message.includes("Internal Server Error")
            ) {
              errorMessage = "Lỗi server. Vui lòng thử lại sau ít phút.";
            } else if (
              error.message.includes("timeout") ||
              error.message.includes("TIMEOUT")
            ) {
              errorMessage =
                "Yêu cầu thanh toán quá thời gian. Vui lòng thử lại.";
            } else if (
              error.message.includes("không khả dụng") ||
              error.message.includes("kết nối")
            ) {
              errorMessage = error.message; // Use the specific connection error message
            } else {
              errorMessage = error.message;
            }
          }

          // Re-throw with enhanced error message to be caught by outer catch block
          throw new Error(errorMessage);
        }
      } else if (paymentMethod === "cash") {
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
              orderId: orderId,
              method: "COD",
              amount: finalTotal,
              note: "Cash on Delivery",
            }),
          });
        } catch (paymentError) {
          console.warn("Failed to create COD payment record:", paymentError);
          // Don't fail the order for this
        }

        toast.success("Đặt hàng thành công!");

        // Clear cart
        await clearCart();

        // Redirect to success page
        router.push(`/checkout/success?orderNumber=${orderNumber}`);
        return; // Add explicit return
      } else {
        // Fallback for other payment methods
        toast.success("Đặt hàng thành công!");

        // Clear cart
        await clearCart();

        // Redirect to success page
        router.push(`/checkout/success?orderNumber=${orderNumber}`);
        return; // Add explicit return
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi đặt hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }; // Auto-load voucher from URL params (from cart)
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
          console.error("Failed to auto-apply voucher:", error);
          toast.error(`Không thể áp dụng voucher ${voucherCode}`);
        } finally {
          setAutoApplyingVoucher(false);
        }
      };

      autoApplyVoucher();
    }
  }, [searchParams, subtotal, appliedVoucher, autoApplyingVoucher]); // Test API connection function
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
        console.log("API connection successful");
        return true;
      } else {
        console.error("API connection failed:", response.status);
        return false;
      }
    } catch (error) {
      console.error("API connection error:", error);
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

  // Debug function for testing VNPay connection
  const testVNPayConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("Testing VNPay connection to:", apiUrl);

      const testResponse = await fetch(`${apiUrl}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (testResponse.ok) {
        toast.success("Kết nối server thành công!");
        console.log("VNPay connection test successful");
      } else {
        toast.error(`Lỗi kết nối server: ${testResponse.status}`);
        console.error("VNPay connection test failed:", testResponse.status);
      }
    } catch (error) {
      toast.error("Không thể kết nối đến server thanh toán");
      console.error("VNPay connection test error:", error);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
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
            </Card>{" "}
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
                  </div>{" "}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <Label
                      htmlFor="vnpay"
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
                              fill="#1E40AF"
                            />
                            <text
                              x="16"
                              y="12"
                              textAnchor="middle"
                              fill="white"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              VNPay
                            </text>
                          </svg>
                          <span>Thanh toán qua VNPay</span>
                        </div>
                        <div className="ml-2 text-xs text-blue-600">
                          (ATM, Visa, MasterCard, QR Code)
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {/* VNPay Security Notice */}
                {paymentMethod === "vnpay" && (
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
                          Thanh toán an toàn với VNPay
                        </p>{" "}
                        <p className="mt-1">
                          • Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay
                          an toàn
                          <br />
                          • Hỗ trợ thẻ ATM nội địa, Visa, MasterCard, JCB và QR
                          Code
                          <br />• Giao dịch được mã hóa 256-bit SSL
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={testVNPayConnection}
                          className="mt-2 text-xs"
                        >
                          Kiểm tra kết nối VNPay
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
              </CardHeader>{" "}
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
                  disabled={loading || items.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {paymentMethod === "vnpay"
                        ? "Đang tạo thanh toán VNPay..."
                        : "Đang xử lý..."}
                    </div>
                  ) : paymentMethod === "vnpay" ? (
                    "Thanh toán với VNPay"
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
