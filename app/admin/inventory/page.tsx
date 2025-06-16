"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  Package,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  Warehouse,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminVariantsApi, adminProductsApi } from "@/lib/api/admin";
import { ProductVariant, Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { BulkStockUpdateDialog } from "@/components/admin/BulkStockUpdateDialog";

interface InventoryFilters {
  search?: string;
  stockStatus?: "all" | "in-stock" | "low-stock" | "out-of-stock";
  category?: string;
  page?: number;
  limit?: number;
}

interface InventoryStats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockValue: number;
}

function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalVariants: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    stockValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({
    search: searchParams.get("search") || "",
    stockStatus: (searchParams.get("stockStatus") as any) || "all",
    category: searchParams.get("category") || "",
    page: parseInt(searchParams.get("page") || "1"),
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchInventoryData();
  }, [filters]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const queryParams: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.search) {
        queryParams.search = filters.search;
      }

      // Map stock status to backend filters
      if (filters.stockStatus === "out-of-stock") {
        queryParams.minStock = 0;
        queryParams.maxStock = 0;
      } else if (filters.stockStatus === "low-stock") {
        queryParams.minStock = 1;
        queryParams.maxStock = 10;
      } else if (filters.stockStatus === "in-stock") {
        queryParams.minStock = 11;
      }

      const response = await adminVariantsApi.getVariants(queryParams);
      setVariants(response.data);
      setPagination({
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: response.totalCount,
        totalPages: Math.ceil(response.totalCount / (filters.limit || 20)),
      });

      // Calculate stats
      const totalStock = response.data.reduce(
        (sum, variant) => sum + variant.stockQuantity,
        0
      );
      const lowStockItems = response.data.filter(
        (variant) => variant.stockQuantity > 0 && variant.stockQuantity <= 10
      ).length;
      const outOfStockItems = response.data.filter(
        (variant) => variant.stockQuantity === 0
      ).length;
      const stockValue = response.data.reduce((sum, variant) => {
        const price = variant.product?.basePrice || 0;
        return sum + price * variant.stockQuantity;
      }, 0);

      setStats({
        totalProducts: new Set(response.data.map((v) => v.product?.id)).size,
        totalVariants: response.data.length,
        totalStock,
        lowStockItems,
        outOfStockItems,
        stockValue,
      });
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Không thể tải dữ liệu kho hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v.toString());
    });
    router.push(`/admin/inventory?${params.toString()}`);
  };

  const getStockStatusBadge = (stockQuantity: number, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Không hoạt động</Badge>;
    }
    if (stockQuantity === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (stockQuantity <= 5) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          Rất ít
        </Badge>
      );
    }
    if (stockQuantity <= 10) {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          Sắp hết
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600">
        Còn hàng
      </Badge>
    );
  };

  const getStockIcon = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (stockQuantity <= 10) {
      return <TrendingDown className="h-4 w-4 text-orange-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const handleQuickStockUpdate = async (
    variantId: string,
    newStock: number
  ) => {
    try {
      setUpdating(true);
      await adminVariantsApi.updateStock(variantId, {
        stockQuantity: newStock,
      });

      // Update local state
      setVariants((prev) =>
        prev.map((variant) =>
          variant.id === variantId
            ? { ...variant, stockQuantity: newStock }
            : variant
        )
      );

      toast.success("Cập nhật số lượng thành công");
      fetchInventoryData(); // Refresh stats
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Không thể cập nhật số lượng");
    } finally {
      setUpdating(false);
    }
  };

  const exportInventory = () => {
    const csvContent = [
      [
        "SKU",
        "Tên sản phẩm",
        "Màu sắc",
        "Kích thước",
        "Số lượng",
        "Giá",
        "Trạng thái",
      ].join(","),
      ...variants.map((variant) =>
        [
          variant.sku,
          variant.product?.name || "",
          variant.color?.name || "",
          variant.size?.name || "",
          variant.stockQuantity,
          variant.product?.basePrice || 0,
          variant.isActive ? "Hoạt động" : "Không hoạt động",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const breadcrumbItems = [
    {
      label: "Quản lý kho",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <AdminBreadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý kho</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý tồn kho sản phẩm
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <AdminBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý kho</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tồn kho sản phẩm
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportInventory}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkUpdateDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Cập nhật hàng loạt
          </Button>
          <Button onClick={() => fetchInventoryData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Sản phẩm độc lập</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng biến thể</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">Biến thể sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tồn kho</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStock.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Số lượng sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">≤ 10 sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Cần nhập hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.stockValue)}
            </div>
            <p className="text-xs text-muted-foreground">Tổng giá trị</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo SKU, tên sản phẩm..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.stockStatus}
              onValueChange={(value) =>
                handleFilterChange("stockStatus", value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="in-stock">Còn hàng</SelectItem>
                <SelectItem value="low-stock">Sắp hết</SelectItem>
                <SelectItem value="out-of-stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tồn kho</CardTitle>
          <CardDescription>
            Tổng cộng {pagination.total} biến thể sản phẩm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                          {variant.images && variant.images.length > 0 ? (
                            <Image
                              src={
                                typeof variant.images[0] === "string"
                                  ? variant.images[0]
                                  : variant.images[0].imageUrl
                              }
                              alt={variant.product?.name || ""}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{variant.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {variant.product?.category?.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {variant.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {variant.color && (
                          <Badge variant="outline">
                            <div
                              className="w-3 h-3 rounded-full mr-1"
                              style={{ backgroundColor: variant.color.hexCode }}
                            />
                            {variant.color.name}
                          </Badge>
                        )}
                        {variant.size && (
                          <Badge variant="outline">{variant.size.name}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStockIcon(variant.stockQuantity)}
                        <Input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) =>
                            handleQuickStockUpdate(
                              variant.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 h-8"
                          disabled={updating}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPrice(variant.product?.basePrice || 0)}
                    </TableCell>
                    <TableCell>
                      {getStockStatusBadge(
                        variant.stockQuantity,
                        variant.isActive
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/products/${variant.product?.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem sản phẩm
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/products/variants?productId=${variant.product?.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa variant
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong {pagination.total} kết quả
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page <= 1}
                >
                  Trước
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(
                            pagination.totalPages - 4,
                            pagination.page - 2
                          )
                        ) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterChange("page", pageNum)}
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
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Update Dialog */}
      <BulkStockUpdateDialog
        open={showBulkUpdateDialog}
        onOpenChange={setShowBulkUpdateDialog}
        onUpdateComplete={() => {
          fetchInventoryData();
          setShowBulkUpdateDialog(false);
        }}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
