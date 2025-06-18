"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/common/ProductCard";
import { EmptyState } from "@/components/products/EmptyState";
import { ProductCardSkeleton } from "@/components/common/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import { Product, ProductFilters } from "@/types";
import { useRouter } from "next/navigation";

export function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const ITEMS_PER_PAGE = 12;

  // Load products when search query or page changes
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      loadProducts(query, 1);
    } else {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
      setLoading(false);
    }
  }, [searchParams]);

  // Load products for specific page
  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query.trim() && currentPage > 1) {
      loadProducts(query, currentPage);
    }
  }, [currentPage]);

  const loadProducts = async (query: string, page: number) => {
    if (!query.trim()) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Searching for:", query, "page:", page);

      const response = await productApi.searchProducts(query, {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      console.log("📦 Search results:", response);
      setProducts(response.data);
      setTotalProducts(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("❌ Error searching products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams();
      newParams.set("q", searchQuery.trim());
      router.push(`/search?${newParams.toString()}`);
    } else {
      router.push("/search");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/search");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchQuery
            ? `Kết quả tìm kiếm cho "${searchQuery}"`
            : "Tìm kiếm sản phẩm"}
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mb-6">
          <div className="relative">
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên sản phẩm hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-lg"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* Results count */}
        {!loading && searchQuery && (
          <p className="text-gray-600 mb-4">
            {totalProducts > 0
              ? `Tìm thấy ${totalProducts} sản phẩm`
              : "Không tìm thấy sản phẩm nào"}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="w-full">
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
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Trang trước
                </Button>

                <div className="flex items-center gap-2">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Trang sau →
                </Button>
              </div>
            )}
          </>
        ) : searchQuery ? (
          <EmptyState
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
          />
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nhập từ khóa để tìm kiếm
            </h3>
            <p className="text-gray-500">
              Tìm kiếm sản phẩm theo tên hoặc mã SKU
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
