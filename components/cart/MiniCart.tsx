"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function MiniCart() {
  const { state, removeItem, closeCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (state.items.length === 0) {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ShoppingBag className="h-5 w-5" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold">Giỏ hàng trống</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Thêm sản phẩm để bắt đầu mua sắm
              </p>
              <Button
                asChild
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingBag className="h-5 w-5" />
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
        >
          {state.totalItems}
        </Badge>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Giỏ hàng</h3>
            <Badge variant="secondary">{state.totalItems} sản phẩm</Badge>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto">
            {state.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                  {" "}
                  <Image
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {item.name}
                  </h4>{" "}
                  <p className="text-xs text-muted-foreground">
                    {item.color || item.variant?.color?.name || ""} •{" "}
                    {item.size || item.variant?.size?.name || ""} • x
                    {item.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    {formatPrice(
                      (item.discountPrice || item.price) * item.quantity
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeItem(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {state.items.length > 3 && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              và {state.items.length - 3} sản phẩm khác...
            </p>
          )}

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Tổng cộng:</span>
              <span>{formatPrice(state.totalAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                asChild
                onClick={() => {
                  setIsOpen(false);
                  closeCart();
                }}
              >
                <Link href="/cart">Xem giỏ hàng</Link>
              </Button>
              <Button
                asChild
                onClick={() => {
                  setIsOpen(false);
                  closeCart();
                }}
              >
                <Link href="/checkout">Thanh toán</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
