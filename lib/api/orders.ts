import api from "../api";
import {
  Order,
  OrderHistory,
  OrderTracking,
  OrderPreview,
  Voucher,
  VoucherValidationResult,
  ShippingInfo,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  ShippingMethod,
} from "@/types";
import {
  CreateOrderDto,
  CreateShippingDto,
  UpdateOrderStatusDto,
  OrderApiResponse,
  OrderListResponse,
  OrderTrackingResponse,
  OrderPreviewResponse,
  VoucherValidationResponse,
  ShippingCalculationResponse,
  PaymentCreationResponse,
  PaymentStatusResponse,
} from "@/types/api-order";

// Order API
export const orderApi = {
  // Create a new order
  createOrder: (orderData: CreateOrderDto): Promise<OrderApiResponse> =>
    api.post("/orders", orderData),

  // Get order by ID
  getOrder: (orderId: string): Promise<OrderApiResponse> =>
    api.get(`/orders/${orderId}`),

  // Get order by order number
  getOrderByNumber: (orderNumber: string): Promise<OrderApiResponse> =>
    api.get(`/orders/number/${orderNumber}`),

  // Get user's order history
  getOrderHistory: (
    page = 1,
    limit = 10,
    status?: OrderStatus
  ): Promise<OrderListResponse> =>
    api.get("/orders/history", { params: { page, limit, status } }),

  // Get order tracking information
  getOrderTracking: (orderNumber: string): Promise<OrderTrackingResponse> =>
    api.get(`/orders/${orderNumber}/tracking`),

  // Cancel order
  cancelOrder: (orderId: string, reason?: string): Promise<OrderApiResponse> =>
    api.patch(`/orders/${orderId}/cancel`, { reason }),

  // Admin: Update order status
  updateOrderStatus: (
    orderId: string,
    updateData: UpdateOrderStatusDto
  ): Promise<OrderApiResponse> =>
    api.patch(`/orders/${orderId}/status`, updateData),
  // Get order preview (calculate totals before creating order)
  getOrderPreview: (
    items: { productId: string; variantId: string; quantity: number }[],
    shippingInfo: CreateShippingDto,
    voucherCode?: string
  ): Promise<OrderPreviewResponse> =>
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
  ): Promise<VoucherValidationResponse> =>
    api.post("/vouchers/validate", { code, orderAmount }),

  // Get available vouchers for user
  getAvailableVouchers: (): Promise<{ data: Voucher[] }> =>
    api.get("/vouchers/available"),

  // Apply voucher to cart
  applyVoucher: (
    code: string,
    cartTotal: number
  ): Promise<{
    data: {
      voucher: Voucher;
      discountAmount: number;
      newTotal: number;
    };
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
  ): Promise<ShippingCalculationResponse> =>
    api.post("/shipping/calculate", {
      items,
      destination,
    }),

  // Get shipping methods
  getShippingMethods: (): Promise<{
    data: {
      id: string;
      name: string;
      description: string;
      baseFee: number;
      estimatedDays: number;
      isActive: boolean;
    }[];
  }> => api.get("/shipping/methods"),

  // Get provinces/cities
  getProvinces: (): Promise<{
    data: { code: string; name: string; districts: any[] }[];
  }> => api.get("/shipping/provinces"),

  // Get districts by province
  getDistricts: (
    provinceCode: string
  ): Promise<{
    data: { code: string; name: string; wards: any[] }[];
  }> => api.get(`/shipping/provinces/${provinceCode}/districts`),

  // Get wards by district
  getWards: (
    provinceCode: string,
    districtCode: string
  ): Promise<{
    data: { code: string; name: string }[];
  }> =>
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
  ): Promise<PaymentCreationResponse> =>
    api.post(`/orders/${orderId}/payment`, { paymentMethod }),

  // Check payment status
  checkPaymentStatus: (orderId: string): Promise<PaymentStatusResponse> =>
    api.get(`/orders/${orderId}/payment/status`),

  // Handle payment callback (webhook)
  handlePaymentCallback: (
    provider: string,
    data: any
  ): Promise<{
    success: boolean;
    orderId?: string;
    message?: string;
  }> => api.post(`/payments/callback/${provider}`, data),
};

export default {
  orderApi,
  voucherApi,
  shippingApi,
  paymentApi,
};
