"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AddToCartButton } from "@/components/common/AddToCartButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { VariantSelector } from "@/components/common/VariantSelector";
import { Product, ProductVariant, CartItem, Image as ImageType } from "@/types";
import {
  formatPrice,
  calculateDiscountedPrice,
  generateStarRating,
  getStockStatus,
} from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  // Use useRef for initialization to avoid re-initializing state on every render
  const initializedRef = React.useRef(false);
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Set initial variant only once when component mounts or product changes
  React.useEffect(() => {
    if (product && !initializedRef.current) {
      setSelectedVariant(product.variants?.[0]);
      initializedRef.current = true;
    }
  }, [product]);
  if (!product) return null;
  const basePrice =
    typeof product.basePrice === "string"
      ? parseFloat(product.basePrice)
      : product.basePrice;
  const discountPercent = product.discountPercent || 0;
  const discountedPrice = calculateDiscountedPrice(basePrice, discountPercent);

  const currentStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;

  const stockStatus = getStockStatus(currentStock);
  const stars = generateStarRating(product.averageRating || 0); // Get product main image
  const productMainImage = product.image?.imageUrl || ""; // Get current images with useMemo to prevent recalculation on every render
  const currentImages = React.useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.map((img) => img.imageUrl);
    }
    return [productMainImage];
  }, [selectedVariant, productMainImage]); // Convert Product to CartItem format
  const createCartItem = (): Omit<CartItem, "quantity"> => {
    const variant = selectedVariant || product.variants?.[0];
    const currentPrice = discountedPrice;
    const imageUrl = currentImages[selectedImageIndex]; // Get primary image or first image from product if available
    const productImage = product.image?.imageUrl || "";

    return {
      id: variant?.id || product.id,
      name: product.name,
      image: imageUrl || productImage,
      imageUrl: imageUrl || productImage, // For backward compatibility
      price: basePrice, // Already parsed to number
      discountPrice: discountPercent > 0 ? currentPrice : undefined,
      color: variant?.color?.name || "Mặc định",
      size: variant?.size?.name || "Mặc định",
      sku: variant?.sku || product.baseSku,
      maxQuantity: variant?.stockQuantity || 0,
      slug: product.slug,
      variant:
        variant ||
        ({
          id: product.id,
          sku: product.baseSku,
          stockQuantity: 0,
          isActive: true,
          color: undefined,
          size: undefined,
          images: [],
          product: product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as ProductVariant),
    };
  }; // Use React.useCallback to memoize the function and prevent recreation on every render
  const handleVariantChange = React.useCallback(
    (variant: ProductVariant) => {
      // Only update if the variant actually changed to prevent unnecessary re-renders
      if (!selectedVariant || variant.id !== selectedVariant.id) {
        setSelectedVariant(variant);
        setSelectedImageIndex(0); // Reset to first image when variant changes
      }
    },
    [selectedVariant]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Quick View - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {" "}
          {/* Image Section */}
          <div className="space-y-4">
            {/* Product Images Carousel */}
            <div className="relative">
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {" "}
                {(product as any).isFeatured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500 text-white text-xs"
                  >
                    Nổi bật
                  </Badge>
                )}
                {discountPercent > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>

              {currentImages.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {currentImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  <Image
                    src={currentImages[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            {/* Thumbnails for quick navigation */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto justify-center">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Product Info Section */}
          <div className="space-y-4">
            {/* Category */}
            <p className="text-sm text-muted-foreground font-medium">
              {product.category?.name}
            </p>
            {/* Product Name */}
            <h2 className="text-2xl font-bold leading-tight">{product.name}</h2>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {stars.map((star, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      star === "full"
                        ? "fill-yellow-400 text-yellow-400"
                        : star === "half"
                        ? "fill-yellow-400/50 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.totalReviews} đánh giá)
              </span>
            </div>
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(discountedPrice)}
              </span>{" "}
              {discountPercent > 0 && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
            {/* Stock Status */}
            <p className={`text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </p>
            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Mô tả sản phẩm:</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}{" "}
            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
            )}
            {/* Actions */}
            <div className="space-y-3 pt-4">
              {" "}
              <AddToCartButton
                item={createCartItem()}
                quantity={1}
                className="w-full h-12 text-base"
                disabled={stockStatus.status === "out-of-stock"}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {stockStatus.status === "out-of-stock"
                  ? "Hết hàng"
                  : "Thêm vào giỏ hàng"}
              </AddToCartButton>
              <div className="flex gap-3">
                <WishlistButton
                  product={product}
                  variant="outline"
                  size="default"
                  showText={true}
                  className="flex-1 h-10"
                />

                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => {
                    window.location.href = `/products/${product.slug}`;
                  }}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
