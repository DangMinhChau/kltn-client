import api from "../api";
import {
  Order,
  CreateOrderRequest,
  OrderHistory,
  OrderTracking,
  OrderPreview,
  Voucher,
  VoucherValidationResult,
  ShippingInfo,
  PaymentMethod,
} from "@/types";

// Order API
export const orderApi = {
  // Create a new order
  createOrder: (orderData: CreateOrderRequest): Promise<Order> =>
    api.post("/orders", orderData),

  // Get order by ID
  getOrder: (orderId: string): Promise<Order> => api.get(`/orders/${orderId}`),

  // Get order by order number
  getOrderByNumber: (orderNumber: string): Promise<Order> =>
    api.get(`/orders/number/${orderNumber}`),

  // Get user's order history
  getOrderHistory: (
    page = 1,
    limit = 10,
    status?: string
  ): Promise<OrderHistory> =>
    api.get("/orders/history", { params: { page, limit, status } }),

  // Get order tracking information
  getOrderTracking: (orderNumber: string): Promise<OrderTracking> =>
    api.get(`/orders/${orderNumber}/tracking`),

  // Cancel order
  cancelOrder: (orderId: string, reason?: string): Promise<Order> =>
    api.patch(`/orders/${orderId}/cancel`, { reason }),

  // Admin: Update order status
  updateOrderStatus: (
    orderId: string,
    status: string,
    notes?: string
  ): Promise<Order> =>
    api.patch(`/orders/${orderId}/status`, { status, notes }),

  // Get order preview (calculate totals before creating order)
  getOrderPreview: (
    items: { productId: string; variantId: string; quantity: number }[],
    shippingInfo: ShippingInfo,
    voucherCode?: string
  ): Promise<OrderPreview> =>
    api.post("/orders/preview", {
      items,
      shippingInfo,
      voucherCode,
    }),
};

// Voucher API
export const voucherApi = {
  // Validate voucher code
  validateVoucher: (
    code: string,
    orderAmount: number
  ): Promise<VoucherValidationResult> =>
    api.post("/vouchers/validate", { code, orderAmount }),

  // Get available vouchers for user
  getAvailableVouchers: (): Promise<Voucher[]> =>
    api.get("/vouchers/available"),

  // Apply voucher to cart
  applyVoucher: (
    code: string,
    cartTotal: number
  ): Promise<{
    voucher: Voucher;
    discountAmount: number;
    newTotal: number;
  }> => api.post("/vouchers/apply", { code, cartTotal }),
};

// Shipping API
export const shippingApi = {
  // Calculate shipping fee
  calculateShippingFee: (
    items: { productId: string; quantity: number }[],
    destination: {
      province: string;
      district: string;
      ward: string;
    }
  ): Promise<{
    standardFee: number;
    expressWithin24hFee: number;
    standardDeliveryDays: number;
    expressDeliveryDays: number;
  }> =>
    api.post("/shipping/calculate", {
      items,
      destination,
    }),

  // Get shipping methods
  getShippingMethods: (): Promise<
    {
      id: string;
      name: string;
      description: string;
      baseFee: number;
      estimatedDays: number;
      isActive: boolean;
    }[]
  > => api.get("/shipping/methods"),

  // Get provinces/cities
  getProvinces: (): Promise<
    { code: string; name: string; districts: any[] }[]
  > => api.get("/shipping/provinces"),

  // Get districts by province
  getDistricts: (
    provinceCode: string
  ): Promise<{ code: string; name: string; wards: any[] }[]> =>
    api.get(`/shipping/provinces/${provinceCode}/districts`),

  // Get wards by district
  getWards: (
    provinceCode: string,
    districtCode: string
  ): Promise<{ code: string; name: string }[]> =>
    api.get(
      `/shipping/provinces/${provinceCode}/districts/${districtCode}/wards`
    ),
};

// Payment API
export const paymentApi = {
  // Create payment for order
  createPayment: (
    orderId: string,
    paymentMethod: PaymentMethod
  ): Promise<{
    paymentUrl?: string; // For online payments
    qrCode?: string; // For QR code payments
    instructions?: string; // For bank transfer
  }> => api.post(`/orders/${orderId}/payment`, { paymentMethod }),

  // Check payment status
  checkPaymentStatus: (
    orderId: string
  ): Promise<{
    status: "pending" | "paid" | "failed";
    paidAt?: Date;
    transactionId?: string;
  }> => api.get(`/orders/${orderId}/payment/status`),

  // Handle payment callback (webhook)
  handlePaymentCallback: (
    provider: string,
    data: any
  ): Promise<{ success: boolean; orderId?: string }> =>
    api.post(`/payments/callback/${provider}`, data),
};

export default {
  orderApi,
  voucherApi,
  shippingApi,
  paymentApi,
};
