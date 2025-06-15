import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { Plus, RefreshCw, Settings, Filter } from "lucide-react";

interface ProductsHeaderProps {
  totalProducts: number;
  onRefresh: () => void;
  loading?: boolean;
  hasActiveFilters?: boolean;
  onToggleFilters?: () => void;
}

export function ProductsHeader({
  totalProducts,
  onRefresh,
  loading = false,
  hasActiveFilters = false,
  onToggleFilters,
}: ProductsHeaderProps) {
  const breadcrumbItems = [
    { label: "Sản phẩm", href: "/admin/products", current: true },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <AdminBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Quản lý {totalProducts.toLocaleString()} sản phẩm trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle for mobile */}
          {onToggleFilters && (
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="md:hidden"
            >
              <Filter
                className={`mr-2 h-4 w-4 ${
                  hasActiveFilters ? "text-blue-600" : ""
                }`}
              />
              Bộ lọc
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </Button>
          )}

          {/* Settings */}
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>

          {/* Add product */}
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
