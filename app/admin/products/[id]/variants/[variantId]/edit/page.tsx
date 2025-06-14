"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductVariant, Product, Color, Size } from "@/types";
import {
  adminProductsApi,
  adminVariantsApi,
  UpdateVariantData,
} from "@/lib/api/admin";
import { adminAttributesApi } from "@/lib/api/admin";
import { MultipleImageUpload } from "@/components/admin/image-upload";

const updateVariantSchema = z.object({
  sku: z.string().min(1, "Mã SKU là bắt buộc"),
  colorId: z.string().min(1, "Màu sắc là bắt buộc"),
  sizeId: z.string().min(1, "Kích thước là bắt buộc"),
  stockQuantity: z.number().min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
  isActive: z.boolean(),
});

type UpdateVariantFormData = z.infer<typeof updateVariantSchema>;

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const variantId = params.variantId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  // Data states
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const form = useForm<UpdateVariantFormData>({
    resolver: zodResolver(updateVariantSchema),
    defaultValues: {
      sku: "",
      colorId: "",
      sizeId: "",
      stockQuantity: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    loadData();
  }, [productId, variantId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [variantRes, productRes, colorsRes, sizesRes] = await Promise.all([
        adminVariantsApi.getVariant(variantId),
        adminProductsApi.getProduct(productId),
        adminAttributesApi.getColors(),
        adminAttributesApi.getSizes(),
      ]);

      const variantData = variantRes;
      setVariant(variantData);
      setProduct(productRes);
      setColors(colorsRes.data || []);
      setSizes(sizesRes.data || []);

      // Set form data
      form.reset({
        sku: variantData.sku,
        colorId: variantData.color?.id || "",
        sizeId: variantData.size?.id || "",
        stockQuantity: variantData.stockQuantity,
        isActive: variantData.isActive,
      });

      // Set current image previews
      if (variantData.images && variantData.images.length > 0) {
        setImagePreviews(variantData.images.map((img) => img.imageUrl));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu biến thể");
      router.push(`/admin/products/${productId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesSelect = (files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    // If it's a new image (from selectedImages)
    const existingImagesCount = variant?.images?.length || 0;
    if (index >= existingImagesCount) {
      const newImageIndex = index - existingImagesCount;
      setSelectedImages((prev) => prev.filter((_, i) => i !== newImageIndex));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateVariantFormData) => {
    try {
      setIsSubmitting(true);

      const updateData: UpdateVariantData = {
        id: variantId,
        ...data,
      };

      if (selectedImages.length > 0) {
        updateData.images = selectedImages;
      }

      await adminVariantsApi.updateVariant(updateData);
      toast.success("Cập nhật biến thể thành công!");
      router.push(`/admin/products/${productId}`);
    } catch (error: any) {
      console.error("Error updating variant:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật biến thể"
      );
    } finally {
      setIsSubmitting(false);
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

  if (!variant || !product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy biến thể</h1>
          <Link href={`/admin/products/${productId}`}>
            <Button className="mt-4">Quay lại sản phẩm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/products/${productId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa biến thể</h1>
            <p className="text-muted-foreground">
              Cập nhật biến thể: {variant.sku} - {product.name}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin biến thể</CardTitle>
                  <CardDescription>
                    Thông tin cơ bản của biến thể sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã SKU *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập mã SKU biến thể"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mã duy nhất để xác định biến thể này
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="colorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Màu sắc *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn màu sắc" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color.id} value={color.id}>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: color.hexCode }}
                                    />
                                    <span>{color.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sizeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kích thước *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn kích thước" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sizes.map((size) => (
                                <SelectItem key={size.id} value={size.id}>
                                  {size.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tồn kho *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Số lượng sản phẩm có sẵn trong kho
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Kích hoạt biến thể
                          </FormLabel>
                          <FormDescription>
                            Biến thể có hiển thị trên website không
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh biến thể</CardTitle>
                  <CardDescription>
                    Cập nhật hình ảnh cho biến thể này (tối đa 5 ảnh)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MultipleImageUpload
                    onImagesSelect={handleImagesSelect}
                    onImageRemove={handleImageRemove}
                    previews={imagePreviews}
                    maxFiles={5}
                    maxSize={10}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Tên sản phẩm
                      </h4>
                      <p className="mt-1">{product.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        SKU gốc
                      </h4>
                      <p className="mt-1 font-mono text-sm">
                        {product.baseSku}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Danh mục
                      </h4>
                      <p className="mt-1">{product.category?.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        SKU hiện tại
                      </h4>
                      <p className="mt-1 font-mono text-sm">{variant.sku}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Cập nhật biến thể
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/admin/products/${productId}`)
                      }
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
