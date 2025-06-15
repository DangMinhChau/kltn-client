"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { ProductsHeader } from "@/components/admin/ProductsHeader";
import { ProductsStats } from "@/components/admin/ProductsStats";
import { ProductsFilters } from "@/components/admin/ProductsFilters";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ProductsBulkActions } from "@/components/admin/ProductsBulkActions";
import { ProductsPagination } from "@/components/admin/ProductsPagination";

export default function ProductsPage() {
  const [showFilters, setShowFilters] = useState(true);

  // Custom hooks for enhanced functionality
  const {
    products,
    pagination,
    loading,
    loadingAction,
    filters,
    selectedProducts,
    setFilters,
    updateFilter,
    setPage,
    setSearch,
    selectProduct,
    selectAll,
    clearSelection,
    fetchProducts,
    deleteProduct,
    bulkDeleteProducts,
    hasSelection,
    isAllSelected,
    stats,
  } = useAdminProducts({
    initialFilters: {
      page: 1,
      limit: 10,
      search: "",
      categoryId: "",
      isActive: undefined,
      sortBy: "createdAt",
      sortOrder: "DESC",
    },
  });

  const { categories, loading: categoriesLoading } = useAdminCategories();

  // Handler functions for improved UX
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    updateFilter(key, value);
  };

  const handleFiltersReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      categoryId: "",
      isActive: undefined,
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
  };

  const handleBulkExport = async () => {
    toast.info("Tính năng xuất Excel đang được phát triển");
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    toast.info(`Tính năng cập nhật trạng thái hàng loạt đang được phát triển`);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    updateFilter("limit", itemsPerPage);
  };

  // Check if has active filters for better UX indicators
  const hasActiveFilters = !!(
    filters.search ||
    filters.categoryId ||
    filters.isActive !== undefined
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header with breadcrumb navigation */}
      <ProductsHeader
        totalProducts={stats.total}
        onRefresh={fetchProducts}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Stats Dashboard for quick insights */}
      <ProductsStats stats={stats} loading={loading && products.length === 0} />

      {/* Advanced Filters with clear indicators */}
      {(showFilters || hasActiveFilters) && (
        <ProductsFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onFiltersReset={handleFiltersReset}
          onSearch={setSearch}
          loading={loading || categoriesLoading}
        />
      )}

      {/* Bulk Actions with export capabilities */}
      <ProductsBulkActions
        selectedCount={selectedProducts.length}
        onBulkDelete={() => bulkDeleteProducts(selectedProducts)}
        onBulkExport={handleBulkExport}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={clearSelection}
        loading={loadingAction}
      />

      {/* Enhanced Products Table with image preview */}
      <ProductsTable
        products={products}
        selectedProducts={selectedProducts}
        onSelectProduct={selectProduct}
        onSelectAll={selectAll}
        onDeleteProduct={deleteProduct}
        isAllSelected={isAllSelected}
        loading={loading}
      />

      {/* Enhanced Pagination */}
      <ProductsPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={loading}
      />
    </div>
  );
}
