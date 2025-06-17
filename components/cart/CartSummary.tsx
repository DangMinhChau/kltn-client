"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/context/LocalCartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  className?: string;
}

export function CartSummary({
  showCheckoutButton = true,
  className = "",
}: CartSummaryProps) {
  const { items, totalItems, totalAmount } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Số lượng sản phẩm
            </span>
            <span className="text-sm font-medium">{totalItems} sản phẩm</span>
          </div>{" "}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tạm tính</span>
            <span className="text-sm font-medium">
              {formatPrice(totalAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Phí vận chuyển
            </span>
            <span className="text-sm font-medium">Miễn phí</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Tổng cộng</span>{" "}
            <span className="text-base font-semibold">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>{" "}
        {showCheckoutButton && (
          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Tiến hành thanh toán</Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                hoặc{" "}
                <Link
                  href="/products"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Tiếp tục mua sắm
                </Link>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
