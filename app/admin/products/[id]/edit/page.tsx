"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Upload, X, Save, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Product,
  Category,
  Collection,
  Material,
  Style,
  Tag,
  Image as ImageType,
} from "@/types";
import {
  adminProductsApi,
  adminCategoriesApi,
  adminCollectionsApi,
  adminApi,
  UpdateProductData,
} from "@/lib/api/admin";

const updateProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Giá phải lớn hơn 0"),
  discountPercent: z.number().min(0).max(100).optional(),
  categoryId: z.string().min(1, "Danh mục là bắt buộc"),
  baseSku: z.string().min(1, "Mã SKU là bắt buộc"),
  isActive: z.boolean(),
  materialIds: z.array(z.string()),
  styleIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  collectionIds: z.array(z.string()),
});

// Helper function to get image URL from Image type
const getImageUrl = (image: ImageType): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  return image.imageUrl;
};

type UpdateProductFormData = z.infer<typeof updateProductSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const form = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      discountPercent: 0,
      categoryId: "",
      baseSku: "",
      isActive: true,
      materialIds: [],
      styleIds: [],
      tagIds: [],
      collectionIds: [],
    },
  });

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [
        productRes,
        categoriesRes,
        collectionsRes,
        materialsRes,
        stylesRes,
        tagsRes,
      ] = await Promise.all([
        adminProductsApi.getProduct(productId),
        adminCategoriesApi.getCategories(),
        adminCollectionsApi.getCollections(),
        adminApi.attributes.getMaterials(),
        adminApi.attributes.getStyles(),
        adminApi.attributes.getTags(),
      ]);
      const productData = productRes;
      setProduct(productData);
      setCategories(categoriesRes || []);
      setCollections(collectionsRes || []);
      setMaterials(materialsRes || []);
      setStyles(stylesRes || []);
      setTags(tagsRes || []);

      // Set form data
      form.reset({
        name: productData.name,
        description: productData.description || "",
        basePrice: Number(productData.basePrice),
        discountPercent: productData.discountPercent || 0,
        categoryId: productData.category?.id || "",
        baseSku: productData.baseSku,
        isActive: productData.isActive,
        materialIds: productData.materials?.map((m) => m.id) || [],
        styleIds: productData.styles?.map((s) => s.id) || [],
        tagIds: productData.tags?.map((t) => t.id) || [],
        collectionIds: productData.collections?.map((c) => c.id) || [],
      }); // Set current image preview
      const imageUrl = getImageUrl(productData.image);
      if (imageUrl) {
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu sản phẩm");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Vui lòng chọn file hình ảnh");
      }
    }
  };
  const removeImage = () => {
    setSelectedImage(null);
    const imageUrl = product?.image?.imageUrl;
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: UpdateProductFormData) => {
    try {
      setIsSubmitting(true);

      const updateData: UpdateProductData = {
        ...data,
      };

      await adminProductsApi.updateProduct(
        productId,
        updateData,
        selectedImage || undefined
      );
      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật sản phẩm"
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
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin sản phẩm: {product.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/products/${product.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Thông tin chính của sản phẩm
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
                          <Input placeholder="Nhập tên sản phẩm" {...field} />
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
                            placeholder="Nhập mô tả sản phẩm"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="baseSku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="VD: SP001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá cơ bản *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}                    />
                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giảm giá (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(+e.target.value || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Phần trăm giảm giá (0-100%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Kích hoạt sản phẩm
                          </FormLabel>
                          <FormDescription>
                            Sản phẩm có hiển thị trên website không
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

              {/* Attributes - Same as create page */}
              <Card>
                <CardHeader>
                  <CardTitle>Thuộc tính sản phẩm</CardTitle>
                  <CardDescription>
                    Chọn các thuộc tính cho sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Collections */}
                  <FormField
                    control={form.control}
                    name="collectionIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bộ sưu tập</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {collections.map((collection) => (
                            <div
                              key={collection.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`collection-${collection.id}`}
                                checked={field.value?.includes(collection.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, collection.id]);
                                  } else {
                                    field.onChange(
                                      current.filter(
                                        (id) => id !== collection.id
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`collection-${collection.id}`}
                                className="text-sm font-normal"
                              >
                                {collection.name}
                              </Label>
                            </div>
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
                    name="materialIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chất liệu</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`material-${material.id}`}
                                checked={field.value?.includes(material.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, material.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== material.id)
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`material-${material.id}`}
                                className="text-sm font-normal"
                              >
                                {material.name}
                              </Label>
                            </div>
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
                    name="styleIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phong cách</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {styles.map((style) => (
                            <div
                              key={style.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`style-${style.id}`}
                                checked={field.value?.includes(style.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, style.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== style.id)
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`style-${style.id}`}
                                className="text-sm font-normal"
                              >
                                {style.name}
                              </Label>
                            </div>
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
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thẻ</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {tags.map((tag) => (
                            <div
                              key={tag.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`tag-${tag.id}`}
                                checked={field.value?.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, tag.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== tag.id)
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`tag-${tag.id}`}
                                className="text-sm font-normal"
                              >
                                {tag.name}
                              </Label>
                            </div>
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
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                  <CardDescription>
                    Cập nhật hình ảnh chính của sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg border"
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
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="h-12 w-12 mx-auto text-gray-400" />
                          <div className="mt-2">
                            <Label
                              htmlFor="image"
                              className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              Chọn hình ảnh mới
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, JPEG (tối đa 10MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
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
                          Cập nhật sản phẩm
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/admin/products")}
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
