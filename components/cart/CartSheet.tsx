"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/context/UnifiedCartContext";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const {
    items,
    totalItems,
    totalAmount,
    removeItem,
    updateItemQuantity,
    clearCart,
    closeCart,
    isCartOpen,
    loading,
    error,
  } = useCart();

  // Debug logging
  React.useEffect(() => {
    console.log("CartSheet - items:", items);
    console.log("CartSheet - totalItems:", totalItems);
    console.log("CartSheet - totalAmount:", totalAmount);
  }, [items, totalItems, totalAmount]);

  const handleQuantityChange = async (
    variantId: string,
    newQuantity: number
  ) => {
    try {
      if (newQuantity <= 0) {
        await removeItem(variantId);
      } else {
        await updateItemQuantity(variantId, newQuantity);
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  if (items.length === 0) {
    return (
      <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Giỏ hàng
              <Badge variant="secondary">0</Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Giỏ hàng trống</h3>
              <p className="text-sm text-muted-foreground">
                Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/products" onClick={closeCart}>
                Khám phá sản phẩm
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Giỏ hàng
            <Badge variant="secondary">{totalItems}</Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                {" "}
                {/* Product Image */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={
                      item.imageUrl || item.image || "/placeholder-image.jpg"
                    }
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                {/* Product Details */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium leading-none">
                      {item.name}
                    </h4>{" "}                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        try {
                          await removeItem(item.variant.id);
                        } catch (error) {
                          console.error("Failed to remove item:", error);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>{" "}
                  <div className="text-xs text-muted-foreground">
                    <p>Màu: {item.color || item.variant?.color?.name || ""}</p>
                    <p>Size: {item.size || item.variant?.size?.name || ""}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {" "}
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(
                            item.variant.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1 || loading}
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="min-w-[2rem] text-center text-sm">
                        {item.quantity}
                      </span>                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleQuantityChange(
                            item.variant.id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.maxQuantity || loading}
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    </div>{" "}
                    {/* Price */}
                    <div className="text-right">
                      {item.discountPrice && item.discountPrice > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatPrice(
                              (item.discountPrice || 0) * item.quantity
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice((item.price || 0) * item.quantity)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">
                          {formatPrice((item.price || 0) * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Footer */}
        <div className="space-y-4 border-t pt-4">
          {" "}
          {/* Clear Cart */}          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await clearCart();
              } catch (error) {
                console.error("Failed to clear cart:", error);
              }
            }}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa tất cả"
            )}
          </Button>
          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-base font-medium">
              <span>Tổng cộng</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Phí vận chuyển sẽ được tính khi thanh toán
            </p>
          </div>{" "}
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Link href="/cart" onClick={closeCart}>
                Xem giỏ hàng
              </Link>
            </Button>
            <Button asChild className="flex-1" disabled={loading}>
              <Link href="/checkout" onClick={closeCart}>
                Thanh toán
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
      <ShoppingBag className="h-5 w-5" />{" "}
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}
