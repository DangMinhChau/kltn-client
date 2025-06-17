import React, { useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import { useVariantSelector } from "@/lib/hooks/useVariantSelector";

interface VariantSelectorProps {
  product: Product | null;
  selectedVariant?: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  showImages?: boolean;
  size?: "sm" | "md" | "lg";
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedVariant,
  onVariantChange,
  showImages = true,
  size = "md",
}) => {
  // Memoize the selectedVariant prop to prevent unnecessary re-renders
  const memoizedSelectedVariant = React.useMemo(
    () => selectedVariant,
    [selectedVariant?.id]
  );

  const {
    selectedColor,
    selectedSize,
    availableSizes,
    availableColors,
    setSelectedColor,
    setSelectedSize,
    selectedVariant: currentVariant,
    isValidCombination,
  } = useVariantSelector(product, memoizedSelectedVariant);

  // Use a ref to track if we've already notified about this variant
  const prevVariantIdRef = React.useRef<string | null>(null);

  // Notify parent when variant changes
  useEffect(() => {
    if (currentVariant && isValidCombination) {
      const currentId = currentVariant.id;

      // Only notify if this is a genuinely new variant and different from the one passed in props
      if (
        currentId !== prevVariantIdRef.current &&
        (!selectedVariant || currentId !== selectedVariant.id)
      ) {
        prevVariantIdRef.current = currentId;
        onVariantChange(currentVariant);
      }
    }
  }, [currentVariant, isValidCombination, onVariantChange, selectedVariant]);

  if (!product) {
    return null;
  }

  const variants = product.variants || [];

  const getColorDisplay = (colorName: string) => {
    const variant = variants.find((v) => v.color?.name === colorName);
    return variant?.color;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6 text-xs";
      case "lg":
        return "w-12 h-12 text-lg";
      default:
        return "w-8 h-8 text-sm";
    }
  };

  const getButtonClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-3 text-lg";
      default:
        return "px-3 py-2 text-sm";
    }
  };
  return (
    <div className="space-y-4">
      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Color:{" "}
            {selectedColor && (
              <span className="text-gray-900">{selectedColor}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((colorName: string) => {
              const color = getColorDisplay(colorName);
              const isAvailable = variants.some(
                (v) => v.color?.name === colorName && v.stockQuantity > 0
              );
              const isSelected = selectedColor === colorName;

              return (
                <button
                  key={colorName}
                  onClick={() => setSelectedColor(colorName)}
                  disabled={!isAvailable}
                  className={`
                    ${getSizeClasses()}
                    relative rounded-full border-2 transition-all duration-200
                    ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    ${
                      !isAvailable
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:scale-110"
                    }
                  `}
                  style={{
                    backgroundColor: color?.hexCode || "#gray",
                  }}
                  title={colorName}
                >
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}{" "}
      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Size:{" "}
            {selectedSize && (
              <span className="text-gray-900">{selectedSize}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((sizeName: string) => {
              const isAvailable = availableSizes.includes(sizeName);
              const isSelected = selectedSize === sizeName;

              return (
                <button
                  key={sizeName}
                  onClick={() => setSelectedSize(sizeName)}
                  disabled={!isAvailable}
                  className={`
                    ${getButtonClasses()}
                    border rounded-md transition-all duration-200 font-medium
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }
                    ${
                      !isAvailable
                        ? "opacity-40 cursor-not-allowed line-through"
                        : "cursor-pointer hover:shadow-md"
                    }
                  `}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Selection Status */}
      {(!selectedColor || !selectedSize) && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
          {!selectedColor && !selectedSize
            ? "Vui lòng chọn màu sắc và kích thước"
            : !selectedColor
            ? "Vui lòng chọn màu sắc"
            : "Vui lòng chọn kích thước"}
        </div>
      )}
      {/* Selected Variant Info */}
      {selectedColor && selectedSize && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {(() => {
              const variant = variants.find(
                (v) =>
                  v.color?.name === selectedColor &&
                  v.size?.name === selectedSize
              );
              if (!variant) return "Variant not available";

              return (
                <div className="space-y-1">
                  <div>
                    SKU:{" "}
                    <span className="font-mono text-gray-900">
                      {variant.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Stock:</span>
                    <span
                      className={`font-medium ${
                        variant.stockQuantity > 10
                          ? "text-green-600"
                          : variant.stockQuantity > 0
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {variant.stockQuantity > 0
                        ? `${variant.stockQuantity} available`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
