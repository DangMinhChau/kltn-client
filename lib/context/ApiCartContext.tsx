"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartApi, cartItemsApi, cartHelpers } from "@/lib/api/cart";
import type {
  Cart,
  CartItem,
  CartSummary,
  CartValidationResult,
} from "@/lib/api/cart";

interface ApiCartContextType {
  // Cart state
  cart: Cart | null;
  cartSummary: CartSummary | null;
  loading: boolean;
  error: string | null;

  // Cart actions
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<CartValidationResult>;

  // Cart summary
  fetchCartSummary: () => Promise<void>;

  // Cart UI state
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Helper functions
  getItemCount: () => number;
  getCartTotal: () => number;
  isItemInCart: (variantId: string) => boolean;
  getItemQuantity: (variantId: string) => number;
}

const ApiCartContext = createContext<ApiCartContextType | undefined>(undefined);

export function ApiCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  }, []);

  // Fetch cart data from API
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart(null);
      setCartSummary(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartApi.getMyCart();
      setCart(cartData);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      setError(err.message || "Failed to fetch cart");
      // If unauthorized, clear cart state
      if (err.response?.status === 401) {
        setCart(null);
        setCartSummary(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart summary
  const fetchCartSummary = useCallback(async () => {
    if (!isAuthenticated()) {
      setCartSummary(null);
      return;
    }

    try {
      const summary = await cartItemsApi.getCartSummary();
      setCartSummary(summary);
    } catch (err: any) {
      console.error("Failed to fetch cart summary:", err);
      setError(err.message || "Failed to fetch cart summary");
    }
  }, [isAuthenticated]);

  // Add item to cart
  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1) => {
      if (!isAuthenticated()) {
        throw new Error("Please login to add items to cart");
      }

      try {
        setLoading(true);
        setError(null);
        await cartItemsApi.addToCart({ variantId, quantity });
        await fetchCart(); // Refresh cart data
      } catch (err: any) {
        console.error("Failed to add item to cart:", err);
        setError(err.response?.data?.message || "Failed to add item to cart");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchCart]
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (!isAuthenticated() || !cart) {
        throw new Error("Cart not available");
      }

      try {
        setLoading(true);
        setError(null);

        // Find the cart item by variant ID
        const cartItem = cart.items.find(
          (item) => item.variant.id === variantId
        );
        if (!cartItem) {
          throw new Error("Item not found in cart");
        }

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          await removeItem(variantId);
        } else {
          // Update quantity
          await cartItemsApi.updateQuantity(cartItem.id, { quantity });
          await fetchCart(); // Refresh cart data
        }
      } catch (err: any) {
        console.error("Failed to update item quantity:", err);
        setError(
          err.response?.data?.message || "Failed to update item quantity"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, cart, fetchCart]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (variantId: string) => {
      if (!isAuthenticated()) {
        throw new Error("Please login to manage cart");
      }

      try {
        setLoading(true);
        setError(null);
        await cartItemsApi.removeByVariant(variantId);
        await fetchCart(); // Refresh cart data
      } catch (err: any) {
        console.error("Failed to remove item from cart:", err);
        setError(
          err.response?.data?.message || "Failed to remove item from cart"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated()) {
      throw new Error("Please login to manage cart");
    }

    try {
      setLoading(true);
      setError(null);
      await cartApi.clearMyCart();
      await fetchCart(); // Refresh cart data
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
      setError(err.response?.data?.message || "Failed to clear cart");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  // Validate cart
  const validateCart = useCallback(async (): Promise<CartValidationResult> => {
    if (!isAuthenticated()) {
      throw new Error("Please login to validate cart");
    }

    try {
      const validation = await cartItemsApi.validateCart();
      return validation;
    } catch (err: any) {
      console.error("Failed to validate cart:", err);
      throw err;
    }
  }, [isAuthenticated]);

  // Cart UI actions
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Helper functions
  const getItemCount = useCallback(() => {
    return cart?.itemCount || 0;
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cartSummary?.total || cart?.subtotal || 0;
  }, [cart, cartSummary]);

  const isItemInCart = useCallback(
    (variantId: string) => {
      return cart?.items.some((item) => item.variant.id === variantId) || false;
    },
    [cart]
  );

  const getItemQuantity = useCallback(
    (variantId: string) => {
      const item = cart?.items.find((item) => item.variant.id === variantId);
      return item?.quantity || 0;
    },
    [cart]
  );

  // Load cart on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
      fetchCartSummary();
    } else {
      setCart(null);
      setCartSummary(null);
    }
  }, [isAuthenticated, fetchCart, fetchCartSummary]);

  // Listen to localStorage changes for auth token
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        if (e.newValue) {
          // User logged in
          fetchCart();
          fetchCartSummary();
        } else {
          // User logged out
          setCart(null);
          setCartSummary(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchCart, fetchCartSummary]);

  const value: ApiCartContextType = {
    cart,
    cartSummary,
    loading,
    error,
    fetchCart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    validateCart,
    fetchCartSummary,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    getItemCount,
    getCartTotal,
    isItemInCart,
    getItemQuantity,
  };

  return (
    <ApiCartContext.Provider value={value}>{children}</ApiCartContext.Provider>
  );
}

export function useApiCart() {
  const context = useContext(ApiCartContext);
  if (context === undefined) {
    throw new Error("useApiCart must be used within an ApiCartProvider");
  }
  return context;
}

// Export both old and new hooks for backward compatibility
export { useCart } from "./CartContext"; // Original local cart hook
export { useApiCart as useServerCart }; // New API-based cart hook
