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
      console.log("=== PayPal Create Order Debug ===");
      console.log("Amount:", amount);
      console.log("OrderId:", orderId);
      console.log("OrderData:", orderData);

      // Validate required data
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount for PayPal order");
      }

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
        console.log("Creating backend order first...");

        // Validate orderData before sending
        if (
          !orderData.customerName ||
          !orderData.customerEmail ||
          !orderData.shippingAddress
        ) {
          throw new Error("Missing required shipping information");
        }

        if (!orderData.items || orderData.items.length === 0) {
          throw new Error("No items in order");
        } // Create order first
        const orderResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
          }
        );

        console.log("Backend order response status:", orderResponse.status);

        if (!orderResponse.ok) {
          let errorData;
          const contentType = orderResponse.headers.get("content-type");

          if (contentType && contentType.includes("application/json")) {
            errorData = await orderResponse.json().catch(() => ({}));
          } else {
            const textData = await orderResponse
              .text()
              .catch(() => "No response body");
            errorData = { message: textData };
          }

          console.error("Backend order creation failed:", {
            status: orderResponse.status,
            statusText: orderResponse.statusText,
            errorData,
          });

          throw new Error(
            errorData.message ||
              `Failed to create order: HTTP ${orderResponse.status}`
          );
        }

        const orderResult = await orderResponse.json();
        orderIdToUse = orderResult.data?.id || orderResult.id;
        console.log("Backend order created with ID:", orderIdToUse);
      }

      if (!orderIdToUse) {
        throw new Error("No order ID available for PayPal payment");
      }
      console.log("Creating PayPal order with orderID:", orderIdToUse);

      // Create PayPal order on backend
      const paypalOrderPayload = {
        orderId: orderIdToUse,
        amount: Math.round(amount), // Ensure integer for VND
        currency: "VND",
      };

      console.log("PayPal order payload:", paypalOrderPayload);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/create-order`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(paypalOrderPayload),
        }
      );

      console.log("PayPal API response status:", response.status);
      console.log(
        "PayPal API response headers:",
        Object.fromEntries(response.headers)
      );

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json().catch(() => ({}));
        } else {
          const textData = await response
            .text()
            .catch(() => "No response body");
          errorData = { message: textData };
        }

        console.error("PayPal order creation failed:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("PayPal order response:", data);
      const paypalOrderId = data.data?.paypalOrderId || data.paypalOrderId;

      if (!paypalOrderId) {
        throw new Error("No PayPal order ID returned from backend");
      }

      console.log("PayPal order created successfully:", paypalOrderId);
      return paypalOrderId;
    } catch (error) {
      console.error("PayPal order creation error:", error);

      // Check if this is a backend PayPal API error (500)
      if (
        error instanceof Error &&
        (error.message.includes("Internal server error") ||
          error.message.includes("HTTP 500"))
      ) {
        // Offer fallback to cash on delivery
        const userChoice = confirm(
          "PayPal hiện đang gặp sự cố. Bạn có muốn thanh toán khi nhận hàng không?\n\n" +
            "✅ Nhấn OK: Thanh toán khi nhận hàng\n" +
            "❌ Nhấn Cancel: Thử PayPal lại"
        );

        if (userChoice) {
          try {
            // Create cash order and redirect
            const fallbackHeaders: Record<string, string> = {
              "Content-Type": "application/json",
            };
            const token = localStorage.getItem("accessToken");
            if (token) {
              fallbackHeaders.Authorization = `Bearer ${token}`;
            }

            const cashOrderResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/orders`,
              {
                method: "POST",
                headers: fallbackHeaders,
                body: JSON.stringify({
                  ...orderData,
                  paymentMethod: "cash",
                }),
              }
            );

            if (cashOrderResponse.ok) {
              const cashOrder = await cashOrderResponse.json();
              const cashOrderId = cashOrder.data?.id || cashOrder.id;
              toast.success("Đã chuyển sang thanh toán khi nhận hàng!");

              // Trigger success callback and redirect
              setTimeout(() => {
                onSuccess(cashOrderId);
              }, 1000);

              return "FALLBACK_CASH_ORDER"; // Return something for PayPal
            }
          } catch (fallbackError) {
            console.error("Cash order fallback failed:", fallbackError);
          }
        }
      }

      // More user-friendly error messages
      let userMessage = "Không thể tạo đơn thanh toán PayPal";
      if (error instanceof Error) {
        if (error.message.includes("Invalid amount")) {
          userMessage = "Số tiền thanh toán không hợp lệ";
        } else if (error.message.includes("Missing required")) {
          userMessage = "Thiếu thông tin giao hàng bắt buộc";
        } else if (error.message.includes("No items")) {
          userMessage = "Giỏ hàng trống. Vui lòng thêm sản phẩm";
        } else if (error.message.includes("HTTP 401")) {
          userMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";
        } else if (error.message.includes("HTTP 400")) {
          userMessage = "Dữ liệu đơn hàng không hợp lệ";
        } else if (error.message.includes("HTTP 500")) {
          userMessage =
            "Lỗi server. Vui lòng thử lại sau hoặc chọn thanh toán khi nhận hàng";
        }
      }

      toast.error(userMessage);
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
  // Add a fallback handler for backend PayPal errors
  const handlePayPalFailure = () => {
    const userChoice = confirm(
      "PayPal hiện đang gặp sự cố. Bạn có muốn thanh toán khi nhận hàng không?\n\n" +
        "✅ Nhấn OK: Thanh toán khi nhận hàng\n" +
        "❌ Nhấn Cancel: Thử PayPal lại"
    );

    if (userChoice) {
      // Reset payment method to cash in checkout page
      window.location.href = "/checkout?payment=cash&paypal_failed=1";
    }
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
