"use client";

import React from "react";
import { CartSheet, CartButton } from "@/components/cart/CartSheet";

export function Cart() {
  return (
    <>
      <CartButton />
      <CartSheet />
    </>
  );
}

export { CartButton, CartSheet };
