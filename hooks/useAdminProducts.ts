import { useState, useEffect, useCallback, useMemo } from "react";
import { adminProductsApi, AdminProductFilters } from "@/lib/api/admin";
import { Product, PaginationResult } from "@/types";
import { toast } from "sonner";

interface UseAdminProductsOptions {
  initialFilters?: Partial<AdminProductFilters>;
  autoFetch?: boolean;
}

interface UseAdminProductsReturn {
  // Data
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Loading states
  loading: boolean;
  loadingAction: boolean;

  // Filters and selection
  filters: AdminProductFilters;
  selectedProducts: string[];

  // Actions
  setFilters: (filters: Partial<AdminProductFilters>) => void;
  updateFilter: (key: keyof AdminProductFilters, value: any) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;

  // Selection
  selectProduct: (productId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // CRUD operations
  fetchProducts: () => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;

  // Computed values
  hasSelection: boolean;
  isAllSelected: boolean;
  stats: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
  };
}

const DEFAULT_FILTERS: AdminProductFilters = {
  page: 1,
  limit: 10,
  search: "",
  categoryId: "",
  isActive: undefined,
  sortBy: "createdAt",
  sortOrder: "DESC",
};

export function useAdminProducts(
  options: UseAdminProductsOptions = {}
): UseAdminProductsReturn {
  const { initialFilters = {}, autoFetch = true } = options;

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<AdminProductFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await adminProductsApi.getProducts(filters);
      setProducts(result.data);
      setPagination({
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<AdminProductFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to first page when filters change (unless page is explicitly set)
    }));
  }, []);

  const updateFilter = useCallback(
    (key: keyof AdminProductFilters, value: any) => {
      setFilters({ [key]: value });
    },
    [setFilters]
  );

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const setSearch = useCallback(
    (search: string) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        setFilters({ search, page: 1 });
      }, 300);

      setSearchTimeout(timeout);
    },
    [searchTimeout, setFilters]
  );

  // Selection actions
  const selectProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedProducts.length === products.length && products.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  }, [selectedProducts.length, products]);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  // CRUD operations
  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        setLoadingAction(true);
        await adminProductsApi.deleteProduct(productId);
        toast.success("Đã xóa sản phẩm thành công");
        // Remove from selection if selected
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));
        await fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Không thể xóa sản phẩm");
      } finally {
        setLoadingAction(false);
      }
    },
    [fetchProducts]
  );

  const bulkDeleteProducts = useCallback(
    async (productIds: string[]) => {
      try {
        setLoadingAction(true);
        await Promise.all(
          productIds.map((id) => adminProductsApi.deleteProduct(id))
        );
        toast.success(`Đã xóa ${productIds.length} sản phẩm`);
        clearSelection();
        await fetchProducts();
      } catch (error) {
        console.error("Error bulk deleting products:", error);
        toast.error("Không thể xóa các sản phẩm đã chọn");
      } finally {
        setLoadingAction(false);
      }
    },
    [fetchProducts, clearSelection]
  );

  // Computed values
  const hasSelection = selectedProducts.length > 0;
  const isAllSelected =
    selectedProducts.length === products.length && products.length > 0;

  const stats = useMemo(() => {
    const active = products.filter((p) => p.isActive).length;
    const inactive = products.filter((p) => !p.isActive).length;
    const lowStock = products.filter((p) => {
      const totalStock =
        p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
      return totalStock < 10;
    }).length;

    return {
      total: pagination.total,
      active,
      inactive,
      lowStock,
    };
  }, [products, pagination.total]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return {
    // Data
    products,
    pagination,

    // Loading states
    loading,
    loadingAction,

    // Filters and selection
    filters,
    selectedProducts,

    // Actions
    setFilters,
    updateFilter,
    setPage,
    setSearch,

    // Selection
    selectProduct,
    selectAll,
    clearSelection,

    // CRUD operations
    fetchProducts,
    deleteProduct,
    bulkDeleteProducts,

    // Computed values
    hasSelection,
    isAllSelected,
    stats,
  };
}
