"use client";

import { useState, useEffect } from "react";
import { categoryApi } from "@/lib/api";
import { Category } from "@/types";

interface UseCategoriesReturn {
  categoryTree: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterActiveCategories = (categories: Category[]): Category[] => {
    return categories
      .filter((cat) => cat.isActive)
      .map((cat) => ({
        ...cat,
        children: filterActiveCategories(cat.children || []),
      }));
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have cached data
      const cachedData = sessionStorage.getItem("categories");
      const cacheTimestamp = sessionStorage.getItem("categories_timestamp");

      // Cache for 5 minutes
      const CACHE_DURATION = 5 * 60 * 1000;

      if (cachedData && cacheTimestamp) {
        const isValid = Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION;
        if (isValid) {
          const parsedData = JSON.parse(cachedData);
          setCategoryTree(parsedData);
          setIsLoading(false);
          return;
        }
      }
      const response = await categoryApi.getCategoryTree();
      console.log("📦 Category tree response:", response);

      let data: Category[];
      if (response && typeof response === "object" && "data" in response) {
        data = (response as any).data;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        console.warn("Unexpected category tree response format:", response);
        setError("Invalid data format received");
        setCategoryTree([]);
        return;
      }

      const filteredCategories = filterActiveCategories(data);
      setCategoryTree(filteredCategories);

      // Cache the data
      sessionStorage.setItem("categories", JSON.stringify(filteredCategories));
      sessionStorage.setItem("categories_timestamp", Date.now().toString());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching categories:", err);
      }

      setCategoryTree([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categoryTree,
    isLoading,
    error,
    refetch: fetchCategories,
  };
};
