"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useProduct } from "@/lib/hooks/useAdminData";
import { useUpdateProduct } from "@/lib/hooks/useAdminMutations";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageLoading } from "@/components/common/Loading";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data: product, loading, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (data: any) => {
    try {
      await updateProduct.mutate({ id: productId, ...data });
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">
              Failed to load product
            </h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">
              Product not found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              The product you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/admin/products">Back to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>

      {/* Product Form */}
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updateProduct.loading}
      />
    </div>
  );
}
