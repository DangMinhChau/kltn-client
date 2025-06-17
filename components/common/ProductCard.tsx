"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, Image as ImageType } from "@/types";
import QuickViewModal from "@/components/common/QuickViewModal";
import { Star, Eye } from "lucide-react";

// Helper function to get image URL from Image
const getImageUrl = (image: ImageType | undefined): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  return image.imageUrl;
};

// Helper function to parse price safely
const parsePrice = (price: number | string): number => {
  if (typeof price === "number") return price;
  return parseFloat(price) || 0;
};

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  className?: string;
  variant?: "card" | "list";
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showQuickView = false,
  className = "",
  variant = "card",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Calculate discounted price
  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const basePrice = parsePrice(product.basePrice);
  const discountedPrice = hasDiscount
    ? basePrice * (1 - (product.discountPercent || 0) / 100)
    : basePrice;

  // Get product images - prioritize variant images first
  const firstVariantWithImages = product.variants?.find(
    (v) => v.images && v.images.length > 0
  );
  const variantImage = getImageUrl(firstVariantWithImages?.images?.[0]);
  const productMainImage = getImageUrl(product.image);
  const mainImage =
    variantImage || productMainImage || "/placeholder-image.jpg";
  const hoverImage =
    getImageUrl(firstVariantWithImages?.images?.[1]) || productMainImage;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden border-0 bg-white/80 backdrop-blur-sm rounded-none ${className}`}
    >
      <Link href={`/products/${product.slug}`}>
        <CardContent className="p-0">
          {" "}
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
            {" "}
            {/* Main Image */}
            <img
              src={mainImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.jpg";
              }}
            />{" "}
            {/* Hover Image */}
            {hoverImage && hoverImage !== mainImage && (
              <img
                src={hoverImage}
                alt={`${product.name} hover`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Badges */}{" "}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {" "}
              {hasDiscount && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                  -{product.discountPercent}%
                </Badge>
              )}
              {product.variants?.[0]?.stockQuantity === 0 && (
                <Badge className="bg-gray-500 text-white text-xs px-2 py-1">
                  Hết hàng
                </Badge>
              )}
            </div>{" "}
            {/* Action Buttons */}{" "}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            </div>{" "}
            {/* Quick View Button */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                size="sm"
                className="w-full bg-black/80 hover:bg-black text-white"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>
          {/* Product Info */}
          <div className="p-4 space-y-2">
            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {product.category?.name}
              </span>{" "}
              {product.averageRating && product.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {product.averageRating.toFixed(1)} (
                    {product.totalReviews || 0})
                  </span>
                </div>
              )}
            </div>
            {/* Product Name */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>{" "}
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">
                {discountedPrice.toLocaleString("vi-VN")}₫
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {basePrice.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>
            {/* Colors Available */}
            {product.variants && product.variants.length > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Màu:</span>
                <div className="flex gap-1">
                  {product.variants.slice(0, 4).map((variant, index) => (
                    <div
                      key={variant.id}
                      className="h-3 w-3 rounded-full border border-gray-200"
                      style={{
                        backgroundColor: variant.color?.hexCode || "#gray",
                      }}
                      title={variant.color?.name}
                    />
                  ))}
                  {product.variants.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{product.variants.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Sizes Available */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Size:</span>
                <div className="flex gap-1">
                  {Array.from(
                    new Set(product.variants.map((v) => v.size?.name))
                  )
                    .slice(0, 3)
                    .map((sizeName, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 px-1 rounded"
                      >
                        {sizeName}
                      </span>
                    ))}
                  {Array.from(
                    new Set(product.variants.map((v) => v.size?.name))
                  ).length > 3 && (
                    <span className="text-xs text-muted-foreground">...</span>
                  )}
                </div>
              </div>
            )}{" "}
          </div>
        </CardContent>
      </Link>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </Card>
  );
};

export default ProductCard;
