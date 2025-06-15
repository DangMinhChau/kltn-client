"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { cartApi, cartItemsApi } from "@/lib/api/cart";
import type { CartSummary } from "@/lib/api/cart";
import type { CartItem } from "@/types";
import type {
  CartResponse,
  CartItemResponse,
  MergeGuestCartRequest,
} from "@/types/api-cart";
import { api } from "@/lib/api";

// Conversion utility function to convert CartItemResponse to CartItem
const convertCartItemResponseToCartItem = (
  item: CartItemResponse
): CartItem => {
  const basePrice = item.variant.product.basePrice;
  const discountPercent = item.variant.product.discountPercent || 0;
  const discountPrice =
    discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : basePrice;
  const mainImage =
    item.variant.product.images?.[0]?.url || "/placeholder-image.jpg";

  return {
    id: item.id,
    quantity: item.quantity,
    maxQuantity: item.variant.stockQuantity,
    name: item.variant.product.name,
    price: basePrice,
    discountPrice: discountPrice,
    imageUrl: mainImage,
    image: mainImage,
    slug: item.variant.product.slug,
    variant: {
      id: item.variant.id,
      sku: item.variant.sku,
      stockQuantity: item.variant.stockQuantity,
      isActive: item.variant.isActive,
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        basePrice: item.variant.product.basePrice,
      },
      color: {
        id: item.variant.color.id,
        name: item.variant.color.name,
        code: item.variant.color.hexCode,
        hexCode: item.variant.color.hexCode,
        isActive: true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      size: {
        id: item.variant.size.id,
        name: item.variant.size.name,
        isActive: true,
        category: {
          id: "default",
          name: "Default Category",
          slug: "default",
          isActive: true,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
    color: item.variant.color.name,
    size: item.variant.size.name,
    sku: item.variant.sku,
  };
};

interface UnifiedCartContextType {
  // Cart state
  cart: CartResponse | null;
  items: CartItem[];
  loading: boolean;
  error: string | null;

  // Cart actions
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Cart UI state
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed values
  totalItems: number;
  totalAmount: number;
}

const UnifiedCartContext = createContext<UnifiedCartContextType | undefined>(
  undefined
);

export function UnifiedCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();

  // Shared state
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load local cart from localStorage
  const loadLocalCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        setLocalItems(cartItems);
      }
    } catch (error) {
      console.error("Error loading local cart:", error);
    }
  }, []);

  // Save local cart to localStorage
  const saveLocalCart = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      setLocalItems(items);
    } catch (error) {
      console.error("Error saving local cart:", error);
    }
  }, []);

  // Fetch API cart for authenticated users
  const fetchApiCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const apiCart = await cartApi.getMyCart();
      setCart(apiCart);
    } catch (err: any) {
      console.error("Failed to fetch API cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  // Convert variant data to CartItem for local storage
  const createLocalCartItem = async (
    variantId: string,
    quantity: number
  ): Promise<CartItem> => {
    try {
      // Get variant data from public API
      const variantResponse = await api.get(`/variants/${variantId}`);
      const variantData = variantResponse.data.data;

      return {
        id: `local-${variantId}`,
        quantity,
        maxQuantity: variantData.stockQuantity || 100,
        name: variantData.product.name,
        price: variantData.product.basePrice || 0,
        discountPrice: variantData.product.discountPercent
          ? (variantData.product.basePrice || 0) *
            (1 - variantData.product.discountPercent / 100)
          : undefined,
        imageUrl: variantData.product.images?.[0] || "",
        image: variantData.product.images?.[0] || "",
        slug: variantData.product.slug || "",
        variant: variantData,
        color: variantData.color?.name || "",
        size: variantData.size?.name || "",
        sku: variantData.sku || "",
      };
    } catch (err) {
      console.error("Failed to fetch variant data for local cart:", err);
      throw new Error("Could not fetch product details");
    }
  };
  // Merge local cart to API cart when user logs in
  const mergeLocalToApiCart = useCallback(async () => {
    if (!isAuthenticated || localItems.length === 0) return;

    try {
      setLoading(true);

      // Convert local items to merge format
      const guestCartItems = localItems.map((item) => ({
        variantId: item.variant.id,
        quantity: item.quantity,
      })); // Merge with API
      const request: MergeGuestCartRequest = { items: guestCartItems };
      await cartApi.mergeGuestCart(request);

      // Clear local cart after successful merge
      localStorage.removeItem("cart");
      setLocalItems([]);

      // Fetch updated API cart
      await fetchApiCart();
    } catch (err: any) {
      console.error("Failed to merge local cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, localItems]); // Removed fetchApiCart from dependencies

  // Handle logout - optionally preserve cart items in localStorage
  const handleLogout = useCallback(async () => {
    if (cart && cart.items.length > 0) {
      // Convert API cart items to local format before logout
      const localCartItems: CartItem[] = cart.items.map(
        convertCartItemResponseToCartItem
      );
      saveLocalCart(localCartItems);
    }

    setCart(null);
  }, [cart, saveLocalCart]); // Initialize cart based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      // User is logged in - fetch API cart
      fetchApiCart();

      // If has local items, merge them
      if (localItems.length > 0) {
        mergeLocalToApiCart();
      }
    } else {
      // Guest user - load local cart
      loadLocalCart();
      setCart(null); // Clear API cart
    }
  }, [isAuthenticated]); // Simplified dependencies

  // Separate effect to handle initial local cart loading
  useEffect(() => {
    if (!isAuthenticated) {
      loadLocalCart();
    }
  }, []); // Run only once on mount
  // Watch for auth changes to trigger merge or logout
  const [prevAuth, setPrevAuth] = useState(isAuthenticated);
  useEffect(() => {
    if (prevAuth !== isAuthenticated) {
      if (isAuthenticated && localItems.length > 0) {
        // User just logged in with local items
        mergeLocalToApiCart();
      } else if (!isAuthenticated && prevAuth) {
        // User just logged out
        handleLogout();
      }
      setPrevAuth(isAuthenticated);
    }
  }, [isAuthenticated, prevAuth]); // Removed localItems, mergeLocalToApiCart, handleLogout
  // Add item to cart
  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
          // Add to API cart
          await cartItemsApi.addToCart({ variantId, quantity });
          await fetchApiCart();
        } else {
          // Add to local cart
          const updatedItems = [...localItems];
          const existingIndex = updatedItems.findIndex(
            (item) => item.variant.id === variantId
          );

          if (existingIndex >= 0) {
            updatedItems[existingIndex].quantity += quantity;
          } else {
            const newItem = await createLocalCartItem(variantId, quantity);
            updatedItems.push(newItem);
          }

          saveLocalCart(updatedItems);
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, localItems] // Removed fetchApiCart and saveLocalCart dependencies
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      try {
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
          // Update API cart
          const cartItem = cart?.items.find(
            (item) => item.variant.id === variantId
          );
          if (cartItem) {
            if (quantity <= 0) {
              await cartItemsApi.removeByVariant(variantId);
            } else {
              await cartItemsApi.updateQuantity(cartItem.id, { quantity });
            }
            await fetchApiCart();
          }
        } else {
          // Update local cart
          const updatedItems = localItems
            .map((item) =>
              item.variant.id === variantId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0);

          saveLocalCart(updatedItems);
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, cart, localItems] // Removed fetchApiCart and saveLocalCart dependencies
  );

  // Remove item
  const removeItem = useCallback(
    async (variantId: string) => {
      try {
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
          // Remove from API cart
          await cartItemsApi.removeByVariant(variantId);
          await fetchApiCart();
        } else {
          // Remove from local cart
          const updatedItems = localItems.filter(
            (item) => item.variant.id !== variantId
          );
          saveLocalCart(updatedItems);
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, localItems] // Removed fetchApiCart and saveLocalCart dependencies
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Clear API cart
        await cartApi.clearMyCart();
        await fetchApiCart();
      } else {
        // Clear local cart
        localStorage.removeItem("cart");
        setLocalItems([]);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]); // Removed fetchApiCart dependency

  // Cart UI actions
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);
  // Computed values
  const items = isAuthenticated
    ? cart?.items.map(convertCartItemResponseToCartItem) || []
    : localItems;
  const totalItems = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );
  const totalAmount = items.reduce((sum: number, item: CartItem) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const value: UnifiedCartContextType = {
    cart,
    items,
    loading,
    error,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    totalItems,
    totalAmount,
  };

  return (
    <UnifiedCartContext.Provider value={value}>
      {children}
    </UnifiedCartContext.Provider>
  );
}

export function useUnifiedCart() {
  const context = useContext(UnifiedCartContext);
  if (!context) {
    throw new Error("useUnifiedCart must be used within UnifiedCartProvider");
  }
  return context;
}

// Backward compatibility export
export { useUnifiedCart as useCart };
