"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CreditCard, Truck, MapPin, Tag } from "lucide-react";
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
import { orderApi } from "@/lib/api/orders";
import { toast } from "sonner";

interface ShippingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [appliedVoucher, setAppliedVoucher] =
    useState<VoucherValidationResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
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
      console.log("Order creation response:", response);

      // Handle both wrapped and direct response formats
      const order = response.data || response;
      const orderId = order.id;
      const orderNumber = order.orderNumber;

      // Handle payment based on selected method
      if (paymentMethod === "vnpay") {
        // Create VNPay payment
        const paymentHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add auth token only if user is authenticated
        if (isAuthenticated) {
          paymentHeaders.Authorization = `Bearer ${localStorage.getItem(
            "accessToken"
          )}`;
        }

        const paymentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments`,
          {
            method: "POST",
            headers: paymentHeaders,
            body: JSON.stringify({
              orderId: orderId,
              method: "VNPAY",
              amount: finalTotal,
              returnUrl: `${window.location.origin}/checkout/payment/result/vnpay`,
              clientIp: "127.0.0.1", // In production, get real IP
            }),
          }
        );

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();

          // Clear cart before redirect
          await clearCart();

          // Redirect to VNPay payment page
          window.location.href = paymentData.paymentUrl;
          return;
        } else {
          throw new Error("Failed to create VNPay payment");
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
      } else {
        // Fallback for other payment methods
        toast.success("Đặt hàng thành công!");

        // Clear cart
        await clearCart();

        // Redirect to success page
        router.push(`/checkout/success?orderNumber=${orderNumber}`);
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <Label htmlFor="vnpay" className="flex items-center">
                      <span>Thanh toán qua VNPay</span>
                      <div className="ml-2 text-xs text-blue-600">
                        (ATM, Visa, MasterCard, QR Code)
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
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
                <VoucherInput
                  cartTotal={subtotal}
                  onVoucherApplied={handleVoucherApplied}
                  onVoucherRemoved={handleVoucherRemoved}
                  appliedVoucher={appliedVoucher}
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
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
