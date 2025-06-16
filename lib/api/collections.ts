import { api } from "../api";
import { Collection, PaginationResult, ProductFilters, Product } from "@/types";

export interface CollectionFilters {
  search?: string;
  season?: string;
  year?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateCollectionData {
  name: string;
  season: string;
  year: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCollectionData {
  name?: string;
  season?: string;
  year?: number;
  description?: string;
  isActive?: boolean;
}

export interface AssignProductsData {
  productIds: number[];
}

// Public Collection API
export const collectionApi = {
  // Get all active collections with pagination
  getCollections: async (
    filters?: CollectionFilters
  ): Promise<PaginationResult<Collection>> => {
    const response = await api.get("/collections", { params: filters });
    const responseBody = response.data;

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

  // Get collection by slug
  getCollection: async (slug: string): Promise<Collection> => {
    const response = await api.get(`/collections/${slug}`);
    const responseBody = response.data;
    return responseBody.data;
  },

  // Get products by collection slug
  getCollectionProducts: async (
    slug: string,
    filters?: ProductFilters
  ): Promise<PaginationResult<Product>> => {
    const response = await api.get(`/products`, {
      params: { ...filters, collection: slug },
    });
    const responseBody = response.data;

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
};

// Admin Collection API
export const adminCollectionApi = {
  // Get all collections (including inactive)
  getCollections: async (
    filters?: CollectionFilters
  ): Promise<PaginationResult<Collection>> => {
    const response = await api.get("/admin/collections", { params: filters });
    const responseBody = response.data;

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

  // Get collection by ID
  getCollection: async (id: number): Promise<Collection> => {
    const response = await api.get(`/admin/collections/${id}`);
    const responseBody = response.data;
    return responseBody.data;
  },

  // Create new collection
  createCollection: async (data: CreateCollectionData): Promise<Collection> => {
    const response = await api.post("/admin/collections", data);
    const responseBody = response.data;
    return responseBody.data;
  },

  // Update collection
  updateCollection: async (
    id: number,
    data: UpdateCollectionData
  ): Promise<Collection> => {
    const response = await api.patch(`/admin/collections/${id}`, data);
    const responseBody = response.data;
    return responseBody.data;
  },

  // Delete collection
  deleteCollection: async (id: number): Promise<void> => {
    await api.delete(`/admin/collections/${id}`);
  },

  // Upload collection images
  uploadImages: async (id: number, files: File[]): Promise<Collection> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      `/admin/collections/${id}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const responseBody = response.data;
    return responseBody.data;
  },

  // Remove collection image
  removeImage: async (id: number, imageId: number): Promise<Collection> => {
    const response = await api.delete(
      `/admin/collections/${id}/images/${imageId}`
    );
    const responseBody = response.data;
    return responseBody.data;
  },

  // Assign products to collection
  assignProducts: async (
    id: number,
    data: AssignProductsData
  ): Promise<Collection> => {
    const response = await api.put(`/admin/collections/${id}/products`, data);
    const responseBody = response.data;
    return responseBody.data;
  },

  // Remove products from collection
  removeProducts: async (
    id: number,
    data: AssignProductsData
  ): Promise<Collection> => {
    const response = await api.delete(`/admin/collections/${id}/products`, {
      data,
    });
    const responseBody = response.data;
    return responseBody.data;
  },

  // Get collection analytics
  getAnalytics: async (id: number): Promise<any> => {
    const response = await api.get(`/admin/collections/${id}/analytics`);
    const responseBody = response.data;
    return responseBody.data;
  },
};
