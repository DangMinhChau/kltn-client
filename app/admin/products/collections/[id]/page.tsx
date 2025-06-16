"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Package,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  Plus,
  Upload,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { adminCollectionApi } from "@/lib/api";
import { Collection, Product } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface CollectionDetailPageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, [params.id]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCollectionApi.getCollection(
        parseInt(params.id)
      );
      setCollection(result);
    } catch (err: any) {
      if (err.response?.status === 404) {
        notFound();
      }
      setError(err.message || "Failed to fetch collection");
      console.error("Error fetching collection:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/products/collections/${params.id}/edit`);
  };

  const handleManageProducts = () => {
    router.push(`/admin/products/collections/${params.id}/products`);
  };

  const handleUploadImages = () => {
    router.push(`/admin/products/collections/${params.id}/images`);
  };

  const toggleStatus = async () => {
    if (!collection) return;

    try {
      const updatedCollection = await adminCollectionApi.updateCollection(
        parseInt(params.id),
        { isActive: !collection.isActive }
      );
      setCollection(updatedCollection);
      toast.success(
        `Collection ${
          collection.isActive ? "deactivated" : "activated"
        } successfully`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update collection status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">
          {error || "Collection not found"}
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
              <span>{collection.name}</span>
              <Badge variant={collection.isActive ? "default" : "secondary"}>
                {collection.isActive ? "Active" : "Inactive"}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              {collection.season} {collection.year} Collection
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={toggleStatus}>
            {collection.isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleUploadImages}>
            <Upload className="h-4 w-4 mr-2" />
            Images
          </Button>
          <Button variant="outline" onClick={handleManageProducts}>
            <Package className="h-4 w-4 mr-2" />
            Products
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-lg">{collection.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Slug
              </label>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {collection.slug}
              </p>
            </div>
            <div className="flex space-x-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Season
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Tag className="h-4 w-4" />
                  <span>{collection.season}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Year
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{collection.year}</span>
                </div>
              </div>
            </div>
            {collection.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm mt-1">{collection.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              {collection.images?.length || 0} images uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {collection.images && collection.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {collection.images.slice(0, 4).map((image, index) => (
                  <div
                    key={image.id}
                    className="aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || collection.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {collection.images.length > 4 && (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      +{collection.images.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex flex-col items-center justify-center space-y-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No images</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadImages}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Images
            </Button>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              {collection.products?.length || 0} products in this collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {collection.products && collection.products.length > 0 ? (
              <div className="space-y-3">
                {collection.products.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                ))}
                {collection.products.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{collection.products.length - 3} more products
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No products</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageProducts}
              className="w-full mt-4"
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Collection ID
                </label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                  {collection.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm mt-1">
                  {formatDate(
                    typeof collection.createdAt === "string"
                      ? collection.createdAt
                      : collection.createdAt.toISOString()
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm mt-1">
                  {formatDate(
                    typeof collection.updatedAt === "string"
                      ? collection.updatedAt
                      : collection.updatedAt.toISOString()
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
