"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, Package, Plus, Loader2 } from "lucide-react";
import { productApi } from "@/lib/api";
import { Product, ProductFilters } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface AddProductsToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: number;
  existingProductIds: string[];
  onProductsAdded: (products: Product[]) => void;
}

export function AddProductsToCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  existingProductIds,
  onProductsAdded,
}: AddProductsToCollectionDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, debouncedSearch, categoryFilter, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const filters: ProductFilters = {
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        isActive: true,
        page,
        limit: pagination.limit,
      };

      const result = await productApi.getProducts(filters);
      setProducts(result.data);
      setPagination(result.meta);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const isProductInCollection = (productId: string) => {
    return existingProductIds.includes(productId);
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
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
      const availableProductIds = products
        .filter((p) => !isProductInCollection(p.id))
        .map((p) => p.id);
      setSelectedProducts(new Set(availableProductIds));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleAddProducts = () => {
    const selectedProductsList = products.filter((p) =>
      selectedProducts.has(p.id)
    );
    onProductsAdded(selectedProductsList);
    setSelectedProducts(new Set());
    setSearchTerm("");
    setCategoryFilter("");
    setPage(1);
    onOpenChange(false);
  };

  const availableProducts = products.filter(
    (p) => !isProductInCollection(p.id)
  );
  const allAvailableSelected =
    availableProducts.length > 0 &&
    availableProducts.every((p) => selectedProducts.has(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Products to Collection</DialogTitle>
          <DialogDescription>
            Select products to add to this collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {/* Add dynamic categories here */}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Count */}
          {selectedProducts.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedProducts.size} product(s) selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedProducts(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Products Table */}
          <div className="border rounded-lg max-h-96 overflow-auto">
            {loading ? (
              <div className="p-4">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allAvailableSelected}
                        onCheckedChange={handleSelectAll}
                        disabled={availableProducts.length === 0}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const inCollection = isProductInCollection(product.id);
                    const isSelected = selectedProducts.has(product.id);

                    return (
                      <TableRow
                        key={product.id}
                        className={inCollection ? "opacity-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleProductSelect(
                                product.id,
                                checked as boolean
                              )
                            }
                            disabled={inCollection}
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
                          {inCollection ? (
                            <Badge variant="secondary">
                              Already in collection
                            </Badge>
                          ) : (
                            <Badge
                              variant={
                                product.isActive ? "default" : "secondary"
                              }
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
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
                  disabled={page <= 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddProducts}
            disabled={selectedProducts.size === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {selectedProducts.size} Product(s)
          </Button>{" "}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
