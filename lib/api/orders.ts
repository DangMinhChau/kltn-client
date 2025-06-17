import { api } from "@/lib/api";

export interface CreateOrderData {
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
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
    // Backend returns BaseResponseDto format
    return responseBody.data || responseBody;
  },

  createPayPalOrder: async (
    orderData: CreateOrderData
  ): Promise<PayPalOrderResponse> => {
    const response = await api.post("/orders/paypal", orderData);
    const responseBody = response.data;
    // Backend returns BaseResponseDto format
    return responseBody.data || responseBody;
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
    const response = await api.get("/orders/user", { params });
    const responseBody = response.data;
    // Backend returns: { message, data: Order[], meta: { page, total, etc } }
    return responseBody.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    const responseBody = response.data;
    // Backend returns: { message, data: Order, meta: { timestamp } }
    return responseBody.data;
  },
};

export default orderApi;
