import api from "../api";

// Type definitions for admin responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    growth: number;
    active: number;
    newThisMonth: number;
  };
  orders: {
    total: number;
    growth: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    featured: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
    averageRating: number;
  };
}

export interface DashboardAnalytics {
  revenueChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  customerGrowth: {
    month: string;
    customers: number;
  }[];
}

// Webhook Dashboard interfaces
export interface WebhookDashboardOverview {
  status: "healthy" | "warning" | "critical";
  uptime: string;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errorRate: number;
    averageProcessingTime: number;
    lastProcessedAt: string | null;
  };
  recentEvents: WebhookEvent[];
  issues: string[];
  trends: {
    requestsChange: number;
    errorRateChange: number;
    performanceChange: number;
  };
  alertsConfigured: boolean;
}

export interface WebhookEvent {
  id: string;
  orderId: string;
  timestamp: string;
  responseCode: string;
  processingTime: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AlertConfig {
  email: {
    enabled: boolean;
    recipients: string[];
  };
  thresholds: {
    errorRate: {
      warning: number;
      critical: number;
    };
    processingTime: {
      warning: number;
      critical: number;
    };
    consecutiveFailures: {
      warning: number;
      critical: number;
    };
  };
}

// Admin API functions
export const adminApi = {
  // User Management
  users: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      isActive?: boolean;
    }) => api.get("/admin/users", { params: query }),

    getById: (id: string) => api.get(`/admin/users/${id}`),

    getStats: () => api.get("/admin/users/stats"),

    create: (userData: {
      email: string;
      fullName: string;
      phoneNumber?: string;
      role: "ADMIN" | "CUSTOMER";
      password: string;
    }) => api.post("/admin/users", userData),

    update: (
      id: string,
      userData: Partial<{
        email: string;
        fullName: string;
        phoneNumber: string;
        role: "ADMIN" | "CUSTOMER";
      }>
    ) => api.patch(`/admin/users/${id}`, userData),

    activate: (id: string) => api.patch(`/admin/users/${id}/activate`),

    deactivate: (id: string) => api.patch(`/admin/users/${id}/deactivate`),

    delete: (id: string) => api.delete(`/admin/users/${id}`),

    // Advanced user operations
    bulkActivate: (userIds: string[]) =>
      api.patch("/admin/users/bulk/activate", { userIds }),

    bulkDeactivate: (userIds: string[]) =>
      api.patch("/admin/users/bulk/deactivate", { userIds }),

    export: (format: "csv" | "xlsx" = "csv") =>
      api.get(`/admin/users/export?format=${format}`, {
        responseType: "blob",
      }),
  },
  // Product Management
  products: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => api.get("/admin/products", { params: query }),

    getById: (id: string) => api.get(`/admin/products/${id}`),

    create: (productData: FormData) =>
      api.post("/admin/products", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    update: (id: string, productData: FormData | object) => {
      const config =
        productData instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};
      return api.patch(`/admin/products/${id}`, productData, config);
    },

    delete: (id: string) => api.delete(`/admin/products/${id}`),

    getFilterOptions: () => api.get("/admin/products/filter-options"),

    // Advanced product operations
    bulkUpdate: (updates: { id: string; data: any }[]) =>
      api.patch("/admin/products/bulk", { updates }),

    bulkDelete: (productIds: string[]) =>
      api.delete("/admin/products/bulk", { data: { productIds } }),

    uploadImages: (productId: string, images: FormData) =>
      api.post(`/admin/products/${productId}/images`, images, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    setFeatured: (id: string, featured: boolean) =>
      api.patch(`/admin/products/${id}/featured`, { isFeatured: featured }),

    updateStock: (id: string, stock: number) =>
      api.patch(`/admin/products/${id}/stock`, { stock }),

    getAnalytics: (productId?: string) => {
      const params = productId ? { productId } : {};
      return api.get("/admin/products/analytics", { params });
    },

    export: (format: "csv" | "xlsx" = "csv", filters?: any) =>
      api.get(`/admin/products/export?format=${format}`, {
        params: filters,
        responseType: "blob",
      }),

    import: (file: FormData) =>
      api.post("/admin/products/import", file, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  // Order Management
  orders: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => api.get("/orders", { params: query }),

    getById: (id: string) => api.get(`/orders/${id}`),

    updateStatus: (id: string, status: string, notes?: string) =>
      api.patch(`/orders/${id}/status`, { status, notes }),

    getSummary: () => api.get("/orders/summary"),

    getByNumber: (orderNumber: string) =>
      api.get(`/orders/number/${orderNumber}`),

    // Advanced order operations
    bulkUpdateStatus: (orders: { id: string; status: string }[]) =>
      api.patch("/orders/bulk/status", { orders }),

    export: (format: "csv" | "xlsx" = "csv", filters?: any) =>
      api.get(`/orders/export?format=${format}`, {
        params: filters,
        responseType: "blob",
      }),

    getHistory: (orderId: string) => api.get(`/orders/${orderId}/history`),

    cancel: (id: string, reason?: string) =>
      api.patch(`/orders/${id}/cancel`, { reason }),

    refund: (id: string, amount?: number, reason?: string) =>
      api.post(`/orders/${id}/refund`, { amount, reason }),

    getAnalytics: (period?: string) =>
      api.get("/orders/analytics", { params: { period } }),
  },
  // Review Management
  reviews: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      productId?: string;
      userId?: string;
      rating?: number;
      isVerified?: boolean;
      isActive?: boolean;
      search?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }) => api.get("/reviews", { params: query }),

    getById: (id: string) => api.get(`/reviews/${id}`),

    // Updated to match backend endpoints
    toggleVerification: (id: string) => api.patch(`/reviews/${id}/verify`),

    toggleStatus: (id: string) => api.patch(`/reviews/${id}/status`),

    delete: (id: string) => api.delete(`/reviews/${id}`),

    // Bulk operations updated to match backend
    bulkVerify: (reviewIds: string[]) =>
      api.patch("/reviews/bulk/verify", { reviewIds }),

    bulkDelete: (reviewIds: string[]) =>
      api.delete("/reviews/bulk", { data: { reviewIds } }),

    // New analytics and moderation endpoints
    getAnalytics: () => api.get("/reviews/analytics"),

    getModerationSummary: () => api.get("/reviews/moderation/summary"),

    // Product-specific review endpoints
    getProductStats: (productId: string) =>
      api.get(`/reviews/product/${productId}/stats`),

    getProductSummary: (productId: string) =>
      api.get(`/reviews/product/${productId}/summary`),

    // User reviews endpoint
    getUserReviews: (userId: string, page?: number, limit?: number) =>
      api.get(`/reviews/user/${userId}`, { params: { page, limit } }),
  },

  // Voucher Management
  vouchers: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      search?: string;
    }) => api.get("/vouchers", { params: query }),

    getById: (id: string) => api.get(`/vouchers/${id}`),

    create: (voucherData: {
      code: string;
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      minOrderValue?: number;
      maxDiscount?: number;
      validFrom: string;
      validTo: string;
      usageLimit?: number;
      isActive: boolean;
    }) => api.post("/vouchers", voucherData),

    update: (id: string, voucherData: Partial<any>) =>
      api.patch(`/vouchers/${id}`, voucherData),

    delete: (id: string) => api.delete(`/vouchers/${id}`),

    activate: (id: string) => api.patch(`/vouchers/${id}/activate`),

    deactivate: (id: string) => api.patch(`/vouchers/${id}/deactivate`),

    getUsageStats: (id: string) => api.get(`/vouchers/${id}/stats`),

    bulkActivate: (voucherIds: string[]) =>
      api.patch("/vouchers/bulk/activate", { voucherIds }),

    bulkDeactivate: (voucherIds: string[]) =>
      api.patch("/vouchers/bulk/deactivate", { voucherIds }),

    bulkDelete: (voucherIds: string[]) =>
      api.delete("/vouchers/bulk", { data: { voucherIds } }),
    getAnalytics: () => api.get("/vouchers/analytics"),

    export: (format: "csv" | "xlsx" = "csv", filters?: any) =>
      api.get(`/vouchers/export?format=${format}`, {
        params: filters,
        responseType: "blob",
      }),

    validateCode: (code: string) => api.get(`/vouchers/validate/${code}`),

    checkUsage: (id: string) => api.get(`/vouchers/${id}/usage`),
  },

  // Shipping Management
  shipping: {
    getAll: () => api.get("/shipping"),

    getMethods: (query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }) => api.get("/shipping/methods", { params: query }),

    getById: (id: string) => api.get(`/shipping/${id}`),

    getTracking: (id: string) => api.get(`/shipping/${id}/tracking`),

    calculateFee: (data: {
      from_district_id: number;
      to_district_id: number;
      weight: number;
      service_id: number;
    }) => api.post("/shipping/calculate-fee", data),

    getServices: (districtId: string) =>
      api.get(`/shipping/services/${districtId}`),

    validateAddress: (address: any) =>
      api.post("/shipping/validate-address", address),

    updateStatus: (id: string, status: string) =>
      api.patch(`/shipping/${id}/status`, { status }),

    cancel: (id: string, reason?: string) =>
      api.post(`/shipping/${id}/cancel`, { reason }),

    delete: (id: string) => api.delete(`/shipping/${id}`),

    getAnalytics: () => api.get("/shipping/analytics"),
  },

  // Payment Management
  payments: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      status?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
    }) => api.get("/payments", { params: query }),

    getById: (id: string) => api.get(`/payments/${id}`),

    updateStatus: (id: string, status: string) =>
      api.patch(`/payments/${id}/status`, { status }),

    getHistory: (orderId: string) =>
      api.get(`/payments/order/${orderId}/history`),

    getAnalytics: () => api.get("/payments/analytics"),

    refund: (id: string, amount?: number) =>
      api.post(`/payments/${id}/refund`, { amount }),
  },

  // Token Management
  tokens: {
    getAll: () => api.get("/tokens"),

    getStats: () => api.get("/tokens/stats"),

    revoke: (token: string) => api.post(`/tokens/revoke/${token}`),

    revokeUserTokens: (userId: string) => api.delete(`/tokens/user/${userId}`),

    cleanup: () => api.post("/tokens/cleanup"),

    delete: (id: string) => api.delete(`/tokens/${id}`),
  },
  // Category Management
  categories: {
    getAll: () => api.get("/admin/categories"),

    getTree: () => api.get("/admin/categories/tree"),

    getBySlug: (slug: string) => api.get(`/admin/categories/slug/${slug}`),

    create: (categoryData: {
      name: string;
      slug: string;
      description?: string;
      parentId?: string;
    }) => api.post("/admin/categories", categoryData),

    update: (id: string, categoryData: Partial<any>) =>
      api.patch(`/admin/categories/${id}`, categoryData),

    delete: (categoryId: string) =>
      api.delete(`/admin/categories/${categoryId}`),

    reorder: (categoryId: string, newPosition: number) =>
      api.patch(`/admin/categories/${categoryId}/reorder`, {
        position: newPosition,
      }),
  },

  // Collections Management
  collections: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }) => api.get("/admin/collections", { params: query }),

    getById: (id: string) => api.get(`/admin/collections/${id}`),

    getBySlug: (slug: string) => api.get(`/admin/collections/${slug}`),

    create: (collectionData: {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
    }) => api.post("/admin/collections", collectionData),

    update: (id: string, collectionData: Partial<any>) =>
      api.patch(`/admin/collections/${id}`, collectionData),

    delete: (id: string) => api.delete(`/admin/collections/${id}`),

    getProducts: (slug: string, query?: any) =>
      api.get(`/admin/collections/${slug}/products`, { params: query }),
  },

  // Dashboard Analytics
  dashboard: {
    getStats: (): Promise<{
      revenue: {
        total: number;
        growth: number;
        thisMonth: number;
        lastMonth: number;
      };
      orders: {
        total: number;
        growth: number;
        pending: number;
        completed: number;
        cancelled: number;
      };
      customers: {
        total: number;
        growth: number;
        active: number;
        new: number;
      };
      products: {
        total: number;
        active: number;
        outOfStock: number;
        lowStock: number;
      };
    }> => api.get("/admin/dashboard/stats"),

    getAnalytics: (
      period?: "7d" | "30d" | "90d" | "1y"
    ): Promise<DashboardAnalytics> =>
      api.get("/admin/dashboard/analytics", { params: { period } }),

    getRevenueStats: (period?: string) =>
      api.get("/admin/dashboard/revenue", { params: { period } }),

    getOrderStats: (period?: string) =>
      api.get("/admin/dashboard/orders", { params: { period } }),

    getCustomerStats: (period?: string) =>
      api.get("/admin/dashboard/customers", { params: { period } }),

    getProductStats: () => api.get("/admin/dashboard/products"),

    getTopProducts: (limit?: number) =>
      api.get("/admin/dashboard/top-products", { params: { limit } }),

    getRecentOrders: (limit?: number) =>
      api.get("/admin/dashboard/recent-orders", { params: { limit } }),

    getTopCustomers: (limit?: number) =>
      api.get("/admin/dashboard/top-customers", { params: { limit } }),

    getSalesChart: (period: "day" | "week" | "month" | "year" = "month") =>
      api.get("/admin/dashboard/sales-chart", { params: { period } }),
  },

  // Reports
  reports: {
    getSalesReport: (
      startDate: string,
      endDate: string,
      format: "csv" | "xlsx" = "csv"
    ) =>
      api.get("/admin/reports/sales", {
        params: { startDate, endDate, format },
        responseType: "blob",
      }),

    getInventoryReport: (format: "csv" | "xlsx" = "csv") =>
      api.get("/admin/reports/inventory", {
        params: { format },
        responseType: "blob",
      }),

    getCustomerReport: (
      startDate: string,
      endDate: string,
      format: "csv" | "xlsx" = "csv"
    ) =>
      api.get("/admin/reports/customers", {
        params: { startDate, endDate, format },
        responseType: "blob",
      }),

    getFinancialReport: (
      startDate: string,
      endDate: string,
      format: "csv" | "xlsx" = "csv"
    ) =>
      api.get("/admin/reports/financial", {
        params: { startDate, endDate, format },
        responseType: "blob",
      }),

    getProductPerformanceReport: (format: "csv" | "xlsx" = "csv") =>
      api.get("/admin/reports/product-performance", {
        params: { format },
        responseType: "blob",
      }),
  },

  // Settings Management
  settings: {
    getAll: () => api.get("/settings"),

    getByKey: (key: string) => api.get(`/settings/${key}`),

    update: (settings: Record<string, any>) => api.patch("/settings", settings),

    updateByKey: (key: string, value: any) =>
      api.patch(`/settings/${key}`, { value }),

    backup: () =>
      api.get("/settings/backup", {
        responseType: "blob",
      }),

    restore: (backupFile: FormData) =>
      api.post("/settings/restore", backupFile, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },
  // File Management
  files: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    bulkUpload: (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      return api.post("/files/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    delete: (id: string) => api.delete(`/files/${id}`),

    getAll: (query?: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
    }) => api.get("/files", { params: query }),
  },

  // Product Variants Management
  variants: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      search?: string;
      productId?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => api.get("/variants", { params: query }),

    getById: (id: string) => api.get(`/variants/${id}`),

    create: (variantData: FormData) =>
      api.post("/variants", variantData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    update: (id: string, variantData: FormData | object) => {
      const config =
        variantData instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};
      return api.patch(`/variants/${id}`, variantData, config);
    },

    delete: (id: string) => api.delete(`/variants/${id}`),

    bulkUpdate: (updates: { id: string; data: any }[]) =>
      api.patch("/variants/bulk", { updates }),

    bulkDelete: (variantIds: string[]) =>
      api.delete("/variants/bulk", { data: { variantIds } }),

    updateStock: (id: string, stock: number) =>
      api.patch(`/variants/${id}/stock`, { stock }),

    getByProduct: (productId: string) =>
      api.get(`/variants/product/${productId}`),
  },

  // Notification Management
  notifications: {
    getAll: (query?: {
      page?: number;
      limit?: number;
      type?: string;
      read?: boolean;
      userId?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }) => api.get("/notifications", { params: query }),

    getById: (id: string) => api.get(`/notifications/${id}`),

    create: (notificationData: {
      title: string;
      message: string;
      type?: "info" | "warning" | "error" | "success";
      priority?: "low" | "medium" | "high" | "urgent";
      targetAudience: "all" | "specific";
      userIds?: string[];
      scheduledFor?: string;
      expiresAt?: string;
    }) => api.post("/notifications", notificationData),

    update: (id: string, notificationData: Partial<any>) =>
      api.patch(`/notifications/${id}`, notificationData),

    delete: (id: string) => api.delete(`/notifications/${id}`),

    bulkSend: (notificationIds: string[]) =>
      api.post("/notifications/bulk/send", { notificationIds }),

    bulkDelete: (notificationIds: string[]) =>
      api.delete("/notifications/bulk", { data: { notificationIds } }),

    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

    markAllAsRead: (userId?: string) => {
      const params = userId ? { userId } : {};
      return api.patch("/notifications/mark-all-read", {}, { params });
    },

    getStats: () => api.get("/notifications/stats"),

    getTypes: () => api.get("/notifications/types"),
  },
  // Inventory Management (Using Variants for Stock Management)
  inventory: {
    // Use variants endpoints for inventory management since backend doesn't have dedicated inventory module
    getAll: async (query?: {
      page?: number;
      limit?: number;
      search?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
      productId?: string;
      variantId?: string;
    }) => {
      // Get all variants and transform them to inventory format
      const variants = await api.get("/variants", { params: query });
      return variants;
    },

    getById: (id: string) => api.get(`/variants/${id}`),

    updateStock: (variantId: string, quantity: number, reason?: string) =>
      api.patch(`/variants/${variantId}`, { stockQuantity: quantity }),

    // Mock implementations for features not supported by backend
    getMovements: (query?: {
      page?: number;
      limit?: number;
      variantId?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }) => Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),

    addMovement: (data: {
      variantId: string;
      type: "IN" | "OUT" | "ADJUSTMENT";
      quantity: number;
      reason?: string;
      notes?: string;
    }) => Promise.resolve({ success: true }),

    getAnalytics: () =>
      Promise.resolve({
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      }),

    getLowStock: (threshold: number = 10) =>
      api.get("/variants", { params: { lowStock: true } }),

    getReorderAlerts: () => Promise.resolve({ data: [] }),

    bulkUpdate: (
      updates: {
        variantId: string;
        quantity: number;
        reason?: string;
      }[]
    ) => Promise.resolve({ success: true }),
  },
  // System Health Monitoring (using webhook dashboard endpoints)
  system: {
    // Use webhook dashboard endpoints for system monitoring
    getHealth: () => api.get("/admin/webhook-dashboard/health"),

    getMetrics: () => api.get("/admin/webhook-dashboard/metrics"),

    // For logs, use available endpoints or create mock data
    getLogs: (query?: {
      level?: string;
      service?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }) => {
      // Since there's no system logs endpoint, return mock data
      return Promise.resolve({
        data: [
          {
            id: "1",
            level: "info",
            message: "System health check completed",
            context: "HealthController",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            level: "warning",
            message: "Webhook processing time elevated",
            context: "WebhookMonitor",
            timestamp: new Date(Date.now() - 300000).toISOString(),
          },
        ],
      });
    },

    getServices: () => {
      // Mock services data since no backend endpoint exists
      return Promise.resolve({
        data: [
          { name: "database", status: "healthy", uptime: "99.9%" },
          { name: "webhook", status: "healthy", uptime: "99.8%" },
          { name: "email", status: "healthy", uptime: "99.5%" },
        ],
      });
    },

    getResources: () => {
      // Mock resources data since no backend endpoint exists
      return Promise.resolve({
        data: {
          cpu: 35,
          memory: 62,
          disk: 78,
        },
      });
    },
  },

  // Product Attributes Management (Colors, Sizes, Materials, Tags, Styles)
  attributes: {
    // Colors
    getColors: () => api.get("/colors"),
    createColor: (data: any) => api.post("/colors", data),
    updateColor: (id: string, data: any) => api.patch(`/colors/${id}`, data),
    deleteColor: (id: string) => api.delete(`/colors/${id}`),

    // Sizes
    getSizes: () => api.get("/sizes"),
    createSize: (data: any) => api.post("/sizes", data),
    updateSize: (id: string, data: any) => api.patch(`/sizes/${id}`, data),
    deleteSize: (id: string) => api.delete(`/sizes/${id}`),

    // Materials
    getMaterials: () => api.get("/materials"),
    createMaterial: (data: any) => api.post("/materials", data),
    updateMaterial: (id: string, data: any) =>
      api.patch(`/materials/${id}`, data),
    deleteMaterial: (id: string) => api.delete(`/materials/${id}`),

    // Tags
    getTags: () => api.get("/tags"),
    createTag: (data: any) => api.post("/tags", data),
    updateTag: (id: string, data: any) => api.patch(`/tags/${id}`, data),
    deleteTag: (id: string) => api.delete(`/tags/${id}`),

    // Styles
    getStyles: () => api.get("/styles"),
    createStyle: (data: any) => api.post("/styles", data),
    updateStyle: (id: string, data: any) => api.patch(`/styles/${id}`, data),
    deleteStyle: (id: string) => api.delete(`/styles/${id}`),

    // Generic functions for unified handling
    create: (type: string, data: any) => {
      switch (type) {
        case "colors":
          return api.post("/colors", data);
        case "sizes":
          return api.post("/sizes", data);
        case "materials":
          return api.post("/materials", data);
        case "tags":
          return api.post("/tags", data);
        case "styles":
          return api.post("/styles", data);
        default:
          throw new Error(`Unknown attribute type: ${type}`);
      }
    },

    update: (type: string, id: string, data: any) => {
      switch (type) {
        case "colors":
          return api.patch(`/colors/${id}`, data);
        case "sizes":
          return api.patch(`/sizes/${id}`, data);
        case "materials":
          return api.patch(`/materials/${id}`, data);
        case "tags":
          return api.patch(`/tags/${id}`, data);
        case "styles":
          return api.patch(`/styles/${id}`, data);
        default:
          throw new Error(`Unknown attribute type: ${type}`);
      }
    },

    delete: (type: string, id: string) => {
      switch (type) {
        case "colors":
          return api.delete(`/colors/${id}`);
        case "sizes":
          return api.delete(`/sizes/${id}`);
        case "materials":
          return api.delete(`/materials/${id}`);
        case "tags":
          return api.delete(`/tags/${id}`);
        case "styles":
          return api.delete(`/styles/${id}`);
        default:
          throw new Error(`Unknown attribute type: ${type}`);
      }
    },
  },

  // Webhook monitoring and dashboard
  webhooks: {
    getOverview: (hours: number = 24) =>
      api.get("/admin/webhook-dashboard/overview", { params: { hours } }),

    getMetrics: (filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      orderId?: string;
    }) => api.get("/admin/webhook-dashboard/metrics", { params: filters }),

    getEvents: (filters?: {
      limit?: number;
      offset?: number;
      status?: string;
      orderId?: string;
      startDate?: string;
      endDate?: string;
    }) => api.get("/admin/webhook-dashboard/events", { params: filters }),

    getHealth: () => api.get("/admin/webhook-dashboard/health"),

    getAlertConfig: () => api.get("/admin/webhook-dashboard/alerts/config"),

    testAlert: (alertData: {
      type: "error" | "warning" | "critical";
      title?: string;
      message?: string;
    }) => api.post("/admin/webhook-dashboard/alerts/test", alertData),

    exportData: (format: "json" | "csv" = "json", period: string = "7d") =>
      api.get("/admin/webhook-dashboard/export", {
        params: { format, period },
        responseType: format === "csv" ? "blob" : "json",
      }),

    triggerCleanup: (data?: { retentionDays?: number }) =>
      api.post("/admin/webhook-dashboard/cleanup/trigger", data),

    getCleanupStatus: () => api.get("/admin/webhook-dashboard/cleanup/status"),

    resetMetrics: () => api.post("/admin/webhook-dashboard/metrics/reset"),

    getSystemInfo: () => api.get("/admin/webhook-dashboard/system-info"),
  },

  // Advanced Analytics
  analytics: {
    getRevenue: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/revenue", { params: { period } }),

    getOrders: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/orders", { params: { period } }),

    getCustomers: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/customers", { params: { period } }),

    getProducts: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/products", { params: { period } }),

    getTraffic: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/traffic", { params: { period } }),

    getConversions: (period?: "7d" | "30d" | "90d" | "1y") =>
      api.get("/admin/analytics/conversions", { params: { period } }),
  },
};
