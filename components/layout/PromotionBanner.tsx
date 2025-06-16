"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Flame, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PromotionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const isDismissed = localStorage.getItem("promotion-banner-dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("promotion-banner-dismissed", "true");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 transition-all duration-300 overflow-hidden",
        isClosing && "transform -translate-y-full opacity-0"
      )}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-orange-600/50 animate-pulse"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Flame className="h-4 w-4 animate-bounce text-yellow-300" />

          <span className="font-medium">
            🔥 <strong>FLASH SALE</strong> - Giảm đến <strong>70%</strong> toàn
            bộ sản phẩm thời trang nam!
          </span>

          <Badge
            variant="secondary"
            className="bg-yellow-400 text-red-600 font-semibold px-2 py-1 animate-pulse"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            HOT
          </Badge>

          <Link
            href="/products/sale"
            className="font-semibold underline hover:text-yellow-200 transition-colors"
          >
            Mua ngay!
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="ml-auto p-1 h-6 w-6 text-white hover:bg-white/20 rounded-full"
            aria-label="Đóng banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-8 h-8 bg-yellow-300/20 rounded-full animate-ping"></div>
      <div className="absolute bottom-0 right-1/3 w-6 h-6 bg-orange-300/20 rounded-full animate-ping delay-1000"></div>
    </div>
  );
}
