import React from "react";
import { Star } from "lucide-react";
import { formatPrice, generateStarRating } from "@/lib/utils";
import { ProductInfoProps } from "./types";

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  actualPrice,
  hasDiscount,
  stockStatus,
  variant = "card",
  className = "",
}) => {
  const isCardView = variant === "card";

  return (
    <div className={`space-y-2 md:space-y-3 ${className}`}>
      {/* Category */}
      <p
        className={`text-xs font-semibold text-primary/70 uppercase tracking-wider ${
          isCardView ? "" : "font-medium"
        }`}
      >
        {product.category?.name}
      </p>
      {/* Product Name */}
      <h3
        className={`
          font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 line-clamp-2
          ${
            isCardView
              ? "text-base lg:text-lg leading-tight"
              : "text-lg md:text-xl leading-tight"
          }
        `}
      >
        {product.name}
      </h3>
      {/* Description - Only in list view */}
      {!isCardView && product.description && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      )}{" "}
      {/* Price */}
      <div className="flex items-center gap-2 md:gap-3">
        <span
          className={`
            font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent
            ${isCardView ? "text-xl lg:text-2xl" : "text-2xl"}
          `}
        >
          {formatPrice(actualPrice)}
        </span>{" "}
        {hasDiscount && (
          <span
            className={`text-gray-400 line-through ${
              isCardView ? "text-sm" : "text-lg"
            }`}
          >
            {formatPrice(
              typeof product.basePrice === "string"
                ? parseFloat(product.basePrice)
                : product.basePrice
            )}
          </span>
        )}
      </div>
      {/* Stock Status */}
      <p className={`text-sm font-semibold ${stockStatus.color}`}>
        {stockStatus.label}
      </p>
    </div>
  );
};
