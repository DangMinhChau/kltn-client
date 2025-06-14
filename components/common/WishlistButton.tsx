import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/context/WishlistContext";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product?: Product;
  variant?:
    | "default"
    | "ghost"
    | "outline"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  variant = "ghost",
  size = "icon",
  className,
  showText = false,
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Return null if product is not provided or doesn't have an id
  if (!product || !product.id) {
    return null;
  }

  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "relative transition-all duration-200",
        inWishlist && "text-red-500 hover:text-red-600",
        !inWishlist && "text-gray-400 hover:text-red-500",
        className
      )}
      title={inWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          inWishlist && "fill-current"
        )}
      />
      {showText && (
        <span className="ml-2">
          {inWishlist ? "Đã yêu thích" : "Yêu thích"}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;
