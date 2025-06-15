"use client";

import React from "react";
import { useUnifiedCart } from "@/lib/context/UnifiedCartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default function UnifiedCartTestPage() {
  const {
    items,
    loading,
    error,
    totalItems,
    totalAmount,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useUnifiedCart();

  const { isAuthenticated, user } = useAuth();

  const handleAddTestItem = async () => {
    try {
      // This would be a real variant ID from your database
      await addToCart("test-variant-id", 1);
    } catch (err) {
      console.error("Failed to add test item:", err);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Unified Cart Test</h1>
        <div className="flex items-center gap-4">
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? `Logged in: ${user?.fullName}` : "Guest"}
          </Badge>
          <Badge variant="outline">
            {totalItems} items - {formatPrice(totalAmount)}
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cart Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleAddTestItem}
              disabled={loading}
              className="w-full"
            >
              Add Test Item
            </Button>
            <Button
              onClick={clearCart}
              variant="destructive"
              disabled={loading || totalItems === 0}
              className="w-full"
            >
              Clear Cart
            </Button>
          </CardContent>
        </Card>

        {/* Cart Status */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Mode:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "API Cart" : "Local Cart"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <Badge variant={loading ? "destructive" : "secondary"}>
                {loading ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Cart is empty
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.color} • {item.size} • SKU: {item.sku}
                    </p>
                    <p className="text-sm font-medium">
                      {formatPrice(item.discountPrice || item.price)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateItemQuantity(item.variant.id, item.quantity - 1)
                      }
                      disabled={loading}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateItemQuantity(item.variant.id, item.quantity + 1)
                      }
                      disabled={loading}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem(item.variant.id)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <details className="space-y-2">
            <summary className="cursor-pointer font-medium">
              View Raw Cart Data
            </summary>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(
                { items, totalItems, totalAmount, isAuthenticated },
                null,
                2
              )}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
