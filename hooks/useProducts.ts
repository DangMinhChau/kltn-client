import { useState, useEffect, useCallback } from "react";
import { productApi } from "@/lib/api";
import { Product, ProductFilters } from "@/types";

interface UseProductsParams {
  initialFilters?: ProductFilters;
  itemsPerPage?: number;
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  sortBy: string;
  filters: ProductFilters;
  setCurrentPage: (page: number) => void;
  setSortBy: (sort: string) => void;
  setFilters: (
    filters: ProductFilters | ((prev: ProductFilters) => ProductFilters)
  ) => void;
  refetch: () => void;
}

const SORT_BY_MAPPING: { [key: string]: "name" | "basePrice" | "createdAt" } = {
  newest: "createdAt",
  "price-asc": "basePrice",
  "price-desc": "basePrice",
  name: "name",
};

export function useProducts({
  initialFilters = {},
  itemsPerPage = 12,
}: UseProductsParams = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const fetchProducts = useCallback(
    async (page = currentPage, appliedFilters = filters, sort = sortBy) => {
      try {
        setIsLoading(true);
        setError(null);

        const params: any = {
          page,
          limit: itemsPerPage,
          sortBy: SORT_BY_MAPPING[sort] || "createdAt",
          sortOrder:
            sort === "price-desc"
              ? "DESC"
              : sort === "price-asc"
              ? "ASC"
              : "DESC",
          ...(appliedFilters.category && { category: appliedFilters.category }),
          ...(appliedFilters.collection && {
            collection: appliedFilters.collection,
          }),
          ...(appliedFilters.color && { color: appliedFilters.color }),
          ...(appliedFilters.size && { size: appliedFilters.size }),
          ...(appliedFilters.material && { material: appliedFilters.material }),
          ...(appliedFilters.style && { style: appliedFilters.style }),
          ...(appliedFilters.minPrice && { minPrice: appliedFilters.minPrice }),
          ...(appliedFilters.maxPrice && { maxPrice: appliedFilters.maxPrice }),
        };
        console.log("🚀 API Call params:", params);
        const response = await productApi.getProducts(params);
        console.log("🔍 API Response:", response);

        if (response && response.data) {
          setProducts(response.data);
          setTotalPages(response.meta.totalPages || 1);
          setTotalProducts(response.meta.total || 0);
          console.log("📊 Pagination set from response.data:", {
            totalPages: response.meta.totalPages,
            totalProducts: response.meta.total,
            dataLength: response.data.length,
          });
        } else if (Array.isArray(response)) {
          setProducts(response);
          setTotalProducts(response.length);
          setTotalPages(1);
          console.log("📊 Pagination set from array:", {
            totalPages: 1,
            totalProducts: response.length,
            dataLength: response.length,
          });
        }
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm");
        console.error("❌ Error fetching products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, filters, sortBy, itemsPerPage]
  );
  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, filters]);

  const handleFiltersChange = useCallback(
    (
      newFilters: ProductFilters | ((prev: ProductFilters) => ProductFilters)
    ) => {
      console.log("🔍 Filter change detected:", newFilters);
      setFilters(newFilters);
      setCurrentPage(1);
    },
    []
  );

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log("🔄 useProducts return values:", {
    productsLength: products.length,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    sortBy,
    filters,
  });

  return {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    sortBy,
    filters,
    setCurrentPage,
    setSortBy,
    setFilters: handleFiltersChange,
    refetch,
  };
}
