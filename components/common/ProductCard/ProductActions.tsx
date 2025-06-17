import React from "react";
import { Button } from "@/components/ui/button";
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
    // For card view, we don't show any actions since wishlist is removed
    // Quick view is typically handled by clicking the product card itself
    return null;
  }

  // List view actions - only quick view if enabled
  if (!showQuickView || !onQuickView) {
    return null;
  }

  return (
    <div className={cn("flex gap-3", className)}>
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
    </div>
  );
};
