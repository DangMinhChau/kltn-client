"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  MoreHorizontal,
  Package,
  AlertTriangle,
  Search,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts, type Product } from "@/lib/hooks/useAdminData";
import {
  useDeleteProduct,
  useBulkProductAction,
  useUploadProductImages,
} from "@/lib/hooks/useAdminMutations";
import {
  DataTable,
  Column,
  ActionItem,
  BulkAction,
} from "@/components/admin/DataTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { toast } from "sonner";
import Image from "next/image";
import { adminApi } from "@/lib/api/admin";

export default function ProductsPage() {
  const router = useRouter();
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProductId, setUploadProductId] = useState<string | null>(null);
  // Data fetching
  const {
    data: productsData,
    total,
    page,
    pageSize,
    loading,
    search,
    filters,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setSorting,
    refresh,
  } = useProducts();

  // Safely handle null data
  const products = productsData || [];

  // Mutations
  const deleteProduct = useDeleteProduct();
  const bulkAction = useBulkProductAction();
  const uploadImages = useUploadProductImages();

  // Table columns configuration
  const columns: Column<Product>[] = [
    {
      id: "name",
      header: "Product",
      accessorKey: "name",
      sortable: true,
      filterable: true,
      cell: (product) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            {product.mainImageUrl ? (
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {product.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortable: true,
      filterable: true,
      filterType: "select",
      cell: (product) => (
        <Badge variant="outline">
          {product.category?.name || "No Category"}
        </Badge>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      sortable: true,
      align: "right",
      cell: (product) => (
        <div className="text-right">
          {product.salePrice && product.salePrice < product.price ? (
            <div>
              <div className="text-sm line-through text-muted-foreground">
                ${product.price.toFixed(2)}
              </div>
              <div className="font-medium text-red-600">
                ${product.salePrice.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="font-medium">${product.price.toFixed(2)}</div>
          )}
        </div>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      accessorKey: "stockQuantity",
      sortable: true,
      align: "center",
      cell: (product) => (
        <div className="text-center">
          <Badge
            variant={
              product.stockQuantity === 0
                ? "destructive"
                : product.stockQuantity < 10
                ? "secondary"
                : "default"
            }
          >
            {product.stockQuantity === 0 ? (
              <AlertTriangle className="h-3 w-3 mr-1" />
            ) : null}
            {product.stockQuantity}
          </Badge>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Draft", value: "draft" },
      ],
      cell: (product) => (
        <Badge
          variant={
            product.status === "active"
              ? "default"
              : product.status === "inactive"
              ? "secondary"
              : "outline"
          }
        >
          {product.status}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (product) => (
        <div className="text-sm text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<Product>[] = [
    {
      label: "View",
      onClick: (product) => router.push(`/admin/products/${product.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: (product) => router.push(`/admin/products/${product.id}/edit`),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Upload Images",
      onClick: (product) => {
        setUploadProductId(product.id);
        setUploadDialogOpen(true);
      },
      icon: <Upload className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: (product) => setDeleteProductId(product.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Product>[] = [
    {
      label: "Activate",
      onClick: async (products) => {
        await bulkAction.mutate({
          action: "activate",
          productIds: products.map((p) => p.id),
        });
        refresh();
      },
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "Deactivate",
      onClick: async (products) => {
        await bulkAction.mutate({
          action: "deactivate",
          productIds: products.map((p) => p.id),
        });
        refresh();
      },
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: async (products) => {
        if (
          confirm(
            `Are you sure you want to delete ${products.length} products?`
          )
        ) {
          await bulkAction.mutate({
            action: "delete",
            productIds: products.map((p) => p.id),
          });
          refresh();
        }
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      await deleteProduct.mutate(deleteProductId);
      setDeleteProductId(null);
      refresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!uploadProductId || !files.length) return;

    try {
      await uploadImages.mutate({ productId: uploadProductId, files });
      setUploadDialogOpen(false);
      setUploadProductId(null);
      refresh();
    } catch (error) {
      console.error("Failed to upload images:", error);
    }
  };

  const handleExport = () => {
    // Implementation for exporting products
    toast.info("Export functionality will be implemented soon");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, inventory, and pricing.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (products.filter((p) => p.status === "active").length / total) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stockQuantity === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Needs restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                products.filter(
                  (p) => p.stockQuantity > 0 && p.stockQuantity < 10
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">{"< 10 items"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A comprehensive list of all products in your catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            search={search}
            filters={filters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
            onFiltersChange={setFilters}
            onSortChange={setSorting}
            onRefresh={refresh}
            onExport={handleExport}
            actions={actions}
            bulkActions={bulkActions}
            selectable={true}
            getRowId={(product) => product.id}
          />
        </CardContent>
      </Card>

      {/* Delete Product Dialog */}
      <Dialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={deleteProduct.loading}
            >
              {deleteProduct.loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Images Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Product Images</DialogTitle>
            <DialogDescription>
              Select images to upload for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
