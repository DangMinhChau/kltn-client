import { useState, useEffect } from "react";
import { adminCategoriesApi } from "@/lib/api/admin";
import { Category } from "@/types";

interface UseAdminCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminCategories(): UseAdminCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCategoriesApi.getCategories();
      setCategories(result || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh sách danh mục");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
