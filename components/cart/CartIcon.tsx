"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartIconProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function CartIcon({
  variant = "ghost",
  size = "default",
  className,
  showLabel = false,
}: CartIconProps) {
  const { totalItems, openCart } = useCart();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("relative", className)}
      onClick={openCart}
    >
      <ShoppingBag className="h-5 w-5" />
      {showLabel && <span className="ml-2">Giỏ hàng</span>}{" "}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-2 -top-2"
          >
            <Badge
              variant="destructive"
              className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
