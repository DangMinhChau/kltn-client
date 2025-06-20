import { api } from "@/lib/api";

export interface CreateOrderData {
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number; // Changed from 'price' to 'unitPrice' to match backend
  }>;
  shippingAddress: any;
  paymentMethod: "COD" | "PAYPAL";
  voucherCode?: string;
  subTotal: number;
  shippingFee: number;
  discount?: number;
  totalPrice: number;
  note?: string;
  // Guest order fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  voucherId?: string;
}

export interface OrderResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  };
  message?: string;
}

export interface PayPalOrderResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    approvalUrl: string;
  };
}

export const orderApi = {
  createOrder: async (orderData: CreateOrderData): Promise<OrderResponse> => {
    const response = await api.post("/orders", orderData);
    const responseBody = response.data;
    // Backend returns BaseResponseDto format: { message, data: Order, meta }
    return {
      success: true,
      order: responseBody.data,
      message: responseBody.message,
    };
  },
  createPayPalOrder: async (
    orderData: CreateOrderData
  ): Promise<PayPalOrderResponse> => {
    const response = await api.post("/orders/paypal", orderData);
    const responseBody = response.data;
    // Backend returns BaseResponseDto format: { message, data: { orderId, approvalUrl }, meta }
    return {
      success: true,
      message: responseBody.message,
      data: responseBody.data, // { orderId, approvalUrl }
    };
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    const responseBody = response.data;
    // Backend returns: { message, data: Order, meta: { timestamp } }
    return responseBody.data;
  },
  getUserOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/orders/user/me", { params });
    const responseBody = response.data;
    // Backend returns: { message, data: Order[], meta: { page, total, etc } }
    return {
      data: responseBody.data,
      meta: responseBody.meta,
    };
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    const responseBody = response.data;
    // Backend returns: { message, data: Order, meta: { timestamp } }
    return responseBody.data;
  },
};

export default orderApi;
