import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "./ProductImage";
import { ProductBadges } from "./ProductBadges";
import { ProductInfo } from "./ProductInfo";
import { ProductVariants } from "./ProductVariants";
import { ProductActions } from "./ProductActions";
import { ProductCardProps } from "./types";
import { generateProductUrl, cn } from "@/lib/utils";

interface EnhancedProductCardProps extends ProductCardProps {
  actualPrice: number;
  hasDiscount: boolean;
  stockStatus: {
    status: string;
    label: string;
    color: string;
  };
  onQuickView: (e: React.MouseEvent) => void;
}

export const ProductCardList: React.FC<EnhancedProductCardProps> = ({
  product,
  showQuickView = true,
  className = "",
  actualPrice,
  hasDiscount,
  stockStatus,
  onQuickView,
  ...props
}) => {
  const [imageLoading, setImageLoading] = React.useState(true);

  // Memoize unique variants
  const uniqueColors = React.useMemo(() => {
    return Array.from(
      new Set(product.variants?.map((v) => v.color?.name).filter(Boolean) || [])
    );
  }, [product.variants]);

  const uniqueSizes = React.useMemo(() => {
    return Array.from(
      new Set(product.variants?.map((v) => v.size?.name).filter(Boolean) || [])
    );
  }, [product.variants]);
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-primary/10",
        "border-0 bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-sm",
        className
      )}
    >
      <Link href={generateProductUrl(product.slug)}>
        <CardContent className="p-4 lg:p-6">
          <div className="flex gap-4 lg:gap-6">
            {/* Product Image */}
            <div className="relative">
              <ProductImage
                product={product}
                imageLoading={imageLoading}
                onImageLoad={() => setImageLoading(false)}
                variant="list"
              />
              {/* Badges positioned on image */}
              <ProductBadges
                product={product}
                stockStatus={stockStatus}
                className="absolute top-2 left-2"
              />
            </div>

            {/* Product Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  {" "}
                  {/* Product Info */}{" "}
                  <ProductInfo
                    product={product}
                    actualPrice={actualPrice}
                    hasDiscount={hasDiscount}
                    stockStatus={stockStatus}
                    variant="list"
                  />
                  {/* Product Variants */}
                  {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
                    <ProductVariants
                      uniqueColors={uniqueColors}
                      uniqueSizes={uniqueSizes}
                      product={product}
                      maxDisplay={5}
                    />
                  )}
                </div>{" "}
                {/* Actions */}
                <ProductActions
                  product={product}
                  showQuickView={showQuickView}
                  onQuickView={onQuickView}
                  variant="list"
                  className="flex flex-col items-start lg:items-end gap-4"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Link>{" "}
    </Card>
  );
};
