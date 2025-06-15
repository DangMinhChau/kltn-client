import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search, Filter, X, ChevronDown, RotateCcw } from "lucide-react";
import { Category } from "@/types";
import { AdminProductFilters } from "@/lib/api/admin";

interface ProductsFiltersProps {
  filters: AdminProductFilters;
  categories: Category[];
  onFilterChange: (key: keyof AdminProductFilters, value: any) => void;
  onFiltersReset: () => void;
  onSearch: (value: string) => void;
  loading?: boolean;
}

export function ProductsFilters({
  filters,
  categories,
  onFilterChange,
  onFiltersReset,
  onSearch,
  loading = false,
}: ProductsFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Count active filters
  const activeFiltersCount = [
    filters.search,
    filters.categoryId,
    filters.isActive !== undefined,
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    onFilterChange(
      "sortBy",
      sortBy as "name" | "createdAt" | "updatedAt" | "basePrice"
    );
    onFilterChange("sortOrder", sortOrder as "ASC" | "DESC");
  };

  const clearFilter = (key: keyof AdminProductFilters) => {
    if (key === "search") {
      setSearchValue("");
    }
    onFilterChange(key, key === "isActive" ? undefined : "");
  };

  const resetAllFilters = () => {
    setSearchValue("");
    onFiltersReset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllFilters}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Đặt lại
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Tìm kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm theo tên, mô tả, SKU..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => clearFilter("search")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        {/* Basic Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <div className="relative">
              <Select
                value={filters.categoryId || "all"}
                onValueChange={(value) =>
                  onFilterChange("categoryId", value === "all" ? "" : value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.categoryId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-1 h-7 w-7 p-0"
                  onClick={() => clearFilter("categoryId")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <div className="relative">
              <Select
                value={
                  filters.isActive === undefined
                    ? "all"
                    : filters.isActive.toString()
                }
                onValueChange={(value) =>
                  onFilterChange(
                    "isActive",
                    value === "all" ? undefined : value === "true"
                  )
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              {filters.isActive !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-1 h-7 w-7 p-0"
                  onClick={() => clearFilter("isActive")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label>Sắp xếp</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-DESC">Mới nhất</SelectItem>
                <SelectItem value="createdAt-ASC">Cũ nhất</SelectItem>
                <SelectItem value="name-ASC">Tên A-Z</SelectItem>
                <SelectItem value="name-DESC">Tên Z-A</SelectItem>
                <SelectItem value="basePrice-ASC">Giá thấp - cao</SelectItem>
                <SelectItem value="basePrice-DESC">Giá cao - thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>{" "}
        {/* Advanced Filters Toggle */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Bộ lọc nâng cao
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isAdvancedOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
          {isAdvancedOpen && (
            <div className="space-y-4 pt-4">
              {/* Add more advanced filters here in the future */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Số lượng hiển thị</Label>
                  <Select
                    value={filters.limit?.toString() || "10"}
                    onValueChange={(value) =>
                      onFilterChange("limit", parseInt(value))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 sản phẩm</SelectItem>
                      <SelectItem value="10">10 sản phẩm</SelectItem>
                      <SelectItem value="20">20 sản phẩm</SelectItem>
                      <SelectItem value="50">50 sản phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Bộ lọc đang áp dụng:
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Tìm kiếm: {filters.search}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => clearFilter("search")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.categoryId && (
                <Badge variant="secondary" className="gap-1">
                  Danh mục:{" "}
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => clearFilter("categoryId")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.isActive !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  Trạng thái:{" "}
                  {filters.isActive ? "Hoạt động" : "Không hoạt động"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => clearFilter("isActive")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
