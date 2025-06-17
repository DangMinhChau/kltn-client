import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Product, ProductVariant } from "@/types";

interface UseVariantSelectorReturn {
  selectedVariant: ProductVariant | undefined;
  selectedColor: string;
  selectedSize: string;
  availableSizes: string[];
  availableColors: string[];
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  setSelectedVariant: (variant: ProductVariant) => void;
  isValidCombination: boolean;
  getCurrentImage: () => string;
  getCurrentStock: () => number;
}

export function useVariantSelector(
  product: Product | null,
  initialVariant?: ProductVariant
): UseVariantSelectorReturn {
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >(initialVariant);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const variants = product?.variants || []; // Get unique colors and sizes - memoized to prevent recreation on every render
  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.color?.name).filter(Boolean))
      ).filter((name): name is string => Boolean(name)),
    [variants]
  );

  const allSizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.size?.name).filter(Boolean))
      ).filter((name): name is string => Boolean(name)),
    [variants]
  );

  // Update available sizes when color changes
  useEffect(() => {
    if (selectedColor) {
      const sizesForColor = variants
        .filter((v) => v.color?.name === selectedColor && v.stockQuantity > 0)
        .map((v) => v.size?.name)
        .filter((name): name is string => Boolean(name));
      setAvailableSizes(sizesForColor);
    } else {
      setAvailableSizes(allSizes);
    }
  }, [selectedColor, variants, allSizes]); // Find and select variant when both color and size are selected
  useEffect(() => {
    if (!selectedColor || !selectedSize) return;

    // Find the matching variant based on current selections
    const targetVariant = variants.find(
      (v) => v.color?.name === selectedColor && v.size?.name === selectedSize
    );

    // Only update if we found a different variant or don't have one selected
    if (
      targetVariant &&
      (!selectedVariant || selectedVariant.id !== targetVariant.id)
    ) {
      setSelectedVariant(targetVariant);
    }
  }, [selectedColor, selectedSize, variants]); // Initialize with provided initial variant only - no auto-selection
  useEffect(() => {
    // Only initialize if we don't have a selected variant
    if (selectedVariant) return;

    if (initialVariant) {
      setSelectedVariant(initialVariant);
      setSelectedColor(initialVariant.color?.name || "");
      setSelectedSize(initialVariant.size?.name || "");
    }
    // Remove auto-selection logic - force user to choose
    // else if (variants.length > 0) {
    //   const firstAvailable =
    //     variants.find((v) => v.stockQuantity > 0) || variants[0];
    //   setSelectedVariant(firstAvailable);
    //   setSelectedColor(firstAvailable.color?.name || "");
    //   setSelectedSize(firstAvailable.size?.name || "");
    // }
  }, [initialVariant, variants, selectedVariant]);
  const getCurrentImage = useCallback(() => {
    // First try to get image from selected variant
    if (selectedVariant?.images?.[0]) {
      const variantImage = selectedVariant.images[0];
      return typeof variantImage === "string"
        ? variantImage
        : variantImage.imageUrl;
    }

    // Then try to get image from product
    if (product?.image) {
      return typeof product.image === "string"
        ? product.image
        : product.image.imageUrl;
    }

    return "";
  }, [selectedVariant, product?.image]);

  const getCurrentStock = useCallback(() => {
    return selectedVariant?.stockQuantity || 0;
  }, [selectedVariant]);

  const isValidCombination = Boolean(
    selectedColor && selectedSize && selectedVariant
  );
  const handleSetSelectedColor = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const handleSetSelectedSize = useCallback((size: string) => {
    setSelectedSize(size);
  }, []);

  const handleSetSelectedVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color?.name || "");
    setSelectedSize(variant.size?.name || "");
  }, []);

  return {
    selectedVariant,
    selectedColor,
    selectedSize,
    availableSizes,
    availableColors,
    setSelectedColor: handleSetSelectedColor,
    setSelectedSize: handleSetSelectedSize,
    setSelectedVariant: handleSetSelectedVariant,
    isValidCombination,
    getCurrentImage,
    getCurrentStock,
  };
}
