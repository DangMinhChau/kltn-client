import { ProductFilters } from "@/types";

/**
 * Parse URL search params to ProductFilters object
 * Handles both single values and arrays for multi-select filters
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams
): ProductFilters {
  const filters: ProductFilters = {};

  // Handle search
  const search = searchParams.get("search");
  if (search) filters.search = search;

  // Handle category (single value only)
  const category = searchParams.get("category");
  if (category) filters.category = category;

  // Handle multi-value filters
  const multiValueFilters = [
    "collection",
    "color",
    "size",
    "material",
    "style",
    "tag",
  ];
  multiValueFilters.forEach((filterKey) => {
    const values = searchParams.getAll(filterKey);
    if (values.length > 0) {
      // If only one value, keep as string for backward compatibility
      // If multiple values, use array
      const filterValue = values.length === 1 ? values[0] : values;
      (filters as any)[filterKey] = filterValue;
    }
  });

  // Handle price filters
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice) filters.minPrice = parseInt(minPrice);
  if (maxPrice) filters.maxPrice = parseInt(maxPrice);

  // Handle boolean filters
  const inStock = searchParams.get("inStock");
  if (inStock) filters.inStock = inStock === "true";

  const isActive = searchParams.get("isActive");
  if (isActive) filters.isActive = isActive === "true";

  // Handle sorting
  const sortBy = searchParams.get("sortBy");
  if (sortBy) filters.sortBy = sortBy;

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder === "asc" || sortOrder === "desc") {
    filters.sortOrder = sortOrder;
  }

  // Handle pagination
  const page = searchParams.get("page");
  if (page) filters.page = parseInt(page);

  const limit = searchParams.get("limit");
  if (limit) filters.limit = parseInt(limit);

  return filters;
}

/**
 * Convert ProductFilters object to URL search params
 * Handles arrays by creating multiple params with same key
 */
export function filtersToURLSearchParams(
  filters: ProductFilters
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      // For arrays, add multiple params with same key
      value.forEach((item) => {
        if (item) params.append(key, String(item));
      });
    } else {
      // For single values
      params.set(key, String(value));
    }
  });

  return params;
}

/**
 * Update URL with new filters without page reload
 */
export function updateURLWithFilters(
  filters: ProductFilters,
  basePath = "/products"
) {
  const params = filtersToURLSearchParams(filters);
  const url = params.toString() ? `${basePath}?${params.toString()}` : basePath;

  window.history.replaceState({}, "", url);
}

/**
 * Get filter count for display
 */
export function getActiveFilterCount(filters: ProductFilters): number {
  let count = 0;

  if (filters.category) count++;

  // Count arrays properly
  if (filters.collection) {
    count += Array.isArray(filters.collection) ? filters.collection.length : 1;
  }
  if (filters.material) {
    count += Array.isArray(filters.material) ? filters.material.length : 1;
  }
  if (filters.style) {
    count += Array.isArray(filters.style) ? filters.style.length : 1;
  }
  if (filters.tag) {
    count += Array.isArray(filters.tag) ? filters.tag.length : 1;
  }
  if (filters.color) {
    count += Array.isArray(filters.color) ? filters.color.length : 1;
  }
  if (filters.size) {
    count += Array.isArray(filters.size) ? filters.size.length : 1;
  }

  if (filters.minPrice || filters.maxPrice) count++;

  return count;
}
