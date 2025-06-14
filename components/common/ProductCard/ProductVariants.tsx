import React from "react";
import { ProductVariantsProps } from "./types";

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  uniqueColors,
  uniqueSizes,
  product,
  maxDisplay = 4,
  className = "",
}) => {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 pt-2 ${className}`}>
      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Màu:</span>
          <div className="flex gap-1.5">
            {uniqueColors.slice(0, maxDisplay).map((colorName) => {
              const variant = product.variants?.find(
                (v) => v.color?.name === colorName
              );
              return (
                <div
                  key={colorName}
                  className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200 hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: variant?.color?.hexCode || "#gray",
                  }}
                  title={colorName}
                />
              );
            })}
            {uniqueColors.length > maxDisplay && (
              <span className="text-xs text-gray-500 font-medium self-center">
                +{uniqueColors.length - maxDisplay}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sizes */}
      {uniqueSizes.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Size:</span>
          <div className="flex gap-1 flex-wrap">
            {uniqueSizes.slice(0, maxDisplay).map((sizeName) => (
              <span
                key={sizeName}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md border text-gray-700 font-medium transition-colors cursor-pointer"
                title={sizeName}
              >
                {sizeName}
              </span>
            ))}
            {uniqueSizes.length > maxDisplay && (
              <span className="text-xs text-gray-500 font-medium self-center">
                +{uniqueSizes.length - maxDisplay}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
