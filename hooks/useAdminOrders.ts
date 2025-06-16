"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminOrdersApi,
  AdminOrderFilters,
  AdminOrderResponse,
} from "@/lib/api/admin";
import { OrderStatus } from "@/types";
import { toast } from "sonner";

interface UseAdminOrdersParams {
  initialFilters?: AdminOrderFilters;
}

interface UseAdminOrdersReturn {
  orders: AdminOrderResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: AdminOrderFilters;
  statistics: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  } | null;
  statsLoading: boolean;
  // Actions
  setFilters: (filters: AdminOrderFilters) => void;
  updateFilter: (key: keyof AdminOrderFilters, value: any) => void;
  setPage: (page: number) => void;
  refreshOrders: () => void;
  refreshStats: () => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  exportOrders: () => Promise<void>;
}

export function useAdminOrders({
  initialFilters = {
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  },
}: UseAdminOrdersParams = {}): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<AdminOrderFilters>(initialFilters);
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminOrdersApi.getOrders(filters);
      setOrders(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const stats = await adminOrdersApi.getOrderStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error("Failed to fetch order statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: AdminOrderFilters) => {
    setFiltersState(newFilters);
  }, []);

  const updateFilter = useCallback(
    (key: keyof AdminOrderFilters, value: any) => {
      setFiltersState((prev) => ({
        ...prev,
        [key]: value,
        page: key === "page" ? value : 1, // Reset to page 1 when other filters change
      }));
    },
    []
  );

  const setPage = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      try {
        await adminOrdersApi.updateOrderStatus(orderId, {
          status,
          notes: note,
        });
        toast.success("Cập nhật trạng thái đơn hàng thành công");

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );

        // Refresh statistics
        fetchStatistics();
      } catch (err: any) {
        toast.error(err.message || "Không thể cập nhật trạng thái đơn hàng");
        throw err;
      }
    },
    [fetchStatistics]
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      try {
        await adminOrdersApi.cancelOrder(orderId, reason);
        toast.success("Hủy đơn hàng thành công");

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: OrderStatus.CANCELLED }
              : order
          )
        );

        // Refresh statistics
        fetchStatistics();
      } catch (err: any) {
        toast.error(err.message || "Không thể hủy đơn hàng");
        throw err;
      }
    },
    [fetchStatistics]
  );

  // Delete order
  const deleteOrder = useCallback(
    async (orderId: string) => {
      try {
        await adminOrdersApi.deleteOrder(orderId);
        toast.success("Xóa đơn hàng thành công");

        // Remove from local state
        setOrders((prev) => prev.filter((order) => order.id !== orderId));

        // Update pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit),
        }));

        // Refresh statistics
        fetchStatistics();
      } catch (err: any) {
        toast.error(err.message || "Không thể xóa đơn hàng");
        throw err;
      }
    },
    [fetchStatistics]
  );

  // Export orders
  const exportOrders = useCallback(async () => {
    try {
      await adminOrdersApi.exportOrders(filters);
      toast.success("Xuất dữ liệu thành công");
    } catch (err: any) {
      toast.error(err.message || "Không thể xuất dữ liệu");
      throw err;
    }
  }, [filters]);

  // Refresh functions
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  const refreshStats = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Effects
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    statistics,
    statsLoading,
    setFilters,
    updateFilter,
    setPage,
    refreshOrders,
    refreshStats,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    exportOrders,
  };
}
