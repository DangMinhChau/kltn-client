import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  preview?: string | null;
  disabled?: boolean;
  maxSize?: number; // in MB
  accept?: string;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  preview,
  disabled = false,
  maxSize = 10,
  accept = "image/*",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Kích thước file không được vượt quá ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    onImageSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
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
            onClick={onImageRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
            ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-gray-400"
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <Label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
              Chọn hình ảnh hoặc kéo thả vào đây
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, JPEG (tối đa {maxSize}MB)
            </p>
          </div>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

interface MultipleImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  previews: string[];
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
}

export function MultipleImageUpload({
  onImagesSelect,
  onImageRemove,
  previews,
  disabled = false,
  maxFiles = 5,
  maxSize = 10,
  accept = "image/*",
}: MultipleImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (files: FileList) => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (previews.length + validFiles.length >= maxFiles) {
        toast.error(`Tối đa ${maxFiles} hình ảnh`);
        break;
      }

      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá ${maxSize}MB`);
        continue;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là hình ảnh`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onImagesSelect(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFilesSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFilesSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}
          ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
          }
          ${previews.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={
          !disabled && previews.length < maxFiles ? openFileDialog : undefined
        }
      >
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <Label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
            Chọn hình ảnh hoặc kéo thả vào đây
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG (tối đa {maxSize}MB mỗi file)
          </p>
          <p className="text-xs text-gray-500">
            Có thể chọn nhiều ảnh cùng lúc ({previews.length}/{maxFiles})
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
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
                onClick={() => onImageRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Chưa có hình ảnh nào được chọn</p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || previews.length >= maxFiles}
      />
    </div>
  );
}
