"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Plus,
  CreditCard,
  Truck,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/context";
import { useAuth } from "@/lib/context/AuthContext";
import VoucherInput from "@/components/cart/VoucherInput";
import AddressSelector from "@/components/address/AddressSelector";
import GuestAddressForm, {
  GuestAddressData,
} from "@/components/address/GuestAddressForm";
import { formatPrice } from "@/lib/utils";
import { orderApi } from "@/lib/api/orders";
import { VoucherValidationResult } from "@/types";
import { Address } from "@/lib/api/addresses";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalAmount, totalItems, clearCart } = useCart();

  // Hydration fix - only render after client mount
  const [isMounted, setIsMounted] = useState(false); // State management
  const [selectedAddress, setSelectedAddress] = useState<
    Address | GuestAddressData | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "PAYPAL">("COD");
  const [appliedVoucher, setAppliedVoucher] =
    useState<VoucherValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hydration effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculations
  const subtotal = totalAmount;
  const shippingFee = 30000; // Fixed shipping fee
  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const finalTotal = subtotal + shippingFee - voucherDiscount;
  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
  }, [items.length, router]);

  // No redirect for non-authenticated users - allow guest checkout

  const handleVoucherApplied = (voucher: VoucherValidationResult) => {
    setAppliedVoucher(voucher);
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(null);
  };
  const handleAddressSelected = (address: Address | GuestAddressData) => {
    setSelectedAddress(address);
  };

  const handleGuestAddressChange = (address: GuestAddressData | null) => {
    if (address) {
      setSelectedAddress(address);
    }
  };

  // Helper function to check if address is GuestAddressData
  const isGuestAddress = (
    address: Address | GuestAddressData
  ): address is GuestAddressData => {
    return "email" in address;
  };

  const validateOrder = () => {
    // Check address for both user and guest
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return false;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return false;
    }

    return true;
  };
  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    setIsProcessing(true);
    try {
      // Build order data based on user type and address type
      let orderData;

      if (user && selectedAddress && !isGuestAddress(selectedAddress)) {
        // Authenticated user order with saved address
        orderData = {
          items: items.map((item) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: `${selectedAddress.streetAddress}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
          paymentMethod,
          voucherCode: appliedVoucher?.voucher?.code,
          subTotal: subtotal,
          shippingFee,
          discount: voucherDiscount,
          totalPrice: finalTotal,
          note: "",
          // userId will be set by backend from JWT
        };
      } else if (selectedAddress && isGuestAddress(selectedAddress)) {
        // Guest order or user with new address
        orderData = {
          customerName: selectedAddress.recipientName,
          customerEmail: selectedAddress.email,
          customerPhone: selectedAddress.phoneNumber,
          shippingAddress: `${selectedAddress.streetAddress}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
          items: items.map((item) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          subTotal: subtotal,
          shippingFee,
          discount: voucherDiscount,
          totalPrice: finalTotal,
          note: "",
          voucherId: appliedVoucher?.voucher?.id,
        };
      } else {
        toast.error("Dữ liệu không hợp lệ");
        return;
      }

      let result;

      if (paymentMethod === "COD") {
        // Create COD order
        result = await orderApi.createOrder(orderData);

        if (result.success) {
          clearCart();
          toast.success("Đặt hàng thành công!");
          router.push(`/order-success?orderId=${result.order.id}`);
        } else {
          toast.error("Có lỗi xảy ra khi đặt hàng");
        }
      } else if (paymentMethod === "PAYPAL") {
        // Create PayPal order
        result = await orderApi.createPayPalOrder(orderData);

        if (result.success && result.data?.approvalUrl) {
          // Redirect to PayPal for payment
          window.location.href = result.data.approvalUrl;
        } else {
          toast.error("Có lỗi xảy ra khi tạo đơn hàng PayPal");
        }
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <p className="text-muted-foreground mt-2">Hoàn tất đơn hàng của bạn</p>

        {/* User Status */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          {user ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Đăng nhập dưới tên: <strong>{user.fullName}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Thanh toán với tư cách khách vãng lai</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Info and Forms */}
        <div className="lg:col-span-2 space-y-6">
          {" "}
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>{" "}
            <CardContent>
              {user ? (
                <AddressSelector
                  onAddressSelect={handleAddressSelected}
                  selectedAddress={selectedAddress}
                />
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Điền thông tin giao hàng (khách vãng lai)
                  </div>{" "}
                  <GuestAddressForm
                    onAddressChange={handleGuestAddressChange}
                  />
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
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "COD" | "PAYPAL")
                }
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="COD" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Thanh toán khi nhận hàng (COD)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </div>
                      </div>
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="PAYPAL" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-muted-foreground">
                          Thanh toán trực tuyến qua PayPal (hỗ trợ VND)
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold text-lg">
                        PayPal
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          {/* Voucher */}
          <Card>
            <CardHeader>
              <CardTitle>Mã giảm giá</CardTitle>
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

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Đơn hàng của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}{" "}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.variant.id}`}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name} </h4>
                      {item.color && (
                        <p className="text-xs text-muted-foreground">
                          Màu: {item.color}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá voucher</span>
                    <span>-{formatPrice(voucherDiscount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>{" "}
              {/* Place Order Button */}{" "}
              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || isProcessing}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt hàng - ${formatPrice(finalTotal)}`
                )}
              </Button>{" "}
              {!selectedAddress && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Vui lòng chọn địa chỉ giao hàng để tiếp tục
                  </AlertDescription>
                </Alert>
              )}
              {/* Order Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Miễn phí đổi trả trong 30 ngày</p>
                <p>• Giao hàng tiêu chuẩn 2-5 ngày làm việc</p>
                <p>• Hỗ trợ khách hàng 24/7</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
