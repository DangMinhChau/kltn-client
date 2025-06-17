"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { FilterOptions, ProductFilters } from "@/types";
import { filterApi } from "@/lib/api";
import { useProductFilters } from "@/hooks/useProductFilters";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  className?: string;
  categoryFromUrl?: string; // Add this prop to control filter visibility
}

interface FilterSection {
  id: string;
  title: string;
  isOpen: boolean;
}

export function ProductFiltersComponent({
  filters,
  onFiltersChange,
  className = "",
  categoryFromUrl,
}: ProductFiltersProps) {
  // Use the new hook to get filter options based on selected category
  const { filterOptions, isLoading, error } = useProductFilters(
    filters.category
  );

  // State for slider - use backend price range if available
  const [sliderValues, setSliderValues] = useState<number[]>([
    filters.minPrice || filterOptions?.priceRange?.min || 0,
    filters.maxPrice || filterOptions?.priceRange?.max || 5000000,
  ]);

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Memoize sections array to prevent recreation on every render
  const initialSections = useMemo<FilterSection[]>(
    () => [
      { id: "category", title: "Danh mục", isOpen: true },
      { id: "collections", title: "Bộ sưu tập", isOpen: false },
      { id: "colors", title: "Màu sắc", isOpen: true },
      { id: "sizes", title: "Kích thước", isOpen: true },
      { id: "materials", title: "Chất liệu", isOpen: false },
      { id: "styles", title: "Phong cách", isOpen: false },
      { id: "tags", title: "Thẻ", isOpen: false },
      { id: "price", title: "Khoảng giá", isOpen: true },
    ],
    []
  );
  const [sections, setSections] = useState<FilterSection[]>(initialSections);
  // Sync slider values with filters and backend price range
  useEffect(() => {
    const backendMin = filterOptions?.priceRange?.min || 0;
    const backendMax = filterOptions?.priceRange?.max || 5000000;

    const newSliderMin = filters.minPrice || backendMin;
    const newSliderMax = filters.maxPrice || backendMax;

    if (sliderValues[0] !== newSliderMin || sliderValues[1] !== newSliderMax) {
      setSliderValues([newSliderMin, newSliderMax]);
    }
  }, [
    filters.minPrice,
    filters.maxPrice,
    filterOptions?.priceRange,
    sliderValues,
  ]);
  const toggleSection = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, isOpen: !section.isOpen }
          : section
      )
    );
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);
  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      const newCategory =
        filters.category === categorySlug ? undefined : categorySlug;      // When category changes, reset other filters to avoid conflicts
      const newFilters: ProductFilters = {
        category: newCategory,
        // Keep search and price filters, reset others including size
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        // Reset size and other category-specific filters
      };

      console.log("🏷️ Category changed:", {
        old: filters.category,
        new: newCategory,
      });
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleSingleFilterChange = useCallback(
    (
      filterType:
        | "collection"
        | "material"
        | "style"
        | "tag"
        | "color"
        | "size",
      value: string
    ) => {
      onFiltersChange({
        ...filters,
        [filterType]: filters[filterType] === value ? undefined : value,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle slider value change
  const handleSliderChange = useCallback(
    (values: number[]) => {
      setSliderValues(values);
      onFiltersChange({
        ...filters,
        minPrice: values[0],
        maxPrice: values[1],
      });
    },
    [filters, onFiltersChange]
  );

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };
  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
    const backendMin = filterOptions?.priceRange?.min || 0;
    const backendMax = filterOptions?.priceRange?.max || 5000000;
    setSliderValues([backendMin, backendMax]);
    setExpandedCategories(new Set());
  }, [onFiltersChange, filterOptions?.priceRange]);
  const removeFilter = useCallback(
    (filterType: string, value?: string) => {
      if (filterType === "category") {
        onFiltersChange({ ...filters, category: undefined });
      } else if (filterType === "price") {
        onFiltersChange({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
        });
        const backendMin = filterOptions?.priceRange?.min || 0;
        const backendMax = filterOptions?.priceRange?.max || 5000000;
        setSliderValues([backendMin, backendMax]);
      } else if (
        filterType === "collection" ||
        filterType === "material" ||
        filterType === "style" ||
        filterType === "tag" ||
        filterType === "color" ||
        filterType === "size"
      ) {
        onFiltersChange({
          ...filters,
          [filterType]: undefined,
        });
      }
    },
    [filters, onFiltersChange]
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.collection) count++;
    if (filters.material) count++;
    if (filters.style) count++;
    if (filters.tag) count++;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = useMemo(
    () => getActiveFiltersCount() > 0,
    [getActiveFiltersCount]
  );
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
            {hasActiveFilters && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Đang áp dụng:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="outline" className="gap-1">
                  Danh mục:{" "}
                  {filterOptions?.categories.find(
                    (c) => c.slug === filters.category
                  )?.name || filters.category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("category")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}{" "}
              {filters.collection && (
                <Badge variant="outline" className="gap-1">
                  {filterOptions?.collections.find(
                    (c) => c.slug === filters.collection
                  )?.name || filters.collection}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("collection")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.material && (
                <Badge variant="outline" className="gap-1">
                  {filterOptions?.materials.find(
                    (m) => m.slug === filters.material
                  )?.name || filters.material}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("material")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.style && (
                <Badge variant="outline" className="gap-1">
                  {filterOptions?.styles.find((s) => s.slug === filters.style)
                    ?.name || filters.style}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("style")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}{" "}
              {filters.color && (
                <Badge variant="outline" className="gap-1">
                  {filterOptions?.colors.find((c) => c.code === filters.color)
                    ?.name || filters.color}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("color")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.size && (
                <Badge variant="outline" className="gap-1">
                  {filterOptions?.sizes.find((s) => s.name === filters.size)
                    ?.name || filters.size}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("size")}
                  >
                    <X className="h-3 w-3" />
                  </Button>{" "}
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="outline" className="gap-1">
                  Giá: {filters.minPrice?.toLocaleString() || "0"}đ -{" "}
                  {filters.maxPrice?.toLocaleString() || "∞"}đ
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => removeFilter("price")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
            <Separator className="mt-4" />
          </div>
        )}{" "}
        <div className="space-y-6">
          {" "}
          {/* Categories - Only show when NOT filtering by category */}
          {filterOptions?.categories && !categoryFromUrl && (
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto text-left"
                onClick={() => toggleSection("category")}
              >
                <span className="font-medium">Danh mục</span>
                {sections.find((s) => s.id === "category")?.isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {sections.find((s) => s.id === "category")?.isOpen && (
                <div className="mt-3 space-y-1">
                  {/* Group categories by parent */}
                  {(() => {
                    const parentCategories = filterOptions.categories.filter(
                      (cat) => !cat.parent && !cat.parentId
                    );
                    const childCategories = filterOptions.categories.filter(
                      (cat) => cat.parent || cat.parentId
                    );

                    return parentCategories.map((parentCategory) => {
                      const children = childCategories.filter(
                        (child) =>
                          child.parentId === parentCategory.id ||
                          child.parent?.id === parentCategory.id
                      );
                      const isExpanded = expandedCategories.has(
                        parentCategory.id
                      );

                      return (
                        <div key={parentCategory.id} className="space-y-1">
                          {/* Parent Category - Non-selectable, clickable to expand */}
                          <div
                            className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              toggleCategoryExpansion(parentCategory.id)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 flex items-center justify-center">
                                {children.length > 0 &&
                                  (isExpanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {parentCategory.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              ({parentCategory.productCount || 0})
                            </span>
                          </div>

                          {/* Child Categories - Selectable */}
                          {isExpanded && children.length > 0 && (
                            <div className="ml-6 space-y-1">
                              {children.map((childCategory) => (
                                <label
                                  key={childCategory.slug}
                                  className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name="category"
                                      checked={
                                        filters.category === childCategory.slug
                                      }
                                      onChange={() =>
                                        handleCategoryChange(childCategory.slug)
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">
                                      {childCategory.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    ({childCategory.productCount || 0})
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
          {/* Add separator only if categories section is shown */}
          {filterOptions?.categories && !categoryFromUrl && <Separator />}
          {/* Collections */}
          {filterOptions?.collections &&
            filterOptions.collections.length > 0 && (
              <>
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto text-left"
                    onClick={() => toggleSection("collections")}
                  >
                    <span className="font-medium">Bộ sưu tập</span>
                    {sections.find((s) => s.id === "collections")?.isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>{" "}
                  {sections.find((s) => s.id === "collections")?.isOpen && (
                    <div className="mt-3 space-y-2">
                      {filterOptions.collections.map((collection) => (
                        <label
                          key={collection.slug}
                          className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="collection"
                              checked={filters.collection === collection.slug}
                              onChange={() =>
                                handleSingleFilterChange(
                                  "collection",
                                  collection.slug
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{collection.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({collection.productCount})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}
          {/* Colors */}
          {filterOptions?.colors && filterOptions.colors.length > 0 && (
            <>
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-left"
                  onClick={() => toggleSection("colors")}
                >
                  <span className="font-medium">Màu sắc</span>
                  {sections.find((s) => s.id === "colors")?.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>{" "}
                {sections.find((s) => s.id === "colors")?.isOpen && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {filterOptions.colors.map((color) => (
                      <button
                        key={color.code}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 relative ${
                          filters.color === color.code
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                        onClick={() =>
                          handleSingleFilterChange("color", color.code || "")
                        }
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />{" "}
                        <span className="text-xs text-center">
                          {color.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({color.productCount})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}          {/* Sizes */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto text-left"
              onClick={() => toggleSection("sizes")}
            >
              <span className="font-medium">Kích thước</span>
              {sections.find((s) => s.id === "sizes")?.isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {sections.find((s) => s.id === "sizes")?.isOpen && (
              <div className="mt-3">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filterOptions?.sizes && filterOptions.sizes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filterOptions.sizes.map((size) => (
                      <button
                        key={size.name}
                        className={`p-2 text-sm border rounded-md hover:bg-gray-50 transition-colors flex flex-col items-center ${
                          filters.size === size.name
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          handleSingleFilterChange("size", size.name)
                        }
                      >
                        <span>{size.name}</span>
                        <span className="text-xs text-gray-500">
                          ({size.productCount})
                        </span>
                      </button>
                    ))}
                  </div>
                ) : filters.category ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Không có kích thước cho danh mục này
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Chọn danh mục để xem kích thước
                  </div>
                )}
              </div>
            )}
          </div>
          <Separator />
          {/* Materials */}
          {filterOptions?.materials && filterOptions.materials.length > 0 && (
            <>
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-left"
                  onClick={() => toggleSection("materials")}
                >
                  <span className="font-medium">Chất liệu</span>
                  {sections.find((s) => s.id === "materials")?.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {sections.find((s) => s.id === "materials")?.isOpen && (
                  <div className="mt-3 space-y-2">
                    {filterOptions.materials.map((material) => (
                      <label
                        key={material.slug}
                        className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="material"
                            checked={filters.material === material.slug}
                            onChange={() =>
                              handleSingleFilterChange(
                                "material",
                                material.slug || ""
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{material.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({material.productCount})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}
          {/* Styles */}
          {filterOptions?.styles && filterOptions.styles.length > 0 && (
            <>
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-left"
                  onClick={() => toggleSection("styles")}
                >
                  <span className="font-medium">Phong cách</span>
                  {sections.find((s) => s.id === "styles")?.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {sections.find((s) => s.id === "styles")?.isOpen && (
                  <div className="mt-3 space-y-2">
                    {" "}
                    {filterOptions.styles.map((style) => (
                      <label
                        key={style.slug}
                        className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="style"
                            checked={filters.style === style.slug}
                            onChange={() =>
                              handleSingleFilterChange(
                                "style",
                                style.slug || ""
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{style.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({style.productCount})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}
          {/* Tags */}
          {filterOptions?.tags && filterOptions.tags.length > 0 && (
            <>
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto text-left"
                  onClick={() => toggleSection("tags")}
                >
                  <span className="font-medium">Thẻ</span>
                  {sections.find((s) => s.id === "tags")?.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {sections.find((s) => s.id === "tags")?.isOpen && (
                  <div className="mt-3 space-y-2">
                    {filterOptions.tags.map((tag) => (
                      <label
                        key={tag.slug}
                        className="flex items-center justify-between space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="tag"
                            checked={filters.tag === tag.slug}
                            onChange={() =>
                              handleSingleFilterChange("tag", tag.slug)
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({tag.productCount})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}{" "}
          {/* Price Range */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto text-left"
              onClick={() => toggleSection("price")}
            >
              <span className="font-medium">Khoảng giá</span>
              {sections.find((s) => s.id === "price")?.isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>{" "}
            {sections.find((s) => s.id === "price")?.isOpen && (
              <div className="mt-3 space-y-4">
                <div className="px-2">
                  <Slider
                    value={sliderValues}
                    onValueChange={handleSliderChange}
                    min={filterOptions?.priceRange?.min || 0}
                    max={filterOptions?.priceRange?.max || 5000000}
                    step={Math.max(
                      Math.floor(
                        (filterOptions?.priceRange?.max || 5000000) / 100
                      ),
                      1000
                    )}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(sliderValues[0])}</span>
                  <span>{formatPrice(sliderValues[1])}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    Tối thiểu:{" "}
                    {formatPrice(filterOptions?.priceRange?.min || 0)}
                  </span>
                  <span>
                    Tối đa:{" "}
                    {formatPrice(filterOptions?.priceRange?.max || 5000000)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductFiltersComponent;
