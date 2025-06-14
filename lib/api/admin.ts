/**
 * Clean Admin API for Products Management
 * Aligned with NestJS backend structure
 */

import { api } from "@/lib/api";
import {
  Product,
  ProductVariant,
  Category,
  Collection,
  Color,
  Size,
  Material,
  Style,
  Tag,
  PaginationResult,
} from "@/types";

// ================================
// TYPES & INTERFACES
// ================================

export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "updatedAt" | "basePrice";
  sortOrder?: "ASC" | "DESC";
}

export interface CreateProductData {
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  discount?: number;
  baseSku: string;
  isActive?: boolean;
  materialIds?: string[];
  styleIds?: string[];
  tagIds?: string[];
  collectionIds?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface BackendResponse<T> {
  message: string;
  data: T;
  meta: {
    timestamp: string;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// ================================
// PRODUCTS API
// ================================

export const adminProductsApi = {
  // Get all products with pagination and filters
  getProducts: async (
    filters: AdminProductFilters = {}
  ): Promise<PaginationResult<Product>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<BackendResponse<Product[]>>(
      `/admin/products?${params.toString()}`
    );

    return {
      data: response.data.data || [],
      total: response.data.meta.total || 0,
      page: response.data.meta.page || 1,
      limit: response.data.meta.limit || 10,
      totalPages: response.data.meta.totalPages || 1,
    };
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<BackendResponse<Product>>(
      `/admin/products/${id}`
    );
    return response.data.data;
  },

  // Create new product
  createProduct: async (
    data: CreateProductData,
    image?: File
  ): Promise<Product> => {
    const formData = new FormData();

    // Add product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add image if provided
    if (image) {
      formData.append("image", image);
    }

    const response = await api.post<BackendResponse<Product>>(
      "/admin/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Update product
  updateProduct: async (
    id: string,
    data: UpdateProductData,
    image?: File
  ): Promise<Product> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (image) {
      formData.append("image", image);
    }

    const response = await api.patch<BackendResponse<Product>>(
      `/admin/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  // Delete product (soft delete)
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  // Restore deleted product
  restoreProduct: async (id: string): Promise<Product> => {
    const response = await api.patch<BackendResponse<Product>>(
      `/admin/products/${id}/restore`
    );
    return response.data.data;
  },

  // Toggle product active status
  toggleActive: async (id: string): Promise<Product> => {
    const response = await api.patch<BackendResponse<Product>>(
      `/admin/products/${id}`,
      { toggleActive: true }
    );
    return response.data.data;
  },
};

// ================================
// CATEGORIES API
// ================================

export const adminCategoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<BackendResponse<Category[]>>(
      "/admin/categories"
    );
    return response.data.data || [];
  },

  createCategory: async (data: {
    name: string;
    description?: string;
    parentId?: string;
  }): Promise<Category> => {
    const response = await api.post<BackendResponse<Category>>(
      "/admin/categories",
      data
    );
    return response.data.data;
  },

  updateCategory: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
    }
  ): Promise<Category> => {
    const response = await api.patch<BackendResponse<Category>>(
      `/admin/categories/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
};

// ================================
// COLLECTIONS API
// ================================

export const adminCollectionsApi = {
  getCollections: async (): Promise<Collection[]> => {
    const response = await api.get<BackendResponse<Collection[]>>(
      "/admin/collections"
    );
    return response.data.data || [];
  },

  createCollection: async (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Collection> => {
    const response = await api.post<BackendResponse<Collection>>(
      "/admin/collections",
      data
    );
    return response.data.data;
  },

  updateCollection: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<Collection> => {
    const response = await api.patch<BackendResponse<Collection>>(
      `/admin/collections/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/admin/collections/${id}`);
  },
};

// ================================
// ATTRIBUTES API
// ================================

export const adminAttributesApi = {
  // Colors
  getColors: async (): Promise<Color[]> => {
    const response = await api.get<BackendResponse<Color[]>>("/admin/colors");
    return response.data.data || [];
  },

  createColor: async (data: {
    name: string;
    hexCode: string;
  }): Promise<Color> => {
    const response = await api.post<BackendResponse<Color>>(
      "/admin/colors",
      data
    );
    return response.data.data;
  },

  updateColor: async (
    id: string,
    data: { name?: string; hexCode?: string }
  ): Promise<Color> => {
    const response = await api.put<BackendResponse<Color>>(
      `/admin/colors/${id}`,
      data
    );
    return response.data.data;
  },

  deleteColor: async (id: string): Promise<void> => {
    await api.delete(`/admin/colors/${id}`);
  },

  // Sizes
  getSizes: async (): Promise<Size[]> => {
    const response = await api.get<BackendResponse<Size[]>>("/admin/sizes");
    return response.data.data || [];
  },

  createSize: async (data: {
    name: string;
    sortOrder?: number;
  }): Promise<Size> => {
    const response = await api.post<BackendResponse<Size>>(
      "/admin/sizes",
      data
    );
    return response.data.data;
  },

  updateSize: async (
    id: string,
    data: { name?: string; sortOrder?: number }
  ): Promise<Size> => {
    const response = await api.put<BackendResponse<Size>>(
      `/admin/sizes/${id}`,
      data
    );
    return response.data.data;
  },

  deleteSize: async (id: string): Promise<void> => {
    await api.delete(`/admin/sizes/${id}`);
  },

  // Materials
  getMaterials: async (): Promise<Material[]> => {
    const response = await api.get<BackendResponse<Material[]>>(
      "/admin/materials"
    );
    return response.data.data || [];
  },

  createMaterial: async (data: {
    name: string;
    description?: string;
  }): Promise<Material> => {
    const response = await api.post<BackendResponse<Material>>(
      "/admin/materials",
      data
    );
    return response.data.data;
  },

  updateMaterial: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Material> => {
    const response = await api.put<BackendResponse<Material>>(
      `/admin/materials/${id}`,
      data
    );
    return response.data.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await api.delete(`/admin/materials/${id}`);
  },

  // Styles
  getStyles: async (): Promise<Style[]> => {
    const response = await api.get<BackendResponse<Style[]>>("/admin/styles");
    return response.data.data || [];
  },

  createStyle: async (data: {
    name: string;
    description?: string;
  }): Promise<Style> => {
    const response = await api.post<BackendResponse<Style>>(
      "/admin/styles",
      data
    );
    return response.data.data;
  },

  updateStyle: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Style> => {
    const response = await api.put<BackendResponse<Style>>(
      `/admin/styles/${id}`,
      data
    );
    return response.data.data;
  },

  deleteStyle: async (id: string): Promise<void> => {
    await api.delete(`/admin/styles/${id}`);
  },

  // Tags
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<BackendResponse<Tag[]>>("/admin/tags");
    return response.data.data || [];
  },

  createTag: async (data: {
    name: string;
    description?: string;
  }): Promise<Tag> => {
    const response = await api.post<BackendResponse<Tag>>("/admin/tags", data);
    return response.data.data;
  },

  updateTag: async (
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Tag> => {
    const response = await api.put<BackendResponse<Tag>>(
      `/admin/tags/${id}`,
      data
    );
    return response.data.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/admin/tags/${id}`);
  },
};

// ================================
// VARIANTS API
// ================================

export const adminVariantsApi = {
  getVariants: async (productId: string): Promise<ProductVariant[]> => {
    const response = await api.get<BackendResponse<ProductVariant[]>>(
      `/admin/products/${productId}/variants`
    );
    return response.data.data || [];
  },

  createVariant: async (data: {
    productId: string;
    colorId: string;
    sizeId: string;
    sku: string;
    stock: number;
    price?: number;
  }): Promise<ProductVariant> => {
    const response = await api.post<BackendResponse<ProductVariant>>(
      `/admin/variants`,
      data
    );
    return response.data.data;
  },

  updateVariant: async (
    id: string,
    data: {
      colorId?: string;
      sizeId?: string;
      sku?: string;
      stock?: number;
      price?: number;
    }
  ): Promise<ProductVariant> => {
    const response = await api.patch<BackendResponse<ProductVariant>>(
      `/admin/variants/${id}`,
      data
    );
    return response.data.data;
  },

  deleteVariant: async (id: string): Promise<void> => {
    await api.delete(`/admin/variants/${id}`);
  },
};

// ================================
// USERS API
// ================================

export const adminUsersApi = {
  getUsers: async (filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<PaginationResult<any>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<BackendResponse<any[]>>(
      `/admin/users?${params.toString()}`
    );
    
    return {
      data: response.data.data || [],
      total: response.data.meta.total || 0,
      page: response.data.meta.page || 1,
      limit: response.data.meta.limit || 10,
      totalPages: response.data.meta.totalPages || 1,
    };
  },

  getUser: async (id: string): Promise<any> => {
    const response = await api.get<BackendResponse<any>>(`/admin/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<any> => {
    const response = await api.post<BackendResponse<any>>("/admin/users", data);
    return response.data.data;
  },

  updateUser: async (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
    }
  ): Promise<any> => {
    const response = await api.patch<BackendResponse<any>>(
      `/admin/users/${id}`,
      data
    );
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

// Add bulk delete function
(adminProductsApi as any).bulkDeleteProducts = async (
  productIds: string[]
): Promise<void> => {
  await Promise.all(productIds.map((id) => api.delete(`/admin/products/${id}`)));
};

// ================================
// UNIFIED ADMIN API
// ================================

export const adminApi = {
  // Products
  products: adminProductsApi,

  // Categories
  categories: adminCategoriesApi,

  // Collections
  collections: adminCollectionsApi,

  // Attributes
  attributes: adminAttributesApi,

  // Colors
  colors: {
    getAll: async (filters: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}): Promise<PaginationResult<Color>> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<BackendResponse<Color[]>>(
        `/admin/colors?${params.toString()}`
      );
      return {
        data: response.data.data || [],
        meta: response.data.meta,
      };
    },

    getById: async (id: string): Promise<Color> => {
      const response = await api.get<BackendResponse<Color>>(`/admin/colors/${id}`);
      return response.data.data;
    },

    create: async (data: {
      name: string;
      code: string;
      hexCode: string;
    }): Promise<Color> => {
      const response = await api.post<BackendResponse<Color>>("/admin/colors", data);
      return response.data.data;
    },

    update: async (
      id: string,
      data: {
        name?: string;
        code?: string;
        hexCode?: string;
        isActive?: boolean;
      }
    ): Promise<Color> => {
      const response = await api.put<BackendResponse<Color>>(
        `/admin/colors/${id}`,
        data
      );
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/admin/colors/${id}`);
    },

    toggleActive: async (id: string): Promise<Color> => {
      const response = await api.patch<BackendResponse<Color>>(
        `/admin/colors/${id}/toggle`
      );
      return response.data.data;
    },
  },

  // Materials
  materials: {
    getAll: async (filters: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}): Promise<PaginationResult<Material>> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<BackendResponse<Material[]>>(
        `/admin/materials?${params.toString()}`
      );
      return {
        data: response.data.data || [],
        meta: response.data.meta,
      };
    },

    getById: async (id: string): Promise<Material> => {
      const response = await api.get<BackendResponse<Material>>(`/admin/materials/${id}`);
      return response.data.data;
    },

    create: async (data: {
      name: string;
      description?: string;
    }): Promise<Material> => {
      const response = await api.post<BackendResponse<Material>>("/admin/materials", data);
      return response.data.data;
    },

    update: async (
      id: string,
      data: {
        name?: string;
        description?: string;
        isActive?: boolean;
      }
    ): Promise<Material> => {
      const response = await api.put<BackendResponse<Material>>(
        `/admin/materials/${id}`,
        data
      );
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/admin/materials/${id}`);
    },

    toggleActive: async (id: string): Promise<Material> => {
      const response = await api.patch<BackendResponse<Material>>(
        `/admin/materials/${id}/toggle`
      );
      return response.data.data;
    },
  },

  // Styles
  styles: {
    getAll: async (filters: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}): Promise<PaginationResult<Style>> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<BackendResponse<Style[]>>(
        `/admin/styles?${params.toString()}`
      );
      return {
        data: response.data.data || [],
        meta: response.data.meta,
      };
    },

    getById: async (id: string): Promise<Style> => {
      const response = await api.get<BackendResponse<Style>>(`/admin/styles/${id}`);
      return response.data.data;
    },

    create: async (data: {
      name: string;
      description?: string;
    }): Promise<Style> => {
      const response = await api.post<BackendResponse<Style>>("/admin/styles", data);
      return response.data.data;
    },

    update: async (
      id: string,
      data: {
        name?: string;
        description?: string;
        isActive?: boolean;
      }
    ): Promise<Style> => {
      const response = await api.put<BackendResponse<Style>>(
        `/admin/styles/${id}`,
        data
      );
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/admin/styles/${id}`);
    },

    toggleActive: async (id: string): Promise<Style> => {
      const response = await api.patch<BackendResponse<Style>>(
        `/admin/styles/${id}/toggle`
      );
      return response.data.data;
    },
  },

  // Tags
  tags: {
    getAll: async (filters: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}): Promise<PaginationResult<Tag>> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<BackendResponse<Tag[]>>(
        `/admin/tags?${params.toString()}`
      );
      return {
        data: response.data.data || [],
        meta: response.data.meta,
      };
    },

    getById: async (id: string): Promise<Tag> => {
      const response = await api.get<BackendResponse<Tag>>(`/admin/tags/${id}`);
      return response.data.data;
    },

    create: async (data: {
      name: string;
      description?: string;
    }): Promise<Tag> => {
      const response = await api.post<BackendResponse<Tag>>("/admin/tags", data);
      return response.data.data;
    },

    update: async (
      id: string,
      data: {
        name?: string;
        description?: string;
        isActive?: boolean;
      }
    ): Promise<Tag> => {
      const response = await api.put<BackendResponse<Tag>>(
        `/admin/tags/${id}`,
        data
      );
      return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`/admin/tags/${id}`);
    },

    toggleActive: async (id: string): Promise<Tag> => {
      const response = await api.patch<BackendResponse<Tag>>(
        `/admin/tags/${id}/toggle`
      );
      return response.data.data;
    },
  },

  // Users
  users: adminUsersApi,

  // Variants
  variants: adminVariantsApi,
};

// Add missing API functions for backward compatibility
adminAttributesApi.updateColor = async (
  id: string,
  data: { name?: string; hexCode?: string }
): Promise<Color> => {
  const response = await api.put<BackendResponse<Color>>(
    `/admin/colors/${id}`,
    data
  );
  return response.data.data;
};

adminAttributesApi.deleteColor = async (id: string): Promise<void> => {
  await api.delete(`/admin/colors/${id}`);
};

adminAttributesApi.updateSize = async (
  id: string,
  data: { name?: string; sortOrder?: number }
): Promise<Size> => {
  const response = await api.put<BackendResponse<Size>>(
    `/admin/sizes/${id}`,
    data
  );
  return response.data.data;
};

adminAttributesApi.deleteSize = async (id: string): Promise<void> => {
  await api.delete(`/admin/sizes/${id}`);
};

adminAttributesApi.updateMaterial = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Material> => {
  const response = await api.put<BackendResponse<Material>>(
    `/admin/materials/${id}`,
    data
  );
  return response.data.data;
};

adminAttributesApi.deleteMaterial = async (id: string): Promise<void> => {
  await api.delete(`/admin/materials/${id}`);
};

adminAttributesApi.updateStyle = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Style> => {
  const response = await api.put<BackendResponse<Style>>(
    `/admin/styles/${id}`,
    data
  );
  return response.data.data;
};

adminAttributesApi.deleteStyle = async (id: string): Promise<void> => {
  await api.delete(`/admin/styles/${id}`);
};

adminAttributesApi.updateTag = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Tag> => {
  const response = await api.put<BackendResponse<Tag>>(
    `/admin/tags/${id}`,
    data
  );
  return response.data.data;
};

adminAttributesApi.deleteTag = async (id: string): Promise<void> => {
  await api.delete(`/admin/tags/${id}`);
};

// Add missing bulk operations for products
adminProductsApi.bulkDeleteProducts = async (
  productIds: string[]
): Promise<void> => {
  await Promise.all(
    productIds.map((id) => adminProductsApi.deleteProduct(id))
  );
};

// Fix collections API to match backend structure
adminCategoriesApi.getCategories = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{ data: Category[]; meta: any }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await api.get<BackendResponse<Category[]>>(
    `/admin/categories?${params.toString()}`
  );
  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
};

adminCollectionsApi.getCollections = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{ data: Collection[]; meta: any }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await api.get<BackendResponse<Collection[]>>(
    `/admin/collections?${params.toString()}`
  );
  return {
    data: response.data.data || [],
    meta: response.data.meta,
  };
};
