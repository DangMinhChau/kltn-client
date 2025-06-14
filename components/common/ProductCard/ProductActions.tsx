import React from "react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/common/WishlistButton";
import { Eye } from "lucide-react";
import { ProductActionsProps } from "./types";
import { cn } from "@/lib/utils";

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  showQuickView = true,
  onQuickView,
  variant = "card",
  className = "",
}) => {
  const isCardView = variant === "card";
  if (isCardView) {
    return (
      <div className={`${className}`}>
        {/* Wishlist Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-20">
          <WishlistButton
            product={product}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-2 border-white/50 hover:border-red-200 shadow-lg backdrop-blur-sm transition-all duration-300"
          />
        </div>
      </div>
    );
  }
  // List view actions
  return (
    <div className={cn("flex gap-3", className)}>
      <WishlistButton
        product={product}
        variant="outline"
        size="default"
        className="h-11 w-11 rounded-xl border-2 hover:bg-red-50 hover:border-red-200 transition-all duration-300"
      />
      {showQuickView && (
        <Button
          onClick={onQuickView}
          variant="default"
          size="default"
          className={cn(
            "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90",
            "text-white px-6 h-11 rounded-xl font-semibold shadow-lg hover:shadow-xl",
            "transition-all duration-300"
          )}
          title={`Xem nhanh ${product.name}`}
          aria-label={`Xem nhanh sản phẩm ${product.name}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          Xem nhanh
        </Button>
      )}
    </div>
  );
};
