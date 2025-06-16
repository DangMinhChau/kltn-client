"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/lib/context/UnifiedCartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutDebugPage() {
  const { items, totalAmount, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      cartItems: items,
      itemsCount: items.length,
      totalAmount,
      cartLoading,
      user,
      isAuthenticated,
      localStorage: {
        accessToken:
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null,
        guestCartId:
          typeof window !== "undefined"
            ? localStorage.getItem("guestCartId")
            : null,
      },
      timestamp: new Date().toISOString(),
    });
  }, [items, totalAmount, cartLoading, user, isAuthenticated]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cart Status:</h3>
              <p>Items Count: {items.length}</p>
              <p>Total Amount: {totalAmount}</p>
              <p>Cart Loading: {cartLoading.toString()}</p>
            </div>

            <div>
              <h3 className="font-semibold">Auth Status:</h3>{" "}
              <p>Is Authenticated: {isAuthenticated.toString()}</p>
              <p>User ID: {user?.id || "None"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Cart Items:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Full Debug Info:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="space-x-2">
              <Button onClick={() => (window.location.href = "/checkout")}>
                Go to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/cart")}
              >
                Go to Cart
              </Button>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
