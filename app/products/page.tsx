"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductFilters as ProductFiltersType } from "@/types";
import ProductFilters from "@/components/common/ProductFilters";
import {
  ViewModeToggle,
  SortSelect,
  ActiveFilters,
  ProductsPagination,
  ProductsGrid,
  ProductsSkeleton,
  MobileFilters,
  PageBreadcrumb,
  EmptyState,
  ErrorState,
  ViewMode,
} from "@/components/products";
import { useProducts } from "@/hooks/useProducts";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize filters with category from URL if present
  const initialFilters = categoryFromUrl ? { category: categoryFromUrl } : {};
  const {
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
    setFilters,
    refetch,
  } = useProducts({ initialFilters });

  // Effect to handle URL params changes
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== filters.category) {
      setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
      setCurrentPage(1);
    }
  }, [categoryFromUrl, filters.category, setFilters, setCurrentPage]);

  const handleRemoveFilter = (filterKey: keyof ProductFiltersType) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });

    // Update URL to remove category param if needed
    if (filterKey === "category") {
      window.history.pushState({}, "", "/products");
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    window.history.pushState({}, "", "/products");
  }; // Debug pagination values
  console.log("🔍 Main Component Pagination Debug:", {
    currentPage,
    totalPages,
    totalProducts,
    productsLength: products.length,
    isLoading,
    showPagination: totalPages > 1,
  });

  // Debug filters
  console.log("🔍 Main Component Filters Debug:", {
    filters,
    filtersKeys: Object.keys(filters),
    hasFilters: Object.keys(filters).length > 0,
    categoryFromUrl,
  });

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}{" "}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Title and breadcrumb */}
            <div>
              <PageBreadcrumb categoryFromUrl={categoryFromUrl} />
              <h1 className="text-3xl font-bold">
                {categoryFromUrl
                  ? `Sản phẩm: ${categoryFromUrl}`
                  : "Tất cả sản phẩm"}
              </h1>
              {totalProducts > 0 && (
                <p className="text-muted-foreground mt-1">
                  Tìm thấy {totalProducts} sản phẩm
                </p>
              )}
            </div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Mobile filters and controls */}
              <div className="flex gap-2 items-center">
                {/* Mobile filter button */}
                <MobileFilters
                  isOpen={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                  filters={filters}
                  onFiltersChange={setFilters}
                />

                {/* Sort */}
                <SortSelect sortBy={sortBy} onSortChange={setSortBy} />

                {/* View mode */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>{" "}
            {/* Active filters display */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAllFilters={handleClearAllFilters}
            />
          </div>
        </div>
      </div>{" "}
      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {" "}
        <div className="flex gap-8">
          {" "}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-8">
              <ProductFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
          {/* Main Products Area */}
          <div className="flex-1 min-w-0">
            {" "}
            {isLoading ? (
              <ProductsSkeleton viewMode={viewMode} />
            ) : products.length > 0 ? (
              <>
                <ProductsGrid products={products} viewMode={viewMode} />
                {/* Debug pagination condition */}
                {console.log("🔍 Pagination condition check:", {
                  currentPage,
                  totalPages,
                  totalProducts,
                  shouldShowPagination: totalPages > 1,
                })}
                <ProductsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalProducts={totalProducts}
                  itemsPerPage={12}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>{" "}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton viewMode="grid" />}>
      <ProductsContent />
    </Suspense>
  );
}
