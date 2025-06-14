"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  ImageIcon,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProductVariant, Product, Color, Size } from "@/types";
import { adminProductsApi, adminVariantsApi } from "@/lib/api/admin";
import { adminAttributesApi } from "@/lib/api/admin";
import { formatCurrency, debounce } from "@/lib/utils";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
}

export default function VariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, selectedProduct]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedProduct) {
        params.productId = selectedProduct;
      }

      const [variantsResponse, productsData] = await Promise.all([
        adminVariantsApi.getVariants(params),
        adminProductsApi.getProducts({ limit: 1000 }),
      ]);

      setVariants(variantsResponse.data || []);
      setTotalItems(variantsResponse.totalCount || 0);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminVariantsApi.deleteVariant(id);
      setVariants(variants.filter((variant) => variant.id !== id));
      toast.success("Đã xóa biến thể thành công");
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Không thể xóa biến thể");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVariants.length === 0) return;

    try {
      await Promise.all(
        selectedVariants.map((id) => adminVariantsApi.deleteVariant(id))
      );

      setVariants(
        variants.filter((variant) => !selectedVariants.includes(variant.id))
      );
      setSelectedVariants([]);
      toast.success(`Đã xóa ${selectedVariants.length} biến thể`);
    } catch (error) {
      console.error("Error bulk deleting variants:", error);
      toast.error("Không thể xóa các biến thể đã chọn");
    }
  };

  const toggleVariantSelection = (variantId: string) => {
    setSelectedVariants((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedVariants(
      selectedVariants.length === variants.length
        ? []
        : variants.map((v) => v.id)
    );
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleProductFilter = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusBadge = (isActive: boolean, stockQuantity: number) => {
    if (!isActive) {
      return <Badge variant="secondary">Không hoạt động</Badge>;
    }
    if (stockQuantity === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (stockQuantity < 10) {
      return <Badge variant="outline">Sắp hết</Badge>;
    }
    return <Badge variant="default">Còn hàng</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Biến thể sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Quản lý các biến thể của sản phẩm (màu sắc, kích thước)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button asChild>
            <Link href="/admin/products">
              <Package className="h-4 w-4 mr-2" />
              Quản lý sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo SKU, tên sản phẩm..."
                  className="pl-8"
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <Select value={selectedProduct} onValueChange={handleProductFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả sản phẩm</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedVariants.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedVariants.length} biến thể
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBulkDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa đã chọn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách biến thể ({totalItems})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedVariants.length === variants.length &&
                          variants.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Kích thước</TableHead>
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
                        <Checkbox
                          checked={selectedVariants.includes(variant.id)}
                          onCheckedChange={() =>
                            toggleVariantSelection(variant.id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          {variant.images && variant.images.length > 0 ? (
                            <Image
                              src={variant.images[0].url}
                              alt={variant.sku}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/products/${variant.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {variant.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {variant.product.category?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {variant.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        {variant.color ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: variant.color.hexCode }}
                            />
                            <span>{variant.color.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {variant.size ? (
                          variant.size.name
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{variant.stockQuantity}</TableCell>
                      <TableCell>
                        {formatCurrency(variant.product.basePrice)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          variant.isActive,
                          variant.stockQuantity
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
                                href={`/admin/products/${variant.product.id}/variants/${variant.id}/edit`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setVariantToDelete(variant.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {variants.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Không có biến thể nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hãy tạo biến thể cho sản phẩm của bạn
                  </p>
                  <Button asChild>
                    <Link href="/admin/products">Quản lý sản phẩm</Link>
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} của{" "}
                    {totalItems} kết quả
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa biến thể này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => variantToDelete && handleDelete(variantToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
