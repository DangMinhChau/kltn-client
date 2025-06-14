import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { ProductBadgesProps } from "./types";
import { cn } from "@/lib/utils";

export const ProductBadges: React.FC<ProductBadgesProps> = ({
  product,
  stockStatus,
  className = "",
}) => {
  const hasDiscount = product.discount && product.discount > 0;
  const discountPercent = hasDiscount
    ? Math.round((product.discount || 0) * 100)
    : 0;

  return (
    <div className={cn("flex flex-col gap-1.5 z-10", className)}>
      {/* Featured Badge - check if product has 'featured' tag */}
      {product.tags?.some((tag) => tag.slug === "featured") && (
        <Badge
          variant="secondary"
          className={cn(
            "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
            "text-xs font-semibold px-2 py-1 shadow-lg backdrop-blur-sm border-0"
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Nổi bật
        </Badge>
      )}

      {hasDiscount && (
        <Badge
          variant="destructive"
          className={cn(
            "bg-gradient-to-r from-red-500 to-pink-600 text-white",
            "text-xs font-bold px-2 py-1 shadow-lg backdrop-blur-sm border-0"
          )}
        >
          -{discountPercent}%
        </Badge>
      )}

      {stockStatus.status === "out-of-stock" && (
        <Badge
          variant="outline"
          className={cn(
            "bg-gray-900/80 text-white text-xs px-2 py-1 backdrop-blur-sm",
            "border-gray-700"
          )}
        >
          Hết hàng
        </Badge>
      )}
    </div>
  );
};
