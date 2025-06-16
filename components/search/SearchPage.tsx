"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { EmptyState } from "@/components/products/EmptyState";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { searchProducts } from "@/lib/api/products";
import { Product, ProductFilters } from "@/types";
import { ProductFiltersComponent } from "@/components/common/ProductFilters";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

export function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get("category") || "",
    color: searchParams.get("color") || "",
    size: searchParams.get("size") || "",
    minPrice: searchParams.get("priceMin")
      ? Number(searchParams.get("priceMin"))
      : undefined,
    maxPrice: searchParams.get("priceMax")
      ? Number(searchParams.get("priceMax"))
      : undefined,
    sortBy: (searchParams.get("sort") as any) || "createdAt",
    sortOrder: "DESC",
    search: searchParams.get("q") || "",
    page: 1,
    limit: 12,
  });

  const ITEMS_PER_PAGE = 12;

  // Load products when search query or filters change
  useEffect(() => {
    loadProducts();
  }, [searchQuery, filters, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const searchFilters: ProductFilters = {
        ...filters,
        search: searchQuery,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      const response = await searchProducts(searchFilters);
      setProducts(response.data);
      setTotalProducts(response.meta.total);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      newParams.set("q", searchQuery.trim());
    } else {
      newParams.delete("q");
    }
    router.push(`/search?${newParams.toString()}`);
  };
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters({ ...newFilters, search: searchQuery });
    setCurrentPage(1);

    // Update URL with new filters
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) {
      newParams.set("q", searchQuery.trim());
    }

    // Map ProductFilters to URL params
    if (newFilters.category) newParams.set("category", newFilters.category);
    if (newFilters.color) newParams.set("color", newFilters.color);
    if (newFilters.size) newParams.set("size", newFilters.size);
    if (newFilters.minPrice)
      newParams.set("priceMin", newFilters.minPrice.toString());
    if (newFilters.maxPrice)
      newParams.set("priceMax", newFilters.maxPrice.toString());
    if (newFilters.sortBy) newParams.set("sort", newFilters.sortBy);

    router.push(`/search?${newParams.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    router.push("/search");
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {searchQuery
            ? `Kết quả tìm kiếm cho "${searchQuery}"`
            : "Tìm kiếm sản phẩm"}
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên sản phẩm hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>{" "}
              <div className="mt-4">
                <ProductFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </form>

        {/* Results count */}
        {!loading && (
          <p className="text-gray-600">
            {totalProducts > 0
              ? `Tìm thấy ${totalProducts} sản phẩm`
              : "Không tìm thấy sản phẩm nào"}
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          {" "}
          <div className="sticky top-4">
            <ProductFiltersComponent
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>

                  <span className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              searchQuery={searchQuery}
              onClearSearch={searchQuery ? handleClearSearch : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
