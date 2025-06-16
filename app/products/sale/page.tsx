"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product, PaginationResult } from "@/types";
import { api, productApi } from "@/lib/api";
import {
  ViewModeToggle,
  SortSelect,
  ProductsGrid,
  ProductsSkeleton,
  ProductsPagination,
  ErrorState,
  EmptyState,
  PageBreadcrumb,
  ViewMode,
  SortOption,
} from "@/components/products";
import { SaleEmptyState } from "@/components/products/SaleEmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, Tag, Clock, TrendingDown, Flame } from "lucide-react";

function SalePageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<string>("discount_desc");

  // Get initial values from URL params
  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "discount_desc";

  // Fetch sale products
  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result: PaginationResult<Product> =
        await productApi.getSaleProducts({
          page,
          limit: 20,
          sort: sort as any,
        });

      setProducts(result.data);
      setPagination({
        currentPage: result.meta.page,
        totalPages: result.meta.totalPages,
        totalItems: result.meta.total,
        itemsPerPage: result.meta.limit,
      });
    } catch (err) {
      console.error("Error fetching sale products:", err);
      setError("Không thể tải sản phẩm đang sale. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount and when params change
  useEffect(() => {
    fetchSaleProducts();
  }, [page, sort]);

  // Update sort state when URL changes
  useEffect(() => {
    setSortBy(sort);
  }, [sort]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("sort", newSort);
    newUrl.searchParams.set("page", "1"); // Reset to first page
    window.history.pushState({}, "", newUrl.toString());
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", newPage.toString());
    window.history.pushState({}, "", newUrl.toString());
  };

  const sortOptions = [
    { value: "discount_desc", label: "Giảm giá cao nhất" },
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá thấp đến cao" },
    { value: "price_desc", label: "Giá cao đến thấp" },
  ];

  if (error) {
    return <ErrorState error={error} onRetry={fetchSaleProducts} />;
  }
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <PageBreadcrumb />
      </div>
      {/* Sale Banner */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white border-0 overflow-hidden relative">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Flame className="h-8 w-8 animate-pulse" />
                  <h1 className="text-3xl md:text-5xl font-bold">SALE HOT</h1>
                  <Flame className="h-8 w-8 animate-pulse" />
                </div>
                <p className="text-lg md:text-xl mb-4 opacity-90">
                  🔥 Khám phá các sản phẩm thời trang nam đang được giảm giá cực
                  sốc!
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm md:text-base">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/20 text-white border-white/30"
                  >
                    <TrendingDown className="h-4 w-4" />
                    Giảm đến 70%
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-white/20 text-white border-white/30"
                  >
                    <Clock className="h-4 w-4" />
                    Thời gian có hạn
                  </Badge>
                </div>
              </div>

              {/* Sale Stats */}
              {!loading && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl md:text-3xl font-bold">
                      {pagination.totalItems}
                    </div>
                    <div className="text-sm opacity-90">Sản phẩm SALE</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl md:text-3xl font-bold">
                      {products.length > 0
                        ? Math.max(
                            ...products.map((p) => p.discountPercent || 0)
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm opacity-90">Giảm tối đa</div>
                  </div>
                </div>
              )}
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </CardContent>
        </Card>
      </div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        {/* Results count and view toggle */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                Hiển thị{" "}
                <span className="font-medium text-foreground">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>
                -
                <span className="font-medium text-foreground">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium text-foreground">
                  {pagination.totalItems}
                </span>{" "}
                sản phẩm sale
              </>
            )}
          </div>
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Products Grid */}
      <div className="mb-8">
        {" "}
        {loading ? (
          <ProductsSkeleton count={20} viewMode={viewMode} />
        ) : products.length === 0 ? (
          <SaleEmptyState />
        ) : (
          <ProductsGrid products={products} viewMode={viewMode} />
        )}
      </div>{" "}
      {/* Pagination */}
      {!loading && products.length > 0 && (
        <ProductsPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalProducts={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function SalePage() {
  return (
    <Suspense fallback={<ProductsSkeleton viewMode="grid" />}>
      <SalePageContent />
    </Suspense>
  );
}
