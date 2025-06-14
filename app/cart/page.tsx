"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { CartState, CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface CartContentProps {
  state: CartState;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  handleQuantityChange: (id: string, newQuantity: number) => void;
}

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <ProtectedRoute>
      <CartContent
        state={state}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        handleQuantityChange={handleQuantityChange}
      />
    </ProtectedRoute>
  );
}

function CartContent({
  state,
  removeItem,
  updateQuantity,
  clearCart,
  handleQuantityChange,
}: CartContentProps) {
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Giỏ hàng trống
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm
              tuyệt vời của chúng tôi!
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <p className="mt-2 text-gray-600">
            Bạn có {state.totalItems} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center">
                <Button variant="outline" asChild>
                  <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={clearCart}>
                  Xóa tất cả
                </Button>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-gray-200">
                {state.items.map((item: CartItem) => (
                  <li key={item.id} className="py-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border sm:h-32 sm:w-32">
                        {" "}
                        <Image
                          src={item.imageUrl || item.image}
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
                            </div>{" "}
                            <p className="mt-1 text-sm text-gray-500">
                              Màu:{" "}
                              {item.color || item.variant?.color?.name || ""}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Size:{" "}
                              {item.size || item.variant?.size?.name || ""}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              SKU: {item.sku || item.variant?.sku || ""}
                            </p>
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
                                onClick={() => removeItem(item.id)}
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
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
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
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng cộng</p>
                            <p className="text-lg font-medium text-gray-900">
                              {formatPrice(
                                (item.discountPrice || item.price) *
                                  item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 lg:col-span-5 lg:mt-0">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Tóm tắt đơn hàng
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Số lượng sản phẩm</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {state.totalItems} sản phẩm
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Tạm tính</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatPrice(state.totalAmount)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Phí vận chuyển</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      Tính khi thanh toán
                    </dd>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">
                      Tổng cộng
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatPrice(state.totalAmount)}
                    </dd>
                  </div>
                </div>
                <div className="mt-6">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Tiến hành thanh toán</Link>
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>
                    hoặc{" "}
                    <Link
                      href="/products"
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      Tiếp tục mua sắm
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                </div>{" "}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
