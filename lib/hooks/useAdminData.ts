import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { DashboardAnalytics, AdminStats } from "@/lib/api/admin";
import { adminApi } from "@/lib/api/admin";

// Product interface for admin
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  status: "active" | "inactive" | "draft";
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  mainImageUrl: string;
  featured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// User interface for admin
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Order interface for admin
export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  total: number;
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export interface UseDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: (data: T | null) => void;
}

export interface UseListDataReturn<T> extends UseDataReturn<T[]> {
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  search: string;
  setSearch: (search: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

// Generic hook for single data fetching
export function useAdminData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refresh();
  }, [refresh, ...deps]);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}

// Generic hook for list data with pagination, search, and filtering
export function useAdminListData<T>(
  fetchFn: (params: {
    page: number;
    limit: number;
    search?: string;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<{ data: T[]; total: number }>,
  initialPageSize = 10
): UseListDataReturn<T> {
  const [data, setDataState] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const setSorting = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setPage(1); // Reset to first page when sorting changes
    },
    []
  );

  const setData = useCallback((newData: T[] | null) => {
    if (newData === null) {
      setDataState([]);
    } else {
      setDataState(newData);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn({
        page,
        limit: pageSize,
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sortBy: sortBy || undefined,
        sortOrder,
      });
      setDataState(result.data);
      setTotal(result.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, search, filters, sortBy, sortOrder]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  return {
    data,
    total,
    loading,
    error,
    page,
    pageSize,
    search,
    filters,
    sortBy,
    sortOrder,
    setData,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setSorting,
    refresh,
  };
}

// Simple wrapper functions for API calls that return the response data
const extractResponseData = async (apiCall: any) => {
  const response = await apiCall;
  return response.data;
};

const extractListResponseData = async (apiCall: any) => {
  const response = await apiCall;
  return {
    data: response.data?.data || response.data || [],
    total: response.data?.total || response.data?.length || 0,
  };
};

// Users hooks
export function useUsers(): UseListDataReturn<User> {
  return useAdminListData<User>(async (params) => {
    return extractListResponseData(adminApi.users.getAll(params));
  });
}

export function useUser(id: string): UseDataReturn<User> {
  return useAdminData<User>(async () => {
    return extractResponseData(adminApi.users.getById(id));
  }, [id]);
}

// Products hooks
export function useProducts(): UseListDataReturn<Product> {
  return useAdminListData<Product>(async (params) => {
    return extractListResponseData(adminApi.products.getAll(params));
  });
}

export function useProduct(id: string): UseDataReturn<Product> {
  return useAdminData<Product>(async () => {
    return extractResponseData(adminApi.products.getById(id));
  }, [id]);
}

// Orders hooks
export function useOrders(): UseListDataReturn<Order> {
  return useAdminListData<Order>(async (params) => {
    return extractListResponseData(adminApi.orders.getAll(params));
  });
}

export function useOrder(id: string): UseDataReturn<Order> {
  return useAdminData<Order>(async () => {
    return extractResponseData(adminApi.orders.getById(id));
  }, [id]);
}

// Reviews hooks
export function useReviews(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    // Convert generic sortOrder to specific review sortOrder
    const reviewParams = {
      ...params,
      sortOrder:
        params.sortOrder === "asc" ? ("ASC" as const) : ("DESC" as const),
    };
    return extractListResponseData(adminApi.reviews.getAll(reviewParams));
  });
}

export function useReview(id: string): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.reviews.getById(id));
  }, [id]);
}

// Variants hooks
export function useVariants(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.variants.getAll(params));
  });
}

export function useVariant(id: string): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.variants.getById(id));
  }, [id]);
}

export function useProductVariants(productId: string): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.variants.getByProduct(productId));
  }, [productId]);
}

// Notifications hooks
export function useNotifications(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    // Convert generic sortOrder to specific notification sortOrder
    const notificationParams = {
      ...params,
      sortOrder:
        params.sortOrder === "asc" ? ("ASC" as const) : ("DESC" as const),
    };
    return extractListResponseData(
      adminApi.notifications.getAll(notificationParams)
    );
  });
}

export function useNotification(id: string): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.notifications.getById(id));
  }, [id]);
}

export function useNotificationStats(): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.notifications.getStats());
  });
}

// Inventory hooks (using variants data)
export function useInventory(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    // Transform variants data to inventory format
    const response = await adminApi.inventory.getAll(params);
    return extractListResponseData(response);
  });
}

export function useInventoryMovements(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    // Mock implementation since backend doesn't support stock movements
    return {
      data: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 0,
    };
  });
}

export function useInventoryAnalytics(): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    // Mock implementation since backend doesn't support inventory analytics
    return {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      topSellingItems: [],
      slowMovingItems: [],
      monthlyMovements: [],
    };
  });
}

export function useLowStockItems(threshold?: number): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    const response = await adminApi.inventory.getLowStock(threshold);
    return extractResponseData(response);
  }, [threshold]);
}

export function useReorderAlerts(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    // Mock implementation since backend doesn't support reorder alerts
    return [];
  });
}

