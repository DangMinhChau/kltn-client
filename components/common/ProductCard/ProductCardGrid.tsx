import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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

export const ProductCardGrid: React.FC<EnhancedProductCardProps> = ({
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
        "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 overflow-hidden rounded-xl",
        "border-0 bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur-sm",
        className
      )}
    >
      <Link href={generateProductUrl(product.slug)}>
        <CardContent className="p-0">
          {" "}
          {/* Image Container */}
          <div className="relative overflow-hidden rounded-t-xl">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={product.image?.imageUrl || "/placeholder-image.jpg"}
                alt={product.image?.altText || product.name}
                fill
                className={`
                  object-cover transition-all duration-700 group-hover:scale-110
                  ${imageLoading ? "blur-sm opacity-0" : "blur-0 opacity-100"}
                `}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100" />
            </div>
            {/* Badges positioned on image */}
            <ProductBadges
              product={product}
              stockStatus={stockStatus}
              className="absolute top-3 left-3 z-10"
            />
            {/* Wishlist and Quick View Actions */}
            <div className="absolute top-3 right-3 z-10">
              <ProductActions
                product={product}
                showQuickView={showQuickView}
                onQuickView={onQuickView}
                variant="card"
              />
            </div>{" "}
            {/* Quick View Button at bottom */}
            {showQuickView && (
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-10">
                <Button
                  onClick={onQuickView}
                  variant="secondary"
                  className="w-full bg-white/95 hover:bg-white text-gray-900 shadow-xl text-sm h-11 rounded-xl font-semibold border-2 border-white/50 hover:border-primary/20 backdrop-blur-sm transition-all duration-300"
                  title={`Xem nhanh ${product.name}`}
                  aria-label={`Xem nhanh sản phẩm ${product.name}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem nhanh
                </Button>
              </div>
            )}
          </div>
          {/* Product Info */}
          <div className="p-4 lg:p-5 space-y-3">
            {" "}
            <ProductInfo
              product={product}
              actualPrice={actualPrice}
              hasDiscount={hasDiscount}
              stockStatus={stockStatus}
              variant="card"
            />
            {/* Product Variants */}
            {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
              <ProductVariants
                uniqueColors={uniqueColors}
                uniqueSizes={uniqueSizes}
                product={product}
                maxDisplay={4}
                className="pt-2"
              />
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
