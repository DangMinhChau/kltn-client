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
  OrderListApiResponse,
  OrderTrackingResponse,
  OrderPreviewResponse,
  VoucherValidationResponse,
  ShippingCalculationDto,
  PaymentCreationResponse,
  PaymentStatusResponse,
} from "@/types/api-order";

// Order API
export const orderApi = {
  // Create a new order
  createOrder: async (orderData: CreateOrderDto): Promise<OrderApiResponse> => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (orderId: string): Promise<OrderApiResponse> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber: string): Promise<OrderApiResponse> => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // Get user's order history
  getOrderHistory: async (
    page = 1,
    limit = 10,
    status?: OrderStatus
  ): Promise<OrderListApiResponse> => {
    const response = await api.get("/orders/history", {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Get order tracking information
  getOrderTracking: async (
    orderNumber: string
  ): Promise<OrderTrackingResponse> => {
    const response = await api.get(`/orders/${orderNumber}/tracking`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (
    orderId: string,
    reason?: string
  ): Promise<OrderApiResponse> => {
    const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    orderId: string,
    updateData: UpdateOrderStatusDto
  ): Promise<OrderApiResponse> => {
    const response = await api.patch(`/orders/${orderId}/status`, updateData);
    return response.data;
  },

  // Get order preview (calculate totals before creating order)
  getOrderPreview: async (
    items: { productId: string; variantId: string; quantity: number }[],
    shippingInfo: CreateShippingDto,
    voucherCode?: string
  ): Promise<OrderPreviewResponse> => {
    const response = await api.post("/orders/preview", {
      items,
      shippingInfo,
      voucherCode,
    });
    return response.data;
  },
};

// Voucher API
export const voucherApi = {
  // Validate voucher code (GET endpoint with query params)
  validateVoucher: async (
    code: string,
    orderAmount: number
  ): Promise<VoucherValidationResponse> => {
    const response = await api.get(
      `/vouchers/validate/${code}?orderTotal=${orderAmount}`
    );
    return response.data;
  },

  // Get available vouchers for user (active vouchers)
  getAvailableVouchers: async (): Promise<{ data: Voucher[] }> => {
    const response = await api.get("/vouchers/active");
    return response.data;
  },

  // Apply voucher to cart
  applyVoucher: async (
    code: string,
    cartTotal: number
  ): Promise<{
    data: {
      voucher: Voucher;
      discountAmount: number;
      newTotal: number;
    };
  }> => {
    const response = await api.post("/vouchers/apply", {
      code,
      orderTotal: cartTotal,
    });
    return response.data;
  },
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
  ): Promise<ShippingCalculationDto> =>
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

  // PayPal specific endpoints
  createPayPalOrder: (
    orderId: string,
    amount: number,
    currency: string = "USD"
  ): Promise<{
    message: string;
    data: {
      paypalOrderId: string;
      status: string;
      orderId: string;
    };
    meta: {
      timestamp: string;
    };
  }> =>
    api.post("/payments/paypal/create-order", {
      orderId,
      amount,
      currency,
    }),

  capturePayPalOrder: (
    paypalOrderId: string,
    orderId: string
  ): Promise<{
    message: string;
    data: any;
    meta: {
      timestamp: string;
    };
  }> =>
    api.post("/payments/paypal/capture-order", {
      paypalOrderId,
      orderId,
    }),
};

export default {
  orderApi,
  voucherApi,
  shippingApi,
  paymentApi,
};
