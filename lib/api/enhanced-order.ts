/**
 * Enhanced Order API Service
 * Using new types for better integration with backend
 */

import {
  CreateOrderDto,
  CreateOrderPaymentDto,
  CompleteOrderDto,
  CreateShippingDto,
  CalculateShippingFeeDto,
  OrderQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  BaseResponseDto,
  PaginatedResponseDto,
} from "@/types/api-order";

import {
  Order,
  OrderApiResponse,
  ShippingTrackingResponse,
  ShippingFeeResponse,
  AvailableShippingService,
  OrderStatus,
  PaymentMethod,
} from "@/types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ================================
// ERROR HANDLING
// ================================

export class OrderApiError extends Error {
  constructor(message: string, public statusCode?: number, public data?: any) {
    super(message);
    this.name = "OrderApiError";
  }
}

async function handleApiResponse<T>(
  response: Response
): Promise<BaseResponseDto<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new OrderApiError(
      data.message || "API request failed",
      response.status,
      data
    );
  }

  return data;
}

// ================================
// ORDER MANAGEMENT APIs
// ================================

export const orderApi = {
  /**
   * Create a new order
   */
  async createOrder(
    orderData: CreateOrderDto
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    return handleApiResponse<OrderApiResponse>(response);
  },

  /**
   * Create order with payment
   */
  async createOrderWithPayment(orderData: CreateOrderPaymentDto): Promise<
    BaseResponseDto<{
      order: OrderApiResponse;
      paymentUrl?: string;
      transactionId?: string;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/orders/with-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    return handleApiResponse(response);
  },

  /**
   * Complete order (create + payment + shipping)
   */
  async completeOrder(orderData: CompleteOrderDto): Promise<
    BaseResponseDto<{
      order: OrderApiResponse;
      paymentUrl?: string;
      shipping: any;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/orders/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    return handleApiResponse(response);
  },
  /**
   * Get orders with filtering and pagination
   */
  async getOrders(
    params?: OrderQueryDto
  ): Promise<
    BaseResponseDto<OrderApiResponse[]> & {
      meta: { total: number; page: number; limit: number; totalPages: number };
    }
  > {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleApiResponse<OrderApiResponse[]>(response) as any;
  },

  /**
   * Get order by ID
   */
  async getOrderById(
    orderId: string
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleApiResponse<OrderApiResponse>(response);
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(
    orderNumber: string
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(
      `${API_BASE_URL}/orders/number/${orderNumber}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    return handleApiResponse<OrderApiResponse>(response);
  },

  /**
   * Update order
   */
  async updateOrder(
    orderId: string,
    updateData: UpdateOrderDto
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    });

    return handleApiResponse<OrderApiResponse>(response);
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    statusData: UpdateOrderStatusDto
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(statusData),
    });

    return handleApiResponse<OrderApiResponse>(response);
  },

  /**
   * Cancel order
   */
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<BaseResponseDto<OrderApiResponse>> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ reason }),
    });

    return handleApiResponse<OrderApiResponse>(response);
  },
};

// ================================
// SHIPPING APIs
// ================================

export const shippingApi = {
  /**
   * Calculate shipping fee
   */
  async calculateShippingFee(
    feeData: CalculateShippingFeeDto
  ): Promise<ShippingFeeResponse> {
    const response = await fetch(`${API_BASE_URL}/shipping/calculate-fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(feeData),
    });
    const result = await handleApiResponse(response);
    return {
      success: true,
      data: result.data as any,
    };
  },

  /**
   * Get available shipping services for a district
   */
  async getAvailableServices(
    districtId: number
  ): Promise<BaseResponseDto<AvailableShippingService[]>> {
    const response = await fetch(
      `${API_BASE_URL}/shipping/services/${districtId}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    return handleApiResponse<AvailableShippingService[]>(response);
  },
  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<ShippingTrackingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/shipping/order/${orderId}/tracking`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    const result = await handleApiResponse(response);
    return {
      success: true,
      data: result.data as any,
    };
  },

  /**
   * Get shipping tracking by shipping ID
   */
  async getShippingTracking(
    shippingId: string
  ): Promise<ShippingTrackingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/shipping/${shippingId}/tracking`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    const result = await handleApiResponse(response);
    return {
      success: true,
      data: result.data as any,
    };
  },

  /**
   * Validate shipping address
   */
  async validateAddress(addressData: {
    provinceId: number;
    districtId: number;
    wardCode: string;
  }): Promise<BaseResponseDto<boolean>> {
    const response = await fetch(`${API_BASE_URL}/shipping/validate-address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(addressData),
    });

    return handleApiResponse<boolean>(response);
  },
};

// ================================
// PAYMENT APIs
// ================================

export const paymentApi = {
  /**
   * Retry payment for an order
   */
  async retryPayment(
    orderId: string,
    paymentMethod: PaymentMethod
  ): Promise<
    BaseResponseDto<{
      paymentUrl?: string;
      transactionId?: string;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/payments/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ orderId, paymentMethod }),
    });

    return handleApiResponse(response);
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string): Promise<BaseResponseDto<any>> {
    const response = await fetch(`${API_BASE_URL}/payments/status/${orderId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return handleApiResponse(response);
  },
};

// ================================
// UTILITY FUNCTIONS
// ================================

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

/**
 * Transform backend order response to frontend Order type
 */
export function transformOrderApiResponse(
  apiResponse: OrderApiResponse
): Order {
  return {
    id: apiResponse.id,
    orderNumber: apiResponse.orderNumber,
    user: apiResponse.user,
    customerName: apiResponse.customerName,
    customerEmail: apiResponse.customerEmail,
    customerPhone: apiResponse.customerPhone,
    shippingAddress: apiResponse.shippingAddress,
    status: apiResponse.status as OrderStatus,
    subTotal: apiResponse.subTotal,
    shippingFee: apiResponse.shippingFee,
    discount: apiResponse.discount,
    totalPrice: apiResponse.totalPrice,
    items: apiResponse.items,
    voucher: apiResponse.voucher,
    payment: apiResponse.payment,
    shipping: apiResponse.shipping,
    orderedAt: apiResponse.orderedAt,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    isPaid: apiResponse.isPaid,
    paidAt: apiResponse.paidAt,
    canceledAt: apiResponse.canceledAt,
    completedAt: apiResponse.completedAt,
    note: apiResponse.note,
  };
}

export default {
  orderApi,
  shippingApi,
  paymentApi,
  OrderApiError,
  transformOrderApiResponse,
};
