import React from "react";
import Image from "next/image";
import { ProductImageProps } from "./types";

export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  imageLoading,
  onImageLoad,
  variant = "card",
  className = "",
}) => {
  const isCardView = variant === "card";

  // Get image URL with proper fallback logic
  const getImageUrl = () => {
    // First try variant images (most specific)
    const firstVariantWithImages = product.variants?.find(
      (v) => v.images && v.images.length > 0
    );
    if (firstVariantWithImages?.images?.[0]?.imageUrl) {
      return firstVariantWithImages.images[0].imageUrl;
    }

    // Then try product main image
    if (product.image?.imageUrl) {
      return product.image.imageUrl;
    }

    // Finally fallback to placeholder
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80";
  };

  const getAltText = () => {
    // Try variant image alt text first
    const firstVariantWithImages = product.variants?.find(
      (v) => v.images && v.images.length > 0
    );
    if (firstVariantWithImages?.images?.[0]?.altText) {
      return firstVariantWithImages.images[0].altText;
    }

    // Then try product main image alt text
    if (product.image?.altText) {
      return product.image.altText;
    }

    // Finally fallback to product name
    return product.name;
  };

  // Debug log
  console.log("ProductImage Debug for:", product.name);
  console.log("- Image URL:", getImageUrl());
  console.log("- Product image:", product.image);
  console.log(
    "- Variants with images:",
    product.variants?.filter((v) => v.images && v.images.length > 0)
  );
  return (
    <div
      className={`
        relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200
        ${
          isCardView
            ? "aspect-[3/4] rounded-t-lg"
            : "w-24 h-32 md:w-28 md:h-36 flex-shrink-0 rounded-2xl"
        }
        ${className}
      `}
    >
      {" "}
      <Image
        src={getImageUrl()}
        alt={getAltText()}
        fill
        className={`
          object-cover transition-all duration-700 group-hover:scale-110
          ${imageLoading ? "blur-sm opacity-0" : "blur-0 opacity-100"}
        `}
        onLoad={onImageLoad}
        sizes={
          isCardView
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            : "(max-width: 768px) 112px, 144px"
        }
      />
      {/* Gradient Overlay */}
      <div
        className={`
          absolute inset-0 transition-opacity duration-300
          ${
            isCardView
              ? "bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100"
              : "bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
          }
        `}
      />
    </div>
  );
};
