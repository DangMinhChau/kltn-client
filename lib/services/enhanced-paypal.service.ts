// Enhanced PayPal integration utilities
import { toast } from "sonner";

export interface PayPalOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  subTotal: number;
  shippingFee?: number;
  discount?: number;
  totalPrice: number;
  note?: string;
  userId?: string | null;
}

export interface PayPalServiceOptions {
  fallbackToCOD?: boolean;
  autoRedirect?: boolean;
  showSuccessToast?: boolean;
}

export class EnhancedPayPalService {
  private static readonly VND_TO_USD_RATE = 24000;

  static convertVNDToUSD(amountVND: number): number {
    return Math.ceil((amountVND / this.VND_TO_USD_RATE) * 100) / 100;
  }

  static async createOrderWithFallback(
    orderData: PayPalOrderData,
    options: PayPalServiceOptions = {}
  ): Promise<{
    orderId: string;
    paymentMethod: "PAYPAL" | "COD";
  }> {
    const { fallbackToCOD = true, autoRedirect = false } = options;

    try {
      // First, create the order on our backend
      const orderResponse = await this.createBackendOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || "Failed to create order");
      }

      const orderId = orderResponse.orderId;

      // Try to create PayPal order
      try {
        const paypalResponse = await this.createPayPalPayment(
          orderId,
          orderData.totalPrice
        );

        if (paypalResponse.success) {
          if (options.showSuccessToast) {
            toast.success("PayPal payment created successfully");
          }

          if (autoRedirect && paypalResponse.approveUrl) {
            window.location.href = paypalResponse.approveUrl;
          }

          return {
            orderId,
            paymentMethod: "PAYPAL",
          };
        }

        throw new Error("PayPal payment creation failed");
      } catch (paypalError) {
        console.error("PayPal payment failed:", paypalError);

        if (fallbackToCOD) {
          const confirmed = confirm(
            "PayPal hiện đang gặp sự cố. Bạn có muốn thanh toán khi nhận hàng không?\n\n" +
              "✅ Nhấn OK: Thanh toán khi nhận hàng\n" +
              "❌ Nhấn Cancel: Thử PayPal lại"
          );

          if (confirmed) {
            await this.createCODPayment(orderId);

            if (options.showSuccessToast) {
              toast.success("Đã chuyển sang thanh toán khi nhận hàng!");
            }

            return {
              orderId,
              paymentMethod: "COD",
            };
          }
        }

        throw paypalError;
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Có lỗi xảy ra khi tạo đơn hàng");
      throw error;
    }
  }

  private static async createBackendOrder(orderData: PayPalOrderData): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/simple`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        orderId: result.data?.id || result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  private static async createPayPalPayment(
    orderId: string,
    amount: number
  ): Promise<{
    success: boolean;
    approveUrl?: string;
    error?: string;
  }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/create-order`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId,
            amount: Math.round(amount),
            currency: "VND",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return {
        success: true,
        approveUrl: result.data?.approveUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  private static async createCODPayment(orderId: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId,
          method: "COD",
          note: "Cash on Delivery (PayPal fallback)",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create COD payment");
    }
  }

  static async capturePayPalPayment(
    paypalOrderId: string,
    orderId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/paypal/capture-order`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            paypalOrderId,
            orderId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}
