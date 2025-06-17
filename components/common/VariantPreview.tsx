"use client";

import React, { useState } from "react";
import { ProductVariant } from "@/types";

interface VariantPreviewProps {
  variants: ProductVariant[];
  onVariantHover?: (variant: ProductVariant | null) => void;
  onVariantSelect?: (variant: ProductVariant) => void;
  size?: "sm" | "md";
  showSizes?: boolean;
}

export const VariantPreview: React.FC<VariantPreviewProps> = ({
  variants,
  onVariantHover,
  onVariantSelect,
  size = "sm",
  showSizes = false,
}) => {
  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(
    null
  );
  // Get unique colors and sizes
  const colors = Array.from(
    new Set(variants.map((v) => v.color?.name).filter(Boolean))
  ).filter((name): name is string => Boolean(name));
  const sizes = Array.from(
    new Set(variants.map((v) => v.size?.name).filter(Boolean))
  ).filter((name): name is string => Boolean(name));

  const getColorVariant = (colorName: string) => {
    return variants.find((v) => v.color?.name === colorName);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3";
      default:
        return "w-4 h-4";
    }
  };
  const handleColorHover = (colorName: string | null) => {
    const variant = colorName ? getColorVariant(colorName) : null;
    setHoveredVariant(variant || null);
    onVariantHover?.(variant || null);
  };

  const handleColorClick = (colorName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = getColorVariant(colorName);
    if (variant) {
      onVariantSelect?.(variant);
    }
  };

  return (
    <div className="space-y-2">
      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Màu:</span>
          <div className="flex gap-1">
            {colors.slice(0, 5).map((colorName) => {
              const variant = getColorVariant(colorName);
              const isAvailable = variant && variant.stockQuantity > 0;
              const isHovered = hoveredVariant?.color?.name === colorName;

              return (
                <button
                  key={colorName}
                  onClick={(e) => handleColorClick(colorName, e)}
                  onMouseEnter={() => handleColorHover(colorName)}
                  onMouseLeave={() => handleColorHover(null)}
                  disabled={!isAvailable}
                  className={`
                    ${getSizeClasses()}
                    relative rounded-full border transition-all duration-200
                    ${
                      isHovered
                        ? "border-blue-500 ring-1 ring-blue-200 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    ${
                      !isAvailable
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:scale-105"
                    }
                  `}
                  style={{
                    backgroundColor: variant?.color?.hexCode || "#gray",
                  }}
                  title={`${colorName}${!isAvailable ? " (Hết hàng)" : ""}`}
                >
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}
            {colors.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{colors.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Size Options */}
      {showSizes && sizes.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Size:</span>
          <div className="flex gap-1">
            {sizes.slice(0, 4).map((sizeName) => {
              const hasStock = variants.some(
                (v) => v.size?.name === sizeName && v.stockQuantity > 0
              );

              return (
                <span
                  key={sizeName}
                  className={`
                    text-xs px-1 py-0.5 rounded border
                    ${
                      hasStock
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-50 text-gray-400 border-gray-200 line-through"
                    }
                  `}
                  title={`Size ${sizeName}${!hasStock ? " (Hết hàng)" : ""}`}
                >
                  {sizeName}
                </span>
              );
            })}
            {sizes.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{sizes.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Variant Info Tooltip */}
      {hoveredVariant && (
        <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 mt-2 min-w-[200px]">
          <div className="space-y-1 text-xs">
            <div className="font-medium">{hoveredVariant.color?.name}</div>
            {hoveredVariant.size && <div>Size: {hoveredVariant.size.name}</div>}
            <div>SKU: {hoveredVariant.sku}</div>
            <div
              className={`font-medium ${
                hoveredVariant.stockQuantity > 10
                  ? "text-green-600"
                  : hoveredVariant.stockQuantity > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {hoveredVariant.stockQuantity > 0
                ? `${hoveredVariant.stockQuantity} còn lại`
                : "Hết hàng"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantPreview;
