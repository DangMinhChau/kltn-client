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
  timeout: 15000,
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
    console.log("API Response - Full data:", response.data); // Special handling for products endpoint that returns pagination
    // Only for main products API, not filter-options
    if (
      response.config.url?.includes("/products") &&
      !response.config.url?.includes("/filter-options") &&
      response.data &&
      response.data.meta &&
      response.data.data
    ) {
      console.log(
        "API Response - Products pagination detected, preserving meta"
      );
      return response.data; // Return entire response with data + meta for products
    }

    // Handle standard ApiResponse structure (NestJS format) for other endpoints
    if (
      response.data &&
      response.data.statusCode &&
      response.data.data !== undefined
    ) {
      console.log("API Response - Standard ApiResponse structure detected");
      return response.data.data; // Return just the data part for other APIs
    } // Check if response.data has a data property (NestJS format)
    if (response.data && response.data.data !== undefined) {
      console.log("API Response - NestJS data structure detected");
      return response.data.data;
    }

    // If response.data is an array or object, return it directly
    if (
      response.data &&
      (Array.isArray(response.data) || typeof response.data === "object")
    ) {
      console.log("API Response - Direct array/object");
      return response.data;
    }

    // Otherwise return the response.data directly
    console.log("API Response - Fallback");
    return response.data;
  },
  (error) => {
    console.error("API Error - Status:", error.response?.status);
    console.error("API Error - URL:", error.config?.url);
    console.error("API Error - Message:", error.response?.data?.message);
    console.error("API Error - Full Response:", error.response?.data);

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
  getProducts: (filters?: ProductFilters): Promise<PaginationResult<Product>> =>
    api.get("/products", { params: filters }),

  // Get single product by slug
  getProductBySlug: (slug: string): Promise<Product> =>
    api.get(`/products/${slug}`), // Get featured products (get newest products as featured)
  getFeaturedProducts: (limit = 8): Promise<Product[]> =>
    api.get("/products", {
      params: {
        sort: "newest",
        limit,
      },
    }),

  // Get products by category
  getProductsByCategory: (
    categorySlug: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> =>
    api.get("/products", {
      params: {
        category: categorySlug,
        ...filters,
      },
    }),

  // Search products
  searchProducts: (
    query: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> =>
    api.get("/products", {
      params: {
        search: query,
        ...filters,
      },
    }),
  // Get product filter options
  getFilterOptions: (categorySlug?: string): Promise<FilterOptions> => {
    const params = categorySlug ? { category: categorySlug } : {};
    return api.get("/products/filter-options", { params });
  },
};

// Category API
export const categoryApi = {
  // Get all categories
  getCategories: (): Promise<Category[]> => api.get("/categories"),

  // Get category by slug
  getCategory: (slug: string): Promise<Category> =>
    api.get(`/categories/${slug}`), // Get category tree
  getCategoryTree: (): Promise<Category[]> => api.get("/categories/tree"),
};

// Collection API
export const collectionApi = {
  // Get all collections
  getCollections: (): Promise<Collection[]> => api.get("/collections"),

  // Get collection by slug
  getCollection: (slug: string): Promise<Collection> =>
    api.get(`/collections/${slug}`),

  // Get products by collection
  getCollectionProducts: (
    slug: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> =>
    api.get(`/products`, { params: { ...filters, collection: slug } }),
};

// Style API
export const styleApi = {
  // Get all styles
  getStyles: (): Promise<Style[]> => api.get("/styles"),

  // Get style by slug
  getStyle: (slug: string): Promise<Style> => api.get(`/styles/${slug}`),
};

// Material API
export const materialApi = {
  // Get all materials
  getMaterials: (): Promise<Material[]> => api.get("/materials"),

  // Get material by slug
  getMaterial: (slug: string): Promise<Material> =>
    api.get(`/materials/${slug}`),
};

// Tag API
export const tagApi = {
  // Get all tags
  getTags: (): Promise<Tag[]> => api.get("/tags"),
};

// Color API
export const colorApi = {
  // Get all colors
  getColors: (): Promise<Color[]> => api.get("/colors"),
};

// Size API
export const sizeApi = {
  // Get all sizes
  getSizes: (): Promise<Size[]> => api.get("/sizes"),

  // Get sizes by type
  getSizesByType: (type: string): Promise<Size[]> =>
    api.get("/sizes", { params: { type } }),
};

// Filter API - Get all filter options
export const filterApi = {
  // Get all filter options for product filtering
  getFilterOptions: (): Promise<FilterOptions> =>
    api.get("/products/filter-options"),
};

// Export the main api instance for custom requests
export { api };
export default api;

// Import order APIs
export { orderApi, voucherApi, shippingApi, paymentApi } from "./api/orders";

// Import cart APIs
export { cartApi, cartItemsApi, cartHelpers } from "./api/cart";
