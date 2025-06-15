"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  ImageIcon,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProductVariant, Product, Color, Size } from "@/types";
import {
  adminProductsApi,
  adminVariantsApi,
  adminColorsApi,
  adminSizesApi,
} from "@/lib/api/admin";
import { formatCurrency } from "@/lib/utils";

interface PaginationParams {
  page?: number;
  limit?: number;
  productId: string;
}

export default function VariantsPage() {
  return (
    <Suspense fallback={<div>Loading variants...</div>}>
      <VariantsContent />
    </Suspense>
  );
}

function VariantsContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<string | null>(null);
  // Add variant states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedVariantForEdit, setSelectedVariantForEdit] =
    useState<ProductVariant | null>(null);
  const [newVariant, setNewVariant] = useState({
    colorId: "",
    sizeId: "",
    stockQuantity: 0,
    isActive: true,
    images: [] as File[],
  });
  const [editVariant, setEditVariant] = useState({
    colorId: "",
    sizeId: "",
    stockQuantity: 0,
    isActive: true,
    images: [] as File[],
  });

  const itemsPerPage = 10;
  useEffect(() => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm");
      return;
    }
    loadData();
  }, [currentPage, productId]);
  const loadData = async () => {
    if (!productId) return;

    try {
      setLoading(true);

      const params: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        productId: productId,
      };

      // First load product and basic data
      const [variantsResponse, productData, colorsData] = await Promise.all([
        adminVariantsApi.getVariants(params),
        adminProductsApi.getProduct(productId),
        adminColorsApi.getColors(),
      ]);

      setVariants(variantsResponse.data || []);
      setTotalItems(variantsResponse.totalCount || 0);
      setCurrentProduct(productData);
      setColors(colorsData);

      // Load sizes based on product category
      let sizesData: Size[] = [];
      if (productData?.category?.slug) {
        try {
          // Try to get sizes for specific category
          sizesData = await adminSizesApi.getSizesByCategory(
            productData.category.slug
          );
          console.log(
            `Loaded ${sizesData.length} sizes for category: ${productData.category.name}`
          );
        } catch (error) {
          console.warn(
            "Failed to load category-specific sizes, falling back to all sizes:",
            error
          );
          // Fallback to all sizes if category-specific fails
          sizesData = await adminSizesApi.getSizes();
        }
      } else {
        // No category, load all sizes
        console.log("Product has no category, loading all sizes");
        sizesData = await adminSizesApi.getSizes();
      }

      setSizes(sizesData);

      // Debug logging
      console.log("Data loaded:", {
        product: {
          name: productData?.name,
          category: productData?.category,
        },
        colors: colorsData?.length,
        sizes: sizesData?.length,
      });
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
  const handleCreateVariant = async () => {
    if (!productId || !newVariant.colorId || !newVariant.sizeId) {
      toast.error("Vui lòng chọn màu sắc và kích thước");
      return;
    }

    try {
      setCreating(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("colorId", newVariant.colorId);
      formData.append("sizeId", newVariant.sizeId);
      formData.append("stockQuantity", newVariant.stockQuantity.toString());
      formData.append("isActive", newVariant.isActive.toString());

      // Add images
      newVariant.images.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const createdVariant = await adminVariantsApi.createVariant(formData);

      setVariants((prev) => [createdVariant, ...prev]);
      setCreateDialogOpen(false);
      resetNewVariantForm();
      toast.success("Đã tạo biến thể thành công");
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error("Không thể tạo biến thể");
    } finally {
      setCreating(false);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariantForEdit(variant);
    setEditVariant({
      colorId: variant.color.id,
      sizeId: variant.size.id,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
      images: [],
    });
    setEditDialogOpen(true);
  };

  const handleUpdateVariant = async () => {
    if (!selectedVariantForEdit) return;

    try {
      setUpdating(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("colorId", editVariant.colorId);
      formData.append("sizeId", editVariant.sizeId);
      formData.append("stockQuantity", editVariant.stockQuantity.toString());
      formData.append("isActive", editVariant.isActive.toString());

      // Add new images
      editVariant.images.forEach((file) => {
        formData.append(`images`, file);
      });

      const updatedVariant = await adminVariantsApi.updateVariant(
        selectedVariantForEdit.id,
        formData
      );

      setVariants((prev) =>
        prev.map((v) =>
          v.id === selectedVariantForEdit.id ? updatedVariant : v
        )
      );
      setEditDialogOpen(false);
      setSelectedVariantForEdit(null);
      resetEditVariantForm();
      toast.success("Đã cập nhật biến thể thành công");
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Không thể cập nhật biến thể");
    } finally {
      setUpdating(false);
    }
  };

  const resetNewVariantForm = () => {
    setNewVariant({
      colorId: "",
      sizeId: "",
      stockQuantity: 0,
      isActive: true,
      images: [],
    });
  };

  const resetEditVariantForm = () => {
    setEditVariant({
      colorId: "",
      sizeId: "",
      stockQuantity: 0,
      isActive: true,
      images: [],
    });
  };

  const handleImageUpload = (files: FileList | null, isEdit = false) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (isEdit) {
      setEditVariant((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    } else {
      setNewVariant((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditVariant((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setNewVariant((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  }; // Since sizes are now loaded based on category from backend,
  // we just need to return active sizes
  const getFilteredSizes = () => {
    const activeSizes = sizes.filter((size) => size.isActive !== false);
    console.log(
      `Returning ${activeSizes.length} active sizes (already filtered by category from backend)`
    );
    return activeSizes;
  };

  if (!productId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Không tìm thấy ID sản phẩm
              </p>
              <Button asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách sản phẩm
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách sản phẩm
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Biến thể sản phẩm
            </h1>
            <p className="text-muted-foreground">
              {currentProduct
                ? `Quản lý biến thể của sản phẩm: ${currentProduct.name}`
                : "Đang tải thông tin sản phẩm..."}
            </p>
          </div>{" "}
          <div className="flex items-center gap-2">
            <Dialog
              open={createDialogOpen}
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) {
                  resetNewVariantForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm biến thể
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Thêm biến thể mới</DialogTitle>
                  <DialogDescription>
                    Tạo một biến thể mới cho sản phẩm {currentProduct?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Màu sắc</Label>
                      <Select
                        value={newVariant.colorId}
                        onValueChange={(value) =>
                          setNewVariant((prev) => ({ ...prev, colorId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn màu sắc" />
                        </SelectTrigger>
                        <SelectContent>
                          {" "}
                          {colors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{
                                    backgroundColor: color.hexCode || "#ccc",
                                  }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Kích thước</Label>
                      <Select
                        value={newVariant.sizeId}
                        onValueChange={(value) =>
                          setNewVariant((prev) => ({ ...prev, sizeId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kích thước" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredSizes().map((size) => (
                            <SelectItem key={size.id} value={size.id}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>{" "}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Số lượng tồn kho</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={newVariant.stockQuantity}
                        onChange={(e) =>
                          setNewVariant((prev) => ({
                            ...prev,
                            stockQuantity: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>{" "}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newVariant.isActive}
                          onCheckedChange={(checked) =>
                            setNewVariant((prev) => ({
                              ...prev,
                              isActive: checked,
                            }))
                          }
                        />
                        <Label htmlFor="active">Hoạt động</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Hình ảnh</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="cursor-pointer"
                    />
                    {newVariant.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {newVariant.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>{" "}
                  <Button
                    type="button"
                    onClick={handleCreateVariant}
                    disabled={
                      creating || !newVariant.colorId || !newVariant.sizeId
                    }
                  >
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Tạo biến thể
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>
      </div>
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
                    </TableHead>{" "}
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Số lượng</TableHead>
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
                        {" "}
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          {variant.images && variant.images.length > 0 ? (
                            <Image
                              src={
                                typeof variant.images[0] === "string"
                                  ? variant.images[0]
                                  : variant.images[0].imageUrl
                              }
                              alt={variant.sku}
                              width={48}
                              height={48}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>{" "}
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/products/${variant.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {variant.product.name}
                          </Link>
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
                      </TableCell>{" "}
                      <TableCell>{variant.stockQuantity}</TableCell>
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
                          </DropdownMenuTrigger>{" "}
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditVariant(variant)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
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

      {/* Edit Variant Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            resetEditVariantForm();
            setSelectedVariantForEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin biến thể {selectedVariantForEdit?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color">Màu sắc</Label>
                <Select
                  value={editVariant.colorId}
                  onValueChange={(value) =>
                    setEditVariant((prev) => ({ ...prev, colorId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.hexCode || "#ccc" }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-size">Kích thước</Label>
                <Select
                  value={editVariant.sizeId}
                  onValueChange={(value) =>
                    setEditVariant((prev) => ({ ...prev, sizeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kích thước" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredSizes().map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Số lượng tồn kho</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editVariant.stockQuantity}
                  onChange={(e) =>
                    setEditVariant((prev) => ({
                      ...prev,
                      stockQuantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>{" "}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editVariant.isActive}
                    onCheckedChange={(checked) =>
                      setEditVariant((prev) => ({
                        ...prev,
                        isActive: checked,
                      }))
                    }
                  />
                  <Label htmlFor="edit-active">Hoạt động</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-images">Hình ảnh mới</Label>
              <Input
                id="edit-images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files, true)}
                className="cursor-pointer"
              />
              {editVariant.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {editVariant.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index, true)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Chọn hình ảnh mới để thêm vào biến thể (không thay thế hình cũ)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleUpdateVariant}
              disabled={updating || !editVariant.colorId || !editVariant.sizeId}
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật biến thể
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
