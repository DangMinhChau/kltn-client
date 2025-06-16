"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Package,
  Filter,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCollectionApi, productApi } from "@/lib/api";
import { Collection, Product, ProductFilters } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface CollectionProductsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CollectionProductsPage({
  params,
}: CollectionProductsPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Selected products for bulk operations
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchCollection();
  }, [params.id]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, categoryFilter, statusFilter, page]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCollectionApi.getCollection(
        parseInt(params.id)
      );
      setCollection(result);
      setCollectionProducts(result.products || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        notFound();
      }
      setError(err.message || "Failed to fetch collection");
      console.error("Error fetching collection:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const filters: ProductFilters = {
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        isActive:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
        page,
        limit: pagination.limit,
      };

      const result = await productApi.getProducts(filters);
      setAllProducts(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast.error("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  const isProductInCollection = (productId: string) => {
    return collectionProducts.some((p) => p.id === productId);
  };

  const handleProductToggle = async (product: Product) => {
    const isInCollection = isProductInCollection(product.id);

    try {
      setUpdating(true);

      if (isInCollection) {
        // Remove from collection
        await adminCollectionApi.assignProducts(parseInt(params.id), {
          productIds: collectionProducts
            .filter((p) => p.id !== product.id)
            .map((p) => parseInt(p.id)),
        });
        setCollectionProducts((prev) =>
          prev.filter((p) => p.id !== product.id)
        );
        toast.success(`Removed "${product.name}" from collection`);
      } else {
        // Add to collection
        await adminCollectionApi.assignProducts(parseInt(params.id), {
          productIds: [
            ...collectionProducts.map((p) => parseInt(p.id)),
            parseInt(product.id),
          ],
        });
        setCollectionProducts((prev) => [...prev, product]);
        toast.success(`Added "${product.name}" to collection`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update collection products");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAdd = async () => {
    if (selectedProducts.size === 0) return;

    try {
      setUpdating(true);

      const newProductIds = Array.from(selectedProducts).map((id) =>
        parseInt(id)
      );
      const existingProductIds = collectionProducts.map((p) => parseInt(p.id));
      const allProductIds = [...existingProductIds, ...newProductIds];

      await adminCollectionApi.assignProducts(parseInt(params.id), {
        productIds: allProductIds,
      });

      const newProducts = allProducts.filter((p) => selectedProducts.has(p.id));
      setCollectionProducts((prev) => [...prev, ...newProducts]);
      setSelectedProducts(new Set());

      toast.success(`Added ${selectedProducts.size} products to collection`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add products to collection");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedProducts.size === 0) return;

    try {
      setUpdating(true);

      const remainingProductIds = collectionProducts
        .filter((p) => !selectedProducts.has(p.id))
        .map((p) => parseInt(p.id));

      await adminCollectionApi.assignProducts(parseInt(params.id), {
        productIds: remainingProductIds,
      });

      setCollectionProducts((prev) =>
        prev.filter((p) => !selectedProducts.has(p.id))
      );
      setSelectedProducts(new Set());

      toast.success(
        `Removed ${selectedProducts.size} products from collection`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to remove products from collection");
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = allProducts.map((p) => p.id);
      setSelectedProducts(new Set(allIds));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("all");
    setPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          {error || "Collection not found"}
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Products
            </h1>
            <p className="text-muted-foreground">
              {collection.name} - {collectionProducts.length} products
            </p>
          </div>
        </div>

        {selectedProducts.size > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{selectedProducts.size} selected</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkAdd}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add to Collection
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkRemove}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Minus className="h-4 w-4 mr-2" />
              )}
              Remove from Collection
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProducts(new Set())}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {/* Add dynamic categories here */}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            {pagination.total} total products available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          allProducts.length > 0 &&
                          selectedProducts.size === allProducts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>In Collection</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.map((product) => {
                    const inCollection = isProductInCollection(product.id);
                    const isSelected = selectedProducts.has(product.id);

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectProduct(
                                product.id,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.baseSku}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="outline">
                              {product.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              No category
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatPrice(product.basePrice)}
                            </span>
                            {product.discountPercent && (
                              <Badge
                                variant="destructive"
                                className="text-xs w-fit"
                              >
                                -{product.discountPercent}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {inCollection ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              In Collection
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not in Collection</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={inCollection ? "outline" : "default"}
                            onClick={() => handleProductToggle(product)}
                            disabled={updating}
                          >
                            {updating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : inCollection ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pagination.limit + 1} to{" "}
                {Math.min(page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(pagination.totalPages - 4, page - 2)
                        ) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
