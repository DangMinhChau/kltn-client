/**
 * Next.js Server Actions for Order Management
 * Provides server-side order operations with enhanced error handling
 */

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderApiResponse,
  OrderListResponse,
  OrderTrackingResponse,
} from "@/types/api-order";
import { Order, OrderStatus, PaymentMethod, ShippingMethod } from "@/types";

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Error classes for better error handling
class OrderActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "OrderActionError";
  }
}

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value || null;
}

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OrderActionError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      errorData.code,
      response.status
    );
  }

  return response.json();
}

// Server Actions

/**
 * Create a new order
 */
export async function createOrderAction(
  orderData: CreateOrderDto
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const response = await apiCall<OrderApiResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    // Revalidate related caches
    revalidateTag("orders");
    revalidateTag("user-orders");
    revalidatePath("/orders");
    revalidatePath("/cart");

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Create order error:", error);

    if (error instanceof OrderActionError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể tạo đơn hàng. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Get order by ID
 */
export async function getOrderAction(
  orderId: string
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const response = await apiCall<OrderApiResponse>(`/orders/${orderId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get order error:", error);

    if (error instanceof OrderActionError) {
      if (error.statusCode === 404) {
        return { success: false, error: "Không tìm thấy đơn hàng." };
      }
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể tải thông tin đơn hàng.",
    };
  }
}

/**
 * Get user's order history with pagination
 */
export async function getOrderHistoryAction(
  page = 1,
  limit = 10,
  status?: OrderStatus
): Promise<{
  success: boolean;
  data?: { orders: Order[]; total: number; page: number; limit: number };
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await apiCall<OrderListResponse>(
      `/orders/history?${queryParams.toString()}`
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get order history error:", error);

    if (error instanceof OrderActionError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể tải lịch sử đơn hàng.",
    };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrderAction(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${orderId}/cancel`,
      {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }
    );

    // Revalidate caches
    revalidateTag("orders");
    revalidateTag(`order-${orderId}`);
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Cancel order error:", error);

    if (error instanceof OrderActionError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatusAction(
  orderId: string,
  updateData: UpdateOrderStatusDto
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const response = await apiCall<OrderApiResponse>(
      `/orders/${orderId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }
    );

    // Revalidate caches
    revalidateTag("orders");
    revalidateTag(`order-${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Update order status error:", error);

    if (error instanceof OrderActionError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể cập nhật trạng thái đơn hàng.",
    };
  }
}

/**
 * Get order tracking information
 */
export async function getOrderTrackingAction(orderNumber: string): Promise<{
  success: boolean;
  data?: {
    order: Order;
    tracking: any;
    estimatedDelivery?: Date;
  };
  error?: string;
}> {
  try {
    const response = await apiCall<OrderTrackingResponse>(
      `/orders/${orderNumber}/tracking`
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Get order tracking error:", error);

    if (error instanceof OrderActionError) {
      if (error.statusCode === 404) {
        return {
          success: false,
          error: "Không tìm thấy thông tin theo dõi đơn hàng.",
        };
      }
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Không thể tải thông tin theo dõi đơn hàng.",
    };
  }
}

/**
 * Redirect to order payment page
 */
export async function redirectToPaymentAction(
  orderId: string,
  paymentMethod: PaymentMethod
) {
  try {
    // Create payment and get payment URL if needed
    const response = await apiCall(`/orders/${orderId}/payment`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    });

    if (response.data?.paymentUrl) {
      redirect(response.data.paymentUrl);
    } else {
      redirect(`/orders/${orderId}/payment`);
    }
  } catch (error) {
    console.error("Payment redirect error:", error);
    redirect(`/orders/${orderId}?error=payment_failed`);
  }
}

/**
 * Revalidate order-related caches
 */
export async function revalidateOrderCaches(orderId?: string) {
  revalidateTag("orders");
  revalidateTag("user-orders");

  if (orderId) {
    revalidateTag(`order-${orderId}`);
  }

  revalidatePath("/orders");
  revalidatePath("/admin/orders");
}

export default {
  createOrderAction,
  getOrderAction,
  getOrderHistoryAction,
  cancelOrderAction,
  updateOrderStatusAction,
  getOrderTrackingAction,
  redirectToPaymentAction,
  revalidateOrderCaches,
};
