"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TestCheckoutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Checkout Page</h1>
      <p className="mb-4">
        This is a test page to verify routing is working correctly.
      </p>
      <div className="space-y-4">
        <Button asChild>
          <Link href="/checkout">Go to Real Checkout</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">Go to Cart</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
