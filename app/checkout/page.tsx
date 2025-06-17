"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import PayPalProvider from "@/components/payments/PayPalProvider";
import PayPalButton from "@/components/payments/PayPalButton";
import { voucherApi } from "@/lib/api/vouchers";
import {
  EnhancedPayPalService,
  PayPalOrderData,
} from "@/lib/services/enhanced-paypal.service";

interface ShippingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note: string;
}

interface VoucherApplication {
  voucher: any;
  discount: number;
  isValid: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, totalAmount, clearCart, syncVariantData } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] =
    useState<VoucherApplication | null>(null);
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phone || "",
    shippingAddress: "",
    note: "",
  });

  // Sync variant data on page load
  useEffect(() => {
    syncVariantData();
  }, [syncVariantData]);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const subtotal = totalAmount;
  const shippingFee = 30000; // Fixed shipping fee
  const discount = appliedVoucher?.discount || 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleInputChange = (field: keyof ShippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vouchers/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: voucherCode,
            orderValue: subtotal,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.data?.isValid) {
        setAppliedVoucher({
          voucher: data.data.voucher,
          discount: data.data.discount,
          isValid: true,
        });
        toast.success("Áp dụng voucher thành công!");
      } else {
        toast.error(data.message || "Voucher không hợp lệ");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi áp dụng voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.success("Đã hủy voucher");
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
  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Sync variant data one more time before order creation
      await syncVariantData();

      const orderData: PayPalOrderData = {
        customerName: shippingForm.customerName.trim(),
        customerEmail: shippingForm.customerEmail.trim(),
        customerPhone: shippingForm.customerPhone.trim(),
        shippingAddress: shippingForm.shippingAddress.trim(),
        items: items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.discountPrice || item.price,
        })),
        subTotal: subtotal,
        shippingFee,
        discount,
        totalPrice: finalTotal,
        note: shippingForm.note?.trim() || "",
        userId: user?.id || null,
      };

      if (paymentMethod === "COD") {
        // Handle COD payment using enhanced service
        const result = await EnhancedPayPalService.createOrderWithFallback(
          orderData,
          {
            fallbackToCOD: false, // Force COD
            showSuccessToast: true,
          }
        );

        // Clear cart and redirect
        clearCart();
        router.push(`/order-success?orderNumber=${result.orderId}`);
      } else if (paymentMethod === "PAYPAL") {
        // Handle PayPal payment using enhanced service
        const result = await EnhancedPayPalService.createOrderWithFallback(
          orderData,
          {
            fallbackToCOD: true,
            autoRedirect: false,
            showSuccessToast: false,
          }
        );

        if (result.paymentMethod === "PAYPAL") {
          // PayPal payment - let PayPalButton handle the flow
          toast.success("Chuyển đến PayPal để thanh toán");
        } else {
          // Fallback to COD
          clearCart();
          router.push(`/order-success?orderNumber=${result.orderId}`);
        }
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCODPayment = async (orderId: string) => {
    try {
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAuthenticated && {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            }),
          },
          body: JSON.stringify({
            orderId,
            method: "COD",
            amount: finalTotal,
            note: "Cash on Delivery",
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to create COD payment");
      }

      toast.success("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.");
    } catch (error) {
      console.error("COD payment creation failed:", error);
      // Don't throw error as order was created successfully
      toast.warning(
        "Đơn hàng đã được tạo nhưng có lỗi trong việc ghi nhận thanh toán"
      );
    }
  };

  const handlePayPalPayment = async (orderId: string, amount: number) => {
    try {
      // Convert VND to USD (approximate rate: 1 USD = 24,000 VND)
      const amountUSD = Math.ceil((amount / 24000) * 100) / 100; // Round up to 2 decimal places

      const paypalResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAuthenticated && {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            }),
          },
          body: JSON.stringify({
            orderId,
            amount: amountUSD,
            currency: "USD",
          }),
        }
      );

      if (!paypalResponse.ok) {
        throw new Error("Failed to create PayPal order");
      }

      const paypalData = await paypalResponse.json();

      if (paypalData.data?.paypalOrderId) {
        // Open PayPal checkout in new window
        const paypalCheckoutUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalData.data.paypalOrderId}`;
        window.open(paypalCheckoutUrl, "_blank");

        toast.success("Chuyển đến PayPal để thanh toán");

        // Clear cart (order was created successfully)
        clearCart();

        // Redirect to pending payment page
        router.push(
          `/order-pending?orderNumber=${orderId}&paypalOrderId=${paypalData.data.paypalOrderId}`
        );
      } else {
        throw new Error("No PayPal order ID received");
      }
    } catch (error: any) {
      console.error("PayPal payment creation failed:", error);
      toast.error("Có lỗi xảy ra khi tạo thanh toán PayPal");
      throw error;
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-4">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Button onClick={() => router.push("/products")}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <p className="text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Họ và tên *</Label>
                  <Input
                    id="customerName"
                    value={shippingForm.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Số điện thoại *</Label>
                  <Input
                    id="customerPhone"
                    value={shippingForm.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={shippingForm.customerEmail}
                  onChange={(e) =>
                    handleInputChange("customerEmail", e.target.value)
                  }
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shippingAddress">Địa chỉ giao hàng *</Label>
                <Textarea
                  id="shippingAddress"
                  value={shippingForm.shippingAddress}
                  onChange={(e) =>
                    handleInputChange("shippingAddress", e.target.value)
                  }
                  placeholder="Nhập địa chỉ chi tiết để giao hàng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={shippingForm.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Ghi chú đặc biệt cho đơn hàng (không bắt buộc)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="COD" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-medium">
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Thanh toán bằng tiền mặt khi nhận được hàng
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PAYPAL" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-muted-foreground">
                      Thanh toán trực tuyến qua PayPal (chuyển đổi từ VND sang
                      USD)
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl || "/placeholder-image.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.color} / {item.size}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.discountPrice || item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voucher */}
          <Card>
            <CardHeader>
              <CardTitle>Mã giảm giá</CardTitle>
            </CardHeader>
            <CardContent>
              {!appliedVoucher ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyVoucher}
                      disabled={loading || !voucherCode.trim()}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="font-medium text-green-800">
                        {appliedVoucher.voucher.code}
                      </span>
                      <p className="text-sm text-green-600">
                        Giảm {formatPrice(appliedVoucher.discount)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveVoucher}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Total */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng cộng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
              {paymentMethod === "PAYPAL" && (
                <p className="text-sm text-muted-foreground">
                  ≈ ${Math.ceil((finalTotal / 24000) * 100) / 100} USD
                </p>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt hàng ${formatPrice(finalTotal)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
