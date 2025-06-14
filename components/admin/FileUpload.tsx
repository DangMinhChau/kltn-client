"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, File, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function FileUpload({
  onFileSelect,
  accept = "*/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 1,
  className,
  disabled = false,
  children,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size too large`, {
        description: `${file.name} is larger than ${maxSize}MB`,
      });
      return false;
    }
    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (!multiple && fileArray.length > 1) {
        toast.error("Multiple files not allowed");
        return;
      }

      if (fileArray.length > maxFiles) {
        toast.error(`Too many files`, {
          description: `Maximum ${maxFiles} files allowed`,
        });
        return;
      }

      const validFiles = fileArray.filter(validateFile);

      if (validFiles.length > 0) {
        onFileSelect(validFiles);
        toast.success(`${validFiles.length} file(s) selected`);
      }
    },
    [multiple, maxFiles, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
      // Reset input to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-colors",
        isDragOver && !disabled
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="text-center"
        >
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {children || (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept !== "*/*" && `Accepts: ${accept}`}
                  {maxSize && ` • Max size: ${maxSize}MB`}
                  {multiple && ` • Max files: ${maxFiles}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  if (files.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">{getFileIcon(file)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export interface ImageUploadProps extends Omit<FileUploadProps, "accept"> {
  onImageSelect: (files: File[]) => void;
  showPreview?: boolean;
  previewImages?: string[];
}

export function ImageUpload({
  onImageSelect,
  showPreview = true,
  previewImages = [],
  ...props
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = useCallback(
    (files: File[]) => {
      setSelectedFiles(files);
      onImageSelect(files);
    },
    [onImageSelect]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onImageSelect(newFiles);
    },
    [selectedFiles, onImageSelect]
  );

  return (
    <div className="space-y-4">
      <FileUpload {...props} accept="image/*" onFileSelect={handleFileSelect} />

      {showPreview && selectedFiles.length > 0 && (
        <FilePreview files={selectedFiles} onRemove={removeFile} />
      )}

      {showPreview && previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewImages.map((src, index) => (
            <div key={index} className="relative group">
              <img
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // Handle removing existing images
                    toast.info("Remove existing image functionality");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
