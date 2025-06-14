/**
 * Enhanced React Hooks for Order Management
 * Using new types and error handling
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  orderApi,
  shippingApi,
  paymentApi,
  OrderApiError,
  transformOrderApiResponse,
} from "@/lib/api/enhanced-order";

import {
  CreateOrderDto,
  CreateOrderPaymentDto,
  CompleteOrderDto,
  OrderQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CalculateShippingFeeDto,
} from "@/types/api-order";

import {
  Order,
  OrderApiResponse,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingStatus,
} from "@/types/order";

// ================================
// ORDER HOOKS
// ================================

/**
 * Hook to fetch orders with filtering and pagination
 */
export function useOrders(params?: OrderQueryDto) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderApi.getOrders(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch single order by ID
 */
export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: enabled && !!orderId,
    staleTime: 60000, // 1 minute
    select: (data) => transformOrderApiResponse(data.data),
  });
}

/**
 * Hook to fetch order by order number
 */
export function useOrderByNumber(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: ["order-by-number", orderNumber],
    queryFn: () => orderApi.getOrderByNumber(orderNumber),
    enabled: enabled && !!orderNumber,
    staleTime: 60000,
    select: (data) => transformOrderApiResponse(data.data),
  });
}

/**
 * Hook to create new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderDto) => orderApi.createOrder(orderData),
    onSuccess: (data) => {
      toast.success("Đơn hàng được tạo thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi tạo đơn hàng");
    },
  });
}

/**
 * Hook to create order with payment
 */
export function useCreateOrderWithPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderPaymentDto) =>
      orderApi.createOrderWithPayment(orderData),
    onSuccess: (data) => {
      toast.success("Đơn hàng và thanh toán được tạo thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Redirect to payment URL if available
      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      }
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi tạo đơn hàng và thanh toán");
    },
  });
}

/**
 * Hook to complete order (create + payment + shipping)
 */
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CompleteOrderDto) =>
      orderApi.completeOrder(orderData),
    onSuccess: (data) => {
      toast.success("Đơn hàng hoàn tất thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      }
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi hoàn tất đơn hàng");
    },
  });
}

/**
 * Hook to update order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      updateData,
    }: {
      orderId: string;
      updateData: UpdateOrderDto;
    }) => orderApi.updateOrder(orderId, updateData),
    onSuccess: (data, variables) => {
      toast.success("Cập nhật đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi cập nhật đơn hàng");
    },
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      statusData,
    }: {
      orderId: string;
      statusData: UpdateOrderStatusDto;
    }) => orderApi.updateOrderStatus(orderId, statusData),
    onSuccess: (data, variables) => {
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi cập nhật trạng thái");
    },
  });
}

/**
 * Hook to cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      orderApi.cancelOrder(orderId, reason),
    onSuccess: (data, variables) => {
      toast.success("Hủy đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi hủy đơn hàng");
    },
  });
}

// ================================
// SHIPPING HOOKS
// ================================

/**
 * Hook to calculate shipping fee
 */
export function useCalculateShippingFee() {
  return useMutation({
    mutationFn: (feeData: CalculateShippingFeeDto) =>
      shippingApi.calculateShippingFee(feeData),
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi tính phí vận chuyển");
    },
  });
}

/**
 * Hook to get available shipping services
 */
export function useAvailableShippingServices(districtId?: number) {
  return useQuery({
    queryKey: ["shipping-services", districtId],
    queryFn: () => shippingApi.getAvailableServices(districtId!),
    enabled: !!districtId,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to get order tracking
 */
export function useOrderTracking(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: () => shippingApi.getOrderTracking(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });
}

/**
 * Hook to get shipping tracking
 */
export function useShippingTracking(shippingId: string, enabled = true) {
  return useQuery({
    queryKey: ["shipping-tracking", shippingId],
    queryFn: () => shippingApi.getShippingTracking(shippingId),
    enabled: enabled && !!shippingId,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook to validate shipping address
 */
export function useValidateShippingAddress() {
  return useMutation({
    mutationFn: (addressData: {
      provinceId: number;
      districtId: number;
      wardCode: string;
    }) => shippingApi.validateAddress(addressData),
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi xác thực địa chỉ");
    },
  });
}

// ================================
// PAYMENT HOOKS
// ================================

/**
 * Hook to retry payment
 */
export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      paymentMethod,
    }: {
      orderId: string;
      paymentMethod: PaymentMethod;
    }) => paymentApi.retryPayment(orderId, paymentMethod),
    onSuccess: (data, variables) => {
      toast.success("Thử lại thanh toán thành công!");
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });

      if (data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      }
    },
    onError: (error: OrderApiError) => {
      toast.error(error.message || "Lỗi khi thử lại thanh toán");
    },
  });
}

/**
 * Hook to get payment status
 */
export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: () => paymentApi.getPaymentStatus(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 10000, // Refetch every 10 seconds for pending payments
    staleTime: 5000,
  });
}

// ================================
// UTILITY HOOKS
// ================================

/**
 * Hook to manage order state and actions
 */
export function useOrderManager(orderId: string) {
  const { data: order, isLoading, error } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const retryPaymentMutation = useRetryPayment();

  const canCancel = useMemo(() => {
    if (!order) return false;
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ].includes(order.status);
  }, [order]);

  const canRetryPayment = useMemo(() => {
    if (!order) return false;
    return (
      order.payment?.status === PaymentStatus.FAILED ||
      order.payment?.status === PaymentStatus.PENDING
    );
  }, [order]);

  const updateStatus = useCallback(
    (status: OrderStatus, note?: string) => {
      updateStatusMutation.mutate({
        orderId,
        statusData: { status, note },
      });
    },
    [orderId, updateStatusMutation]
  );

  const cancelOrder = useCallback(
    (reason?: string) => {
      cancelMutation.mutate({ orderId, reason });
    },
    [orderId, cancelMutation]
  );

  const retryPayment = useCallback(
    (paymentMethod: PaymentMethod) => {
      retryPaymentMutation.mutate({ orderId, paymentMethod });
    },
    [orderId, retryPaymentMutation]
  );

  return {
    order,
    isLoading,
    error,
    canCancel,
    canRetryPayment,
    updateStatus,
    cancelOrder,
    retryPayment,
    isUpdating: updateStatusMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isRetryingPayment: retryPaymentMutation.isPending,
  };
}

/**
 * Hook for order filters and pagination
 */
export function useOrderFilters() {
  const [filters, setFilters] = useState<OrderQueryDto>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const updateFilter = useCallback((key: keyof OrderQueryDto, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when changing other filters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters,
  };
}

export default {
  useOrders,
  useOrder,
  useOrderByNumber,
  useCreateOrder,
  useCreateOrderWithPayment,
  useCompleteOrder,
  useUpdateOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useCalculateShippingFee,
  useAvailableShippingServices,
  useOrderTracking,
  useShippingTracking,
  useValidateShippingAddress,
  useRetryPayment,
  usePaymentStatus,
  useOrderManager,
  useOrderFilters,
};
