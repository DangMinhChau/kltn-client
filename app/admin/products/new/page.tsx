"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Plus, Save, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Category, Collection, Material, Style, Tag } from "@/types";
import {
  adminProductsApi,
  adminCategoriesApi,
  adminCollectionsApi,
  adminAttributesApi,
  CreateProductData,
} from "@/lib/api/admin";

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không được quá 255 ký tự"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  basePrice: z.number().min(0, "Giá không được âm"),
  isActive: z.boolean(),
  tags: z.array(z.string()),
  materials: z.array(z.string()),
  styles: z.array(z.string()),
  collections: z.array(z.string()),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Data for form options
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      basePrice: 0,
      isActive: true,
      tags: [],
      materials: [],
      styles: [],
      collections: [],
    },
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [
        categoriesData,
        collectionsData,
        materialsData,
        stylesData,
        tagsData,
      ] = await Promise.all([
        adminCategoriesApi.getCategories(),
        adminCollectionsApi.getCollections(),
        adminAttributesApi.getMaterials(),
        adminAttributesApi.getStyles(),
        adminAttributesApi.getTags(),
      ]);

      setCategories(categoriesData);
      setCollections(collectionsData);
      setMaterials(materialsData);
      setStyles(stylesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Không thể tải dữ liệu form");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);      if (!imageFile) {
        toast.error("Vui lòng chọn hình ảnh sản phẩm");
        return;
      }

      const productData: CreateProductData = {
        ...data,
        image: imageFile,
      };

      const product = await adminProductsApi.createProduct(productData);      toast.success("Đã tạo sản phẩm thành công");

      router.push(`/admin/products/${product.id}/edit`);
    } catch (error) {
      console.error("Error creating product:", error);      toast.error("Không thể tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Thêm sản phẩm mới
            </h1>
            <p className="text-muted-foreground">
              Tạo sản phẩm mới cho cửa hàng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" disabled={loading}>
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button type="submit" form="product-form" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Tạo sản phẩm
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          id="product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Nhập thông tin cơ bản của sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên sản phẩm..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả sản phẩm..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Mô tả chi tiết về sản phẩm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
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
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá gốc *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1000"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value
                              ? formatCurrency(field.value)
                              : "Nhập giá gốc của sản phẩm"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                  <CardDescription>
                    Tải lên hình ảnh chính của sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
                          <Image
                            src={imagePreview}
                            alt="Product preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <Label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <span className="text-sm font-medium text-primary hover:text-primary/80">
                                Nhấp để tải lên
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {" "}
                                hoặc kéo thả tệp vào đây
                              </span>
                            </Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            PNG, JPG, JPEG (tối đa 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attributes */}
              <Card>
                <CardHeader>
                  <CardTitle>Thuộc tính sản phẩm</CardTitle>
                  <CardDescription>
                    Chọn các thuộc tính liên quan đến sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Collections */}
                  <FormField
                    control={form.control}
                    name="collections"
                    render={() => (
                      <FormItem>
                        <FormLabel>Bộ sưu tập</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {collections.map((collection) => (
                            <FormField
                              key={collection.id}
                              control={form.control}
                              name="collections"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={collection.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          collection.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                collection.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== collection.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {collection.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Materials */}
                  <FormField
                    control={form.control}
                    name="materials"
                    render={() => (
                      <FormItem>
                        <FormLabel>Chất liệu</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {materials.map((material) => (
                            <FormField
                              key={material.id}
                              control={form.control}
                              name="materials"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={material.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          material.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                material.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== material.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {material.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Styles */}
                  <FormField
                    control={form.control}
                    name="styles"
                    render={() => (
                      <FormItem>
                        <FormLabel>Phong cách</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {styles.map((style) => (
                            <FormField
                              key={style.id}
                              control={form.control}
                              name="styles"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={style.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          style.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                style.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== style.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {style.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Tags */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {tags.map((tag) => (
                            <FormField
                              key={tag.id}
                              control={form.control}
                              name="tags"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={tag.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(tag.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                tag.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== tag.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {tag.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Hoạt động</FormLabel>
                          <FormDescription>
                            Sản phẩm sẽ hiển thị trên website
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Tên sản phẩm nên ngắn gọn và mô tả rõ ràng</p>
                  <p>• Hình ảnh nên có kích thước tối thiểu 800x800px</p>
                  <p>• Chọn đúng danh mục để dễ tìm kiếm</p>
                  <p>• Sau khi tạo sản phẩm, hãy thêm các variants</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
