import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
    ).filter((name): name is string => Boolean(name));
  }, [product.variants]);

  const uniqueSizes = React.useMemo(() => {
    return Array.from(
      new Set(product.variants?.map((v) => v.size?.name).filter(Boolean) || [])
    ).filter((name): name is string => Boolean(name));
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
            {" "}
            {/* Product Image */}
            <div className="relative">
              <div className="relative w-24 h-32 md:w-28 md:h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={product.image?.imageUrl || "/placeholder-image.jpg"}
                  alt={product.image?.altText || product.name}
                  fill
                  className={`
                    object-cover transition-all duration-700 group-hover:scale-110
                    ${imageLoading ? "blur-sm opacity-0" : "blur-0 opacity-100"}
                  `}
                  onLoad={() => setImageLoading(false)}
                  sizes="(max-width: 768px) 112px, 144px"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100" />
              </div>
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
