"use client";

import React, { useState } from "react";
import { ProductCardList } from "./ProductCardList";
import { ProductCardGrid } from "./ProductCardGrid";
import QuickViewModal from "@/components/common/QuickViewModal";
import { ProductCardProps } from "./types";
import { calculateDiscountedPrice, getStockStatus } from "@/lib/utils";

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showQuickView = true,
  showVariantSelector = false,
  className = "",
  variant = "card",
}) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Memoize expensive calculations
  const actualPrice = React.useMemo(() => {
    // Calculate actual price from basePrice and discountPercent
    const discountValue = product.discountPercent || 0;
    return product.basePrice * (1 - discountValue / 100);
  }, [product.basePrice, product.discountPercent]);

  const hasDiscount = React.useMemo(() => {
    return Boolean(product.discountPercent && product.discountPercent > 0);
  }, [product.discountPercent]);

  const currentStock = React.useMemo(() => {
    return product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
  }, [product.variants]);

  const stockStatus = React.useMemo(
    () => getStockStatus(currentStock),
    [currentStock]
  );

  const handleQuickView = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }, []);
  // Enhanced props to pass to child components
  const enhancedProps = {
    ...{
      product,
      showQuickView,
      showVariantSelector,
      className,
      variant,
    },
    actualPrice,
    hasDiscount,
    stockStatus,
    onQuickView: handleQuickView,
  };

  return (
    <>
      {variant === "list" ? (
        <ProductCardList {...enhancedProps} />
      ) : (
        <ProductCardGrid {...enhancedProps} />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
