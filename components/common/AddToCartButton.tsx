"use client";

import React, { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/context/LocalCartContext";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  item,
  quantity = 1,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  children,
}: AddToCartButtonProps) {
  const { addToCart, openCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Auto-disable if no variant is selected
  const isDisabled = disabled || !item.variant || !item.variant.id;
  const handleAddToCart = async () => {
    if (isDisabled) return;

    // Check if variant exists and is valid
    if (!item.variant || !item.variant.id) {
      console.error("Cannot add to cart: No variant selected");
      toast.error(
        "Vui lòng chọn phiên bản sản phẩm (màu sắc, kích thước) trước khi thêm vào giỏ hàng"
      );
      return;
    }

    try {
      await addToCart(item.variant.id, quantity);
      setIsAdded(true);

      // Show success state for 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

      // Open cart after a short delay
      setTimeout(() => {
        openCart();
      }, 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200",
        isAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
      onClick={handleAddToCart}
      disabled={isDisabled}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Đã thêm
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {!item.variant || !item.variant.id
            ? "Chọn phiên bản"
            : children || "Thêm vào giỏ"}
        </>
      )}
    </Button>
  );
}
