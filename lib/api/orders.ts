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
    return response.data;
  },

  createPayPalOrder: async (
    orderData: CreateOrderData
  ): Promise<PayPalOrderResponse> => {
    const response = await api.post("/orders/paypal", orderData);
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getUserOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/orders/user", { params });
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderApi;
