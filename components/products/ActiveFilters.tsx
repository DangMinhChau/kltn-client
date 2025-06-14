import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProductFilters } from "@/types";

interface ActiveFiltersProps {
  filters: ProductFilters;
  onRemoveFilter: (filterKey: keyof ProductFilters) => void;
  onClearAllFilters: () => void;
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAllFilters,
}: ActiveFiltersProps) {
  const hasActiveFilters = Object.keys(filters).length > 0;

  console.log("🏷️ ActiveFilters Debug:", {
    filters,
    hasActiveFilters,
    filtersKeys: Object.keys(filters),
  });

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        Bộ lọc đang áp dụng:
      </span>

      {filters.category && (
        <Badge variant="secondary" className="gap-1">
          Danh mục: {filters.category}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("category")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.collection && (
        <Badge variant="secondary" className="gap-1">
          Bộ sưu tập: {filters.collection}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("collection")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.color && (
        <Badge variant="secondary" className="gap-1">
          Màu sắc: {filters.color}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("color")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.size && (
        <Badge variant="secondary" className="gap-1">
          Kích thước: {filters.size}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("size")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.material && (
        <Badge variant="secondary" className="gap-1">
          Chất liệu: {filters.material}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("material")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.style && (
        <Badge variant="secondary" className="gap-1">
          Phong cách: {filters.style}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter("style")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {(filters.minPrice || filters.maxPrice) && (
        <Badge variant="secondary" className="gap-1">
          Giá:{" "}
          {filters.minPrice ? `${filters.minPrice.toLocaleString()}đ` : "0đ"} -{" "}
          {filters.maxPrice ? `${filters.maxPrice.toLocaleString()}đ` : "∞"}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => {
              onRemoveFilter("minPrice");
              onRemoveFilter("maxPrice");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <Button variant="outline" size="sm" onClick={onClearAllFilters}>
        Xóa tất cả
      </Button>
    </div>
  );
}
