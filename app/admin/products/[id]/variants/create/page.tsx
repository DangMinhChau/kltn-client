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
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Upload, X, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Product, Color, Size } from "@/types";
import {
  adminProductsApi,
  adminVariantsApi,
  CreateVariantData,
} from "@/lib/api/admin";
import { adminApi } from "@/lib/api/admin";

const createVariantSchema = z.object({
  sku: z.string().min(1, "Mã SKU là bắt buộc"),
  colorId: z.string().min(1, "Màu sắc là bắt buộc"),
  sizeId: z.string().min(1, "Kích thước là bắt buộc"),
  stockQuantity: z.number().min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
  isActive: z.boolean(),
});

type CreateVariantFormData = z.infer<typeof createVariantSchema>;

export default function CreateVariantPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  // Data states
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const form = useForm<CreateVariantFormData>({
    resolver: zodResolver(createVariantSchema),
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
  }, [productId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productRes, colorsRes, sizesRes] = await Promise.all([
        adminProductsApi.getProduct(productId),
        adminApi.attributes.getColors(),
        adminApi.attributes.getSizes(),
      ]);

      setProduct(productRes);
      setColors(colorsRes || []);
      setSizes(sizesRes || []);

      // Generate SKU suggestion
      if (productRes.baseSku) {
        form.setValue("sku", `${productRes.baseSku}-VAR-${Date.now()}`);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu");
      router.push(`/admin/products/${productId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== files.length) {
      toast.error("Vui lòng chỉ chọn các file hình ảnh");
      return;
    }

    if (selectedImages.length + validImages.length > 5) {
      toast.error("Tối đa 5 hình ảnh cho mỗi biến thể");
      return;
    }

    setSelectedImages((prev) => [...prev, ...validImages]);

    // Create previews
    validImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateVariantFormData) => {
    try {
      setIsSubmitting(true);

      const createData: CreateVariantData = {
        productId,
        ...data,
        images: selectedImages,
      };

      await adminVariantsApi.createVariant(createData);
      toast.success("Tạo biến thể thành công!");
      router.push(`/admin/products/${productId}`);
    } catch (error: any) {
      console.error("Error creating variant:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo biến thể"
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
            <h1 className="text-2xl font-bold">Tạo biến thể mới</h1>
            <p className="text-muted-foreground">
              Thêm biến thể cho sản phẩm: {product.name}
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
                    Tải lên hình ảnh cho biến thể này (tối đa 5 ảnh)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <Label
                          htmlFor="images"
                          className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Chọn hình ảnh
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG (tối đa 10MB mỗi file)
                        </p>
                        <p className="text-xs text-gray-500">
                          Có thể chọn nhiều ảnh cùng lúc
                        </p>
                      </div>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="hidden"
                        disabled={selectedImages.length >= 5}
                      />
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedImages.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">
                          Chưa có hình ảnh nào được chọn
                        </p>
                      </div>
                    )}
                  </div>
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
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Tạo biến thể
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
