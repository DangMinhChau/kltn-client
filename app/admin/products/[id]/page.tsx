"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Eye,
  Package,
  DollarSign,
  Star,
  Users,
  Calendar,
  ImageIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVariant } from "@/types";
import { adminProductsApi, adminVariantsApi } from "@/lib/api/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const [productRes, variantsRes] = await Promise.all([
        adminProductsApi.getProduct(productId),
        adminVariantsApi.getVariants({ productId, limit: 100 }),
      ]);

      setProduct(productRes);
      setVariants(variantsRes.data);
    } catch (error) {
      console.error("Error loading product data:", error);
      toast.error("Không thể tải dữ liệu sản phẩm");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setIsDeleting(true);
      await adminProductsApi.deleteProduct(productId);
      toast.success("Xóa sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await adminVariantsApi.deleteVariant(variantId);
      toast.success("Xóa biến thể thành công!");
      // Reload variants
      const variantsRes = await adminVariantsApi.getVariants({
        productId,
        limit: 100,
      });
      setVariants(variantsRes.data);
    } catch (error: any) {
      console.error("Error deleting variant:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa biến thể"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
          <Link href="/admin/products">
            <Button className="mt-4">Quay lại danh sách sản phẩm</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = variants.reduce(
    (sum, variant) => sum + variant.stockQuantity,
    0
  );
  const activeVariants = variants.filter((variant) => variant.isActive).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
            <p className="text-muted-foreground">SKU: {product.baseSku}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
          </Link>
          <Link href={`/admin/products/${productId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/products/${productId}/variants/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm biến thể
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa sản phẩm
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa sản phẩm "{product.name}"? Hành
                      động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProduct}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xóa...
                        </>
                      ) : (
                        "Xóa"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Tên sản phẩm
                  </h4>
                  <p className="mt-1">{product.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Danh mục
                  </h4>
                  <p className="mt-1">{product.category?.name || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Giá cơ bản
                  </h4>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(Number(product.basePrice))}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Giảm giá
                  </h4>{" "}
                  <p className="mt-1">
                    {product.discountPercent
                      ? `${product.discountPercent.toFixed(0)}%`
                      : "Không có"}
                  </p>
                </div>
              </div>

              {product.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Mô tả
                    </h4>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </>
              )}

              {/* Attributes */}
              {(product.materials?.length ||
                product.styles?.length ||
                product.tags?.length ||
                product.collections?.length) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Thuộc tính
                    </h4>

                    {product.collections && product.collections.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Bộ sưu tập:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.collections.map((collection) => (
                            <Badge key={collection.id} variant="outline">
                              {collection.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.materials && product.materials.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Chất liệu:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.materials.map((material) => (
                            <Badge key={material.id} variant="outline">
                              {material.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.styles && product.styles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Phong cách:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.styles.map((style) => (
                            <Badge key={style.id} variant="outline">
                              {style.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Thẻ:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Biến thể sản phẩm</CardTitle>
                <CardDescription>
                  Quản lý các biến thể theo màu sắc và kích thước
                </CardDescription>
              </div>
              <Link href={`/admin/products/${productId}/variants/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm biến thể
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {variants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Màu sắc</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-mono text-sm">
                          {variant.sku}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: variant.color?.hexCode,
                              }}
                            />
                            <span>{variant.color?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{variant.size?.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              variant.stockQuantity > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {variant.stockQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <ImageIcon className="h-4 w-4" />
                            <span>{variant.images?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={variant.isActive ? "default" : "secondary"}
                          >
                            {variant.isActive ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
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
                                  href={`/admin/products/${productId}/variants/${variant.id}/edit`}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Xác nhận xóa biến thể
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa biến thể "
                                      {variant.sku}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteVariant(variant.id)
                                      }
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
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">Chưa có biến thể nào</h3>
                  <p className="text-muted-foreground mb-4">
                    Thêm biến thể đầu tiên cho sản phẩm này
                  </p>
                  <Link href={`/admin/products/${productId}/variants/create`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm biến thể
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Tổng tồn kho</p>
                    <p className="text-2xl font-bold">{totalStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Biến thể hoạt động</p>
                    <p className="text-2xl font-bold">{activeVariants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Đánh giá trung bình</p>
                    <p className="text-2xl font-bold">
                      {product.averageRating?.toFixed(1) || "0.0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Số đánh giá</p>
                    <p className="text-2xl font-bold">
                      {product.totalReviews || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh chính</CardTitle>
            </CardHeader>
            <CardContent>
              {product.image ? (
                <Image
                  src={product.image.imageUrl}
                  alt={product.image.altText || product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cập nhật:</span>
                <span>{formatDate(product.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slug:</span>
                <span className="font-mono text-xs">{product.slug}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
