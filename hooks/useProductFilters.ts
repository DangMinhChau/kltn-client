import { useState, useEffect } from "react";
import { productApi } from "@/lib/api";
import { FilterOptions } from "@/types";

interface UseProductFiltersReturn {
  filterOptions: FilterOptions | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductFilters(
  categorySlug?: string
): UseProductFiltersReturn {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔍 Fetching filter options for category:",
        categorySlug || "all"
      );

      const response = await productApi.getFilterOptions(categorySlug);

      console.log("✅ Filter options received:", response);
      setFilterOptions(response);
    } catch (err) {
      console.error("❌ Error fetching filter options:", err);
      setError("Không thể tải các tùy chọn lọc");
      setFilterOptions(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, [categorySlug]); // Re-fetch when category changes

  const refetch = () => {
    fetchFilterOptions();
  };

  return {
    filterOptions,
    isLoading,
    error,
    refetch,
  };
}
