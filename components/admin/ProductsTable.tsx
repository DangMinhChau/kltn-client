import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  ExternalLink,
} from "lucide-react";
import { Product, Image as ImageType } from "@/types";

interface ProductsTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectProduct: (productId: string) => void;
  onSelectAll: () => void;
  onDeleteProduct: (productId: string) => void;
  isAllSelected: boolean;
  loading?: boolean;
  loadingAction?: boolean;
}

export function ProductsTable({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onDeleteProduct,
  isAllSelected,
  loading = false,
  loadingAction = false,
}: ProductsTableProps) {
  // Utility functions
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Hoạt động" : "Không hoạt động"}
      </Badge>
    );
  };
  const getTotalVariants = (product: Product) => {
    return product.variants?.length || 0;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Danh sách sản phẩm
        </CardTitle>
        <CardDescription>Hiển thị {products.length} sản phẩm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    disabled={loadingAction}
                  />
                </TableHead>{" "}
                <TableHead className="min-w-[300px]">Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá gốc</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>{" "}
            <TableBody>
              {products.map((product) => {
                return (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => onSelectProduct(product.id)}
                        disabled={loadingAction}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            SKU: {product.baseSku}
                          </p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.name || "Chưa phân loại"}
                      </Badge>
                    </TableCell>{" "}
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(product.basePrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.discountPercent &&
                      product.discountPercent > 0 ? (
                        <Badge variant="secondary" className="font-medium">
                          -{product.discountPercent}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Không có
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {getTotalVariants(product)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={loadingAction}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Xem ở shop
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/products/variants?productId=${product.id}`}
                              className="flex items-center"
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Quản lý variants
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận xóa
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa sản phẩm "
                                  {product.name}"? Hành động này không thể hoàn
                                  tác và sẽ xóa tất cả variants liên quan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty state */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Không có sản phẩm</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
