"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { orderApi } from "@/lib/api/orders";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: number;
  orderId?: string;
  orderData?: any;
  onSuccess: (orderId?: string) => void;
  onError: (error: any) => void;
}

export default function PayPalButton({
  amount,
  orderId,
  orderData,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [{ isResolved, isPending }] = usePayPalScriptReducer();
  const createOrder = async () => {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Only add Authorization if token exists
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // If orderData is provided, create order first, then create PayPal order
      let orderIdToUse = orderId;

      if (orderData && !orderId) {
        // Create order first
        const orderResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
          }
        );

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create order");
        }

        const orderResult = await orderResponse.json();
        orderIdToUse = orderResult.data?.id || orderResult.id;
        console.log("Order created:", orderIdToUse);
      }

      // Create PayPal order on backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/create-order`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId: orderIdToUse,
            amount: amount,
            currency: "VND",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PayPal order creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create PayPal order");
      }

      const data = await response.json();
      console.log("PayPal order created:", data);
      return data.data.paypalOrderId || data.paypalOrderId;
    } catch (error) {
      console.error("PayPal order creation error:", error);
      toast.error("Không thể tạo đơn thanh toán PayPal");
      throw error;
    }
  };
  const onApprove = async (data: any) => {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Only add Authorization if token exists
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Capture payment on backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/capture-order`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            paypalOrderId: data.orderID,
            orderId: orderId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PayPal capture failed:", errorData);
        throw new Error(
          errorData.message || "Failed to capture PayPal payment"
        );
      }

      const result = await response.json();
      console.log("PayPal payment captured:", result);

      if (
        result.data?.status === "COMPLETED" ||
        result.status === "COMPLETED"
      ) {
        toast.success("Thanh toán PayPal thành công!");
        onSuccess();
      } else {
        throw new Error("Payment not completed");
      }
    } catch (error) {
      console.error("PayPal capture error:", error);
      toast.error("Lỗi xử lý thanh toán PayPal");
      onError(error);
    }
  };

  const onErrorHandler = (error: any) => {
    console.error("PayPal error:", error);
    toast.error("Có lỗi xảy ra với PayPal");
    onError(error);
  };

  const onCancel = () => {
    toast.info("Đã hủy thanh toán PayPal");
  };

  if (isPending || !isResolved) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải PayPal...</span>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
          height: 45,
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        onCancel={onCancel}
        fundingSource={undefined} // Let PayPal decide the best funding source
      />
    </div>
  );
}
