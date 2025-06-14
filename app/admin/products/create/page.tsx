"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { useCreateProduct } from "@/lib/hooks/useAdminMutations";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct.mutate(data);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={createProduct.loading}
      />
    </div>
  );
}
