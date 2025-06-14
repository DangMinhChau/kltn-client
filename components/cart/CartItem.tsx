"use client";

import React from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  compact?: boolean;
}

export function CartItem({
  item,
  onRemove,
  onQuantityChange,
  compact = false,
}: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onQuantityChange(item.id, newQuantity);
    }
  };

  if (compact) {
    return (
      <div className="flex gap-3 rounded-lg border p-3">
        {/* Product Image */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium leading-none line-clamp-1">
              {item.name}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span>
                {item.color} • {item.size}
              </span>
            </div>

            <div className="text-right">
              {item.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {formatPrice(item.discountPrice * item.quantity)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-4 py-6">
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border sm:h-32 sm:w-32">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div>
            <div className="flex justify-between">
              <h3 className="text-sm font-medium text-gray-900 sm:text-base">
                {item.name}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">Màu: {item.color}</p>
            <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
            <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
          </div>

          <div className="mt-4 sm:mt-0 sm:pr-9">
            {/* Price */}
            <div className="text-right">
              {item.discountPrice ? (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatPrice(item.discountPrice)}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(item.price)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-medium text-gray-900">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <div className="absolute top-0 right-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng cộng</p>
            <p className="text-lg font-medium text-gray-900">
              {formatPrice((item.discountPrice || item.price) * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
