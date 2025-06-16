import { api } from "../api";
import { Product, ProductFilters } from "@/types";

export interface SearchProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const searchProducts = async (
  params: ProductFilters
): Promise<SearchProductsResponse> => {
  const searchParams = new URLSearchParams();

  // Map ProductFilters to API params
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.category) searchParams.append("category", params.category);
  if (params.color) searchParams.append("color", params.color);
  if (params.size) searchParams.append("size", params.size);
  if (params.minPrice)
    searchParams.append("priceMin", params.minPrice.toString());
  if (params.maxPrice)
    searchParams.append("priceMax", params.maxPrice.toString());
  if (params.sortBy) {
    // Map sortBy to backend sort format
    const sortMapping: Record<string, string> = {
      name: "name_asc",
      price: "price_asc",
      createdAt: "newest",
      rating: "relevance",
    };
    searchParams.append("sort", sortMapping[params.sortBy] || "newest");
  }

  const response = await api.get(`/products?${searchParams.toString()}`);
  return response.data;
};

export const getProduct = async (slug: string): Promise<Product> => {
  const response = await api.get(`/products/${slug}`);
  return response.data.data;
};

export const getProductFilters = async () => {
  const response = await api.get("/products/filters");
  return response.data.data;
};

export const getSaleProducts = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<SearchProductsResponse> => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
  }

  const response = await api.get(`/products/sale?${searchParams.toString()}`);
  return response.data;
};

export const getSaleStatistics = async () => {
  const response = await api.get("/products/sale/statistics");
  return response.data.data;
};