// System monitoring hooks (replacing existing ones)
export function useSystemMetrics(): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.system.getMetrics());
  });
}

export function useSystemResources(): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.system.getResources());
  });
}

export function useSystemServices(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.system.getServices());
  });
}

// Product attributes hooks
export function useColors(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.attributes.getColors());
  });
}

export function useSizes(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.attributes.getSizes());
  });
}

export function useMaterials(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.attributes.getMaterials());
  });
}

export function useTags(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.attributes.getTags());
  });
}

export function useStyles(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.attributes.getStyles());
  });
}

// Vouchers hooks
export function useVouchers(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.vouchers.getAll(params));
  });
}

export function useVoucher(id: string): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.vouchers.getById(id));
  }, [id]);
}

// Categories hooks
export function useCategories(): UseDataReturn<any[]> {
  return useAdminData<any[]>(async () => {
    return extractResponseData(adminApi.categories.getAll());
  });
}

// Collections hooks
export function useCollections(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.collections.getAll(params));
  });
}

export function useCollection(id: string): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.collections.getById(id));
  }, [id]);
}

// Shipping hooks
export function useShippingMethods(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.shipping.getMethods(params));
  });
}

// System hooks
export function useSystemHealth(): UseDataReturn<any> {
  return useAdminData<any>(async () => {
    return extractResponseData(adminApi.system.getHealth());
  });
}

export function useSystemLogs(): UseListDataReturn<any> {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.system.getLogs(params));
  });
}

// Dashboard hooks
export function useDashboardAnalytics(period?: "7d" | "30d" | "90d" | "1y") {
  return useAdminData(async () => {
    // Mock data for now - replace with real API later
    const mockData: DashboardAnalytics = {
      revenueChart: [
        { date: "2024-01-01", revenue: 50000, orders: 10 },
        { date: "2024-01-02", revenue: 75000, orders: 15 },
        { date: "2024-01-03", revenue: 60000, orders: 12 },
      ],
      topProducts: [
        { id: "1", name: "Product 1", sales: 100, revenue: 500000 },
        { id: "2", name: "Product 2", sales: 80, revenue: 400000 },
      ],
      recentOrders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          customer: "John Doe",
          total: 250000,
          status: "completed",
          createdAt: "2024-01-01T10:00:00Z",
        },
      ],
      customerGrowth: [
        { month: "Jan 2024", customers: 100 },
        { month: "Feb 2024", customers: 120 },
        { month: "Mar 2024", customers: 145 },
      ],
    };
    return mockData;
  }, [period]);
}

export function useAdminStats() {
  return useAdminData(async () => {
    // Mock data matching StatsCards interface - replace with real API later
    const mockStats = {
      revenue: {
        total: 2500000,
        growth: 12.5,
        thisMonth: 450000,
        lastMonth: 400000,
      },
      orders: {
        total: 450,
        growth: 8.3,
        pending: 15,
        completed: 400,
        cancelled: 35,
      },
      customers: {
        total: 1250,
        growth: 15.2,
        active: 1100,
        new: 85,
      },
      products: {
        total: 120,
        active: 115,
        outOfStock: 3,
        lowStock: 5,
      },
    };
    return mockStats;
  });
}

// Webhook dashboard hooks
export function useWebhookDashboard(hours: number = 24) {
  return useAdminData(async () => {
    return extractResponseData(adminApi.webhooks.getOverview(hours));
  }, [hours]);
}

export function useWebhookEvents() {
  return useAdminListData<any>(async (params) => {
    return extractListResponseData(adminApi.webhooks.getEvents(params));
  });
}

export function useWebhookHealth() {
  return useAdminData(async () => {
    return extractResponseData(adminApi.webhooks.getHealth());
  });
}

// Mutation hooks for CRUD operations
export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.products.create(data);
      toast.success("Product created successfully");
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create product";
      setError(message);
      toast.error("Error", { description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, data: FormData | object) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.products.update(id, data);
      toast.success("Product updated successfully");
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update product";
      setError(message);
      toast.error("Error", { description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.products.delete(id);
      toast.success("Product deleted successfully");
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete product";
      setError(message);
      toast.error("Error", { description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.users.create(data);
      toast.success("User created successfully");
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      setError(message);
      toast.error("Error", { description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutateAsync, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.users.update(id, data);
      toast.success("User updated successfully");
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update user";
      setError(message);
      toast.error("Error", { description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useActivateVoucher() {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await adminApi.vouchers.activate(id);
      toast.success("Voucher activated successfully");
      return response;
    } catch (err) {
      toast.error("Failed to activate voucher");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading };
}

export function useDeactivateVoucher() {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await adminApi.vouchers.deactivate(id);
      toast.success("Voucher deactivated successfully");
      return response;
    } catch (err) {
      toast.error("Failed to deactivate voucher");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading };
}

export function useDeleteVoucher() {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await adminApi.vouchers.delete(id);
      toast.success("Voucher deleted successfully");
      return response;
    } catch (err) {
      toast.error("Failed to delete voucher");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading };
}
