"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminCollectionApi } from "@/lib/api";
import { Collection, Image } from "@/types";
import { toast } from "sonner";

interface CollectionImagesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CollectionImagesPage({
  params,
}: CollectionImagesPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    image: Image | null;
  }>({ open: false, image: null });

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
      setImages(result.images || []);
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

  const handleFileSelect = (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isImage) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }

      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }

      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);

      await adminCollectionApi.uploadImages(parseInt(params.id), selectedFiles);

      toast.success(`Uploaded ${selectedFiles.length} image(s) successfully`);
      setSelectedFiles([]);
      await fetchCollection(); // Refresh to get updated images
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await adminCollectionApi.removeImage(
        parseInt(params.id),
        parseInt(imageId)
      );
      toast.success("Image deleted successfully");
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setDeleteDialog({ open: false, image: null });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image");
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
            <h1 className="text-3xl font-bold tracking-tight">
              Collection Images
            </h1>
            <p className="text-muted-foreground">
              {collection.name} - {images.length} images
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Upload images for your collection. Supported formats: JPG, PNG, WebP
            (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-muted-foreground mb-4">
              Select multiple images to upload at once
            </p>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleFileSelect(e.target.files)
              }
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Plus className="h-4 w-4 mr-2" />
                  Select Images
                </span>
              </Button>
            </Label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="grid gap-3 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                >
                  Clear All
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} Image(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Images */}
      <Card>
        <CardHeader>
          <CardTitle>Current Images</CardTitle>
          <CardDescription>
            Manage existing images for this collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images uploaded</h3>
              <p className="text-muted-foreground">
                Upload your first image to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.imageUrl}
                      alt={image.altText || collection.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  {/* Image Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                    {image.isPrimary && (
                      <Badge className="block w-fit">
                        <Check className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, image })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Info */}
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">
                      {image.altText || "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sort: {image.sortOrder}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, image: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.image && (
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <img
                src={deleteDialog.image.imageUrl}
                alt={deleteDialog.image.altText || collection.name}
                className="h-16 w-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">
                  {deleteDialog.image.altText || "Untitled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deleteDialog.image.isPrimary && "Primary image"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, image: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDialog.image && handleDeleteImage(deleteDialog.image.id)
              }
            >
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
