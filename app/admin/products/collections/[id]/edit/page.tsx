"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionFormDialog } from "@/components/collections/CollectionFormDialog";
import { adminCollectionApi } from "@/lib/api";
import { Collection } from "@/types";
import { toast } from "sonner";

interface CollectionEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CollectionEditPage({
  params,
}: CollectionEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminCollectionApi.getCollection(parseInt(id));
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

  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      const updatedCollection = await adminCollectionApi.updateCollection(
        parseInt(id),
        data
      );
      setCollection(updatedCollection);
      toast.success("Collection updated successfully");
      router.push(`/admin/products/collections/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update collection");
    } finally {
      setSaving(false);
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
        <Skeleton className="h-96" />
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
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Collection
            </h1>
            <p className="text-muted-foreground">
              Update {collection.name} details
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Details</CardTitle>
          <CardDescription>
            Update the collection information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollectionFormDialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                router.back();
              }
            }}
            collection={collection}
            onSubmit={handleSave}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
