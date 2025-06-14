"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  DollarSign,
  Tag,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct } from "@/lib/hooks/useAdminData";
import {
  useDeleteProduct,
  useUpdateProduct,
} from "@/lib/hooks/useAdminMutations";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: product, loading, error } = useProduct(productId);
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: { isActive: !product.isActive },
      });
      toast.success(
        `Product ${product.isActive ? "hidden" : "published"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={updateProduct.isPending}
          >
            {product.isActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Product
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish Product
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/products/${productId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Published" : "Draft"}
        </Badge>
        {product.isFeatured && <Badge variant="outline">Featured</Badge>}
        {product.hasVariants && <Badge variant="outline">Has Variants</Badge>}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
          {product.hasVariants && (
            <TabsTrigger value="variants">Variants</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm">
                    {product.description || "No description"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SKU
                  </label>
                  <p className="text-sm font-mono">
                    {product.sku || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Slug
                  </label>
                  <p className="text-sm font-mono">/{product.slug}</p>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categories & Collections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-sm">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
                {product.collections && product.collections.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Collections
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.collections.map((collection) => (
                        <Badge key={collection.id} variant="outline">
                          {collection.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Created
                    </label>
                    <p>{formatDate(product.createdAt)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Updated
                    </label>
                    <p>{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No images uploaded
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Price
                  </label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                {product.compareAtPrice && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Compare Price
                    </label>
                    <p className="text-sm line-through text-muted-foreground">
                      {formatCurrency(product.compareAtPrice)}
                    </p>
                  </div>
                )}
                {product.costPerItem && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Cost per Item
                    </label>
                    <p className="text-sm">
                      {formatCurrency(product.costPerItem)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock Quantity
                  </label>
                  <p className="text-lg font-semibold">
                    {product.stockQuantity || 0} units
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Track Inventory
                  </label>
                  <p className="text-sm">
                    {product.trackInventory ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Allow Backorders
                  </label>
                  <p className="text-sm">
                    {product.allowBackorders ? "Yes" : "No"}
                  </p>
                </div>
                {product.weight && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Weight
                    </label>
                    <p className="text-sm">{product.weight} kg</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Meta Title
                </label>
                <p className="text-sm">{product.metaTitle || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Meta Description
                </label>
                <p className="text-sm">
                  {product.metaDescription || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  URL Handle
                </label>
                <p className="text-sm font-mono">/{product.slug}</p>
              </div>
              <div className="pt-4">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Store
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {product.hasVariants && (
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Variant management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
