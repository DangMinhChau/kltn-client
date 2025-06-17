import axios from "axios";
import {
  Product,
  Category,
  Collection,
  Style,
  Material,
  Tag,
  Color,
  Size,
  PaginationResult,
  ProductFilters,
  FilterOptions,
  ApiResponse,
} from "@/types";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log("API Request - URL:", config.url);
    console.log("API Request - Token exists:", !!token);
    console.log(
      "API Request - Token preview:",
      token ? token.substring(0, 20) + "..." : "No token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Request - Authorization header set");
    } else {
      console.warn("API Request - No access token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("API Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log("API Response - Status:", response.status);
    console.log("API Response - URL:", response.config.url);
    console.log("API Response - Data:", response.data);

    // Return the full response for the API methods to handle
    return response;
  },
  (error) => {
    console.error("API Error - Status:", error.response?.status);
    console.error("API Error - URL:", error.config?.url);
    console.error("API Error - Message:", error.response?.data?.message);
    console.error("API Error - Full Response:", error.response?.data);

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn(
        "API Error - Unauthorized (401), clearing tokens and redirecting to login"
      );

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Only redirect if we're on an admin route
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
      ) {
        window.location.href =
          "/auth/login?redirect=" +
          encodeURIComponent(window.location.pathname);
      }
    }

    if (error.response) {
      console.error("Error Response:", error.response.data);
      console.error("Error Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

// Product API
export const productApi = {
  // Get all products with filters (public endpoint)
  getProducts: async (
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> => {
    const response = await api.get("/products", { params: filters });
    const responseBody = response.data; // { message, data, meta }

    // Backend returns: { message, data: Product[], meta: { page, limit, total, totalPages, timestamp } }
    return {
      data: responseBody.data || [],
      meta: {
        page: responseBody.meta?.page || 1,
        limit: responseBody.meta?.limit || 10,
        total: responseBody.meta?.total || 0,
        totalPages: responseBody.meta?.totalPages || 0,
      },
    };
  },

  // Get single product by slug
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    const responseBody = response.data;

    // Backend returns: { message, data: Product, meta: { timestamp } }
    return responseBody.data;
  },

  // Get featured products (get newest products as featured)
  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    const response = await api.get("/products", {
      params: {
        sort: "newest",
        limit,
      },
    });
    const responseBody = response.data;

    return responseBody.data || [];
  },
  // Get products on sale
  getSaleProducts: async (params?: {
    page?: number;
    limit?: number;
    sort?: "newest" | "price_asc" | "price_desc" | "discount_desc";
  }): Promise<PaginationResult<Product>> => {
    console.log("getSaleProducts called with params:", params);

    const response = await api.get("/products/sale", {
      params: {
        page: 1,
        limit: 20,
        sort: "discount_desc",
        ...params,
      },
    });

    console.log("getSaleProducts raw response:", response.data);
    const responseBody = response.data;

    const result = {
      data: responseBody.data || [],
      meta: {
        total: responseBody.meta?.total || 0,
        totalPages: responseBody.meta?.totalPages || 0,
        page: responseBody.meta?.page || 1,
        limit: responseBody.meta?.limit || 20,
      },
    };

    console.log("getSaleProducts processed result:", result);
    return result;
  },

  // Get products by category
  getProductsByCategory: async (
    categorySlug: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> => {
    const response = await api.get("/products", {
      params: {
        category: categorySlug,
        ...filters,
      },
    });
    const responseBody = response.data;

    // Backend returns: { message, data: Product[], meta: { page, limit, total, totalPages, timestamp } }
    return {
      data: responseBody.data || [],
      meta: {
        page: responseBody.meta?.page || 1,
        limit: responseBody.meta?.limit || 10,
        total: responseBody.meta?.total || 0,
        totalPages: responseBody.meta?.totalPages || 0,
      },
    };
  },

  // Search products
  searchProducts: async (
    query: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> => {
    const response = await api.get("/products", {
      params: {
        search: query,
        ...filters,
      },
    });
    const responseBody = response.data;

    // Backend returns: { message, data: Product[], meta: { page, limit, total, totalPages, timestamp } }
    return {
      data: responseBody.data || [],
      meta: {
        page: responseBody.meta?.page || 1,
        limit: responseBody.meta?.limit || 10,
        total: responseBody.meta?.total || 0,
        totalPages: responseBody.meta?.totalPages || 0,
      },
    };
  },

  // Get product filter options
  getFilterOptions: async (categorySlug?: string): Promise<FilterOptions> => {
    const params = categorySlug ? { category: categorySlug } : {};
    const response = await api.get("/products/filter-options", { params });
    const responseBody = response.data;

    // Backend returns: { message, data: FilterOptions, meta: { timestamp } }
    return responseBody.data;
  },

  // Get sale statistics
  getSaleStatistics: async (): Promise<{
    totalSaleProducts: number;
    maxDiscountPercent: number;
    averageDiscountPercent: number;
    totalDiscountValue: number;
  }> => {
    const response = await api.get("/products/sale/statistics");
    const responseBody = response.data;
    return (
      responseBody.data || {
        totalSaleProducts: 0,
        maxDiscountPercent: 0,
        averageDiscountPercent: 0,
        totalDiscountValue: 0,
      }
    );
  },
};

// Category API
export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    const responseBody = response.data;

    // Backend returns: { message, data: Category[], meta: { timestamp } }
    return responseBody.data || [];
  },

  // Get category by slug
  getCategory: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/${slug}`);
    const responseBody = response.data;

    // Backend returns: { message, data: Category, meta: { timestamp } }
    return responseBody.data;
  },

  // Get category tree
  getCategoryTree: async (): Promise<Category[]> => {
    const response = await api.get("/categories/tree");
    const responseBody = response.data;

    // Backend returns: { message, data: Category[], meta: { timestamp } }
    return responseBody.data || [];
  },
};

// Collection API
export { collectionApi, adminCollectionApi } from "./api/collections";

// Style API
export const styleApi = {
  // Get all styles
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get("/styles");
    const responseBody = response.data;

    // Backend returns: { message, data: Style[], meta: { timestamp, total } }
    return responseBody.data || [];
  },

  // Get style by slug
  getStyle: async (slug: string): Promise<Style> => {
    const response = await api.get(`/styles/${slug}`);
    const responseBody = response.data;

    // Backend returns: { message, data: Style, meta: { timestamp } }
    return responseBody.data;
  },
};

// Material API
export const materialApi = {
  // Get all materials
  getMaterials: async (): Promise<Material[]> => {
    const response = await api.get("/materials");
    const responseBody = response.data;

    // Backend returns: { message, data: Material[], meta: { timestamp, total } }
    return responseBody.data || [];
  },

  // Get material by slug
  getMaterial: async (slug: string): Promise<Material> => {
    const response = await api.get(`/materials/${slug}`);
    const responseBody = response.data;

    // Backend returns: { message, data: Material, meta: { timestamp } }
    return responseBody.data;
  },
};

// Tag API
export const tagApi = {
  // Get all tags
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get("/tags");
    const responseBody = response.data;

    // Backend returns: { message, data: Tag[], meta: { timestamp, total } }
    return responseBody.data || [];
  },
};

// Color API
export const colorApi = {
  // Get all colors
  getColors: async (): Promise<Color[]> => {
    const response = await api.get("/colors");
    const responseBody = response.data;

    // Backend returns: { message, data: Color[], meta: { timestamp, total } }
    return responseBody.data || [];
  },
};

// Size API
export const sizeApi = {
  // Get all sizes
  getSizes: async (): Promise<Size[]> => {
    const response = await api.get("/sizes");
    const responseBody = response.data;

    // Backend returns: { message, data: Size[], meta: { timestamp, total } }
    return responseBody.data || [];
  },

  // Get sizes by type
  getSizesByType: async (type: string): Promise<Size[]> => {
    const response = await api.get("/sizes", { params: { type } });
    const responseBody = response.data;

    // Backend returns: { message, data: Size[], meta: { timestamp, total } }
    return responseBody.data || [];
  },
};

// Filter API - Get all filter options
export const filterApi = {
  // Get all filter options for product filtering
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await api.get("/products/filter-options");
    const responseBody = response.data;

    // Backend returns: { message, data: FilterOptions, meta: { timestamp } }
    return responseBody.data;
  },
};

// Export the main api instance for custom requests
export { api };
export default api;

// Order APIs - sẽ được xây dựng lại

// Import cart APIs
export { cartApi, cartItemsApi, cartHelpers } from "./api/cart";
