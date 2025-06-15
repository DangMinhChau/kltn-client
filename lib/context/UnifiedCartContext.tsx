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
): CartItem | null => {
  console.log("Raw cart item data:", item);
  console.log("Variant data:", item.variant);
  console.log("Product data:", item.variant?.product);

  // Check if variant data exists, if not, skip this item or fetch it separately
  if (!item.variant) {
    console.error("Cart item missing variant data:", item);
    return null; // Return null for invalid items
  }

  // Safely extract product data with fallbacks
  const product = item.variant?.product;
  const basePrice = product?.basePrice || 0;
  const discountPercent = product?.discountPercent || 0;
  const productName = product?.name || "Unknown Product";
  const productSlug = product?.slug || "";

  const discountPrice =
    discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : undefined;
  // Get images from product first, then variant, then fallback
  const productImages = product?.images || [];
  const variantImages = item.variant?.images || [];
  console.log("Image data:", {
    productImages,
    variantImages,
    productImagesLength: productImages.length,
    variantImagesLength: variantImages.length,
    firstProductImageUrl:
      (productImages[0] as any)?.url || (productImages[0] as any)?.imageUrl,
    firstVariantImageUrl:
      (variantImages[0] as any)?.url || (variantImages[0] as any)?.imageUrl,
  });

  // Fixed: Use correct field names for images - prioritize variant images
  const mainImage =
    (variantImages[0] as any)?.imageUrl || // Variant images (most specific)
    (variantImages[0] as any)?.url || // Alternative field name
    (productImages[0] as any)?.imageUrl || // Product images
    (productImages[0] as any)?.url || // Alternative field name
    "/placeholder-image.jpg";

  console.log("Converting cart item:", {
    itemId: item.id,
    basePrice,
    discountPercent,
    discountPrice,
    productName,
    mainImage,
    hasProduct: !!product,
    hasVariant: !!item.variant,
  });
  return {
    id: item.id,
    quantity: item.quantity,
    maxQuantity: item.variant?.stockQuantity || 0,
    name: productName,
    price: basePrice,
    discountPrice: discountPrice,
    imageUrl: mainImage,
    image: mainImage,
    slug: productSlug,
    variant: {
      id: item.variant?.id || "",
      sku: item.variant?.sku || "",
      stockQuantity: item.variant?.stockQuantity || 0,
      isActive: item.variant?.isActive || false,
      product: {
        id: product?.id || "",
        name: productName,
        basePrice: basePrice,
      },
      color: {
        id: item.variant?.color?.id || "",
        name: item.variant?.color?.name || "Unknown Color",
        code: item.variant?.color?.hexCode || "#000000",
        hexCode: item.variant?.color?.hexCode || "#000000",
        isActive: true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
      size: {
        id: item.variant?.size?.id || "",
        name: item.variant?.size?.name || "Unknown Size",
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
    color: item.variant?.color?.name || "Unknown Color",
    size: item.variant?.size?.name || "Unknown Size",
    sku: item.variant?.sku || "",
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
      console.log("Loading local cart from localStorage:", savedCart);

      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        console.log("Parsed local cart items:", cartItems);
        setLocalItems(cartItems);
      } else {
        console.log("No saved cart found in localStorage");
        setLocalItems([]);
      }
    } catch (error) {
      console.error("Error loading local cart:", error);
      setLocalItems([]);
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
      console.log("=== FETCH API CART DEBUG ===");
      console.log("API cart response:", apiCart);
      console.log("API cart items:", apiCart.items);
      if (apiCart.items && apiCart.items.length > 0) {
        console.log("First API cart item:", apiCart.items[0]);
        console.log("First item has variant?", !!apiCart.items[0].variant);
        if (apiCart.items[0].variant) {
          console.log("Variant data:", apiCart.items[0].variant);
          console.log("Variant product:", apiCart.items[0].variant.product);
        }
      }
      console.log("=== END FETCH API CART DEBUG ===");
      setCart(apiCart);
    } catch (err: any) {
      console.error("Failed to fetch API cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]); // Convert variant data to CartItem for local storage
  const createLocalCartItem = async (
    variantId: string,
    quantity: number
  ): Promise<CartItem> => {
    try {
      // Get variant data from public API
      console.log(`Fetching variant data for: ${variantId}`);
      const variantResponse = await api.get(`/variants/${variantId}`);
      console.log("Raw variant response:", variantResponse);

      const variantData = variantResponse.data?.data || variantResponse.data;
      console.log("createLocalCartItem - variantData:", variantData);

      if (!variantData) {
        throw new Error("No variant data received from API");
      }

      // Check if we have product data
      if (!variantData.product) {
        console.error("No product data in variant:", variantData);
        throw new Error("Variant does not contain product data");
      }

      const basePrice = variantData.product.basePrice || 0;
      const discountPercent = variantData.product.discountPercent || 0;
      const discountPrice =
        discountPercent > 0
          ? basePrice * (1 - discountPercent / 100)
          : undefined; // Debug image data
      console.log("=== IMAGE DEBUG ===");
      console.log("variantData.product.images:", variantData.product.images);
      console.log(
        "variantData.product.mainImageUrl:",
        variantData.product.mainImageUrl
      );
      console.log("variantData.images:", variantData.images);
      console.log("variantData.image:", variantData.image);

      // Fixed image extraction logic - prioritize variant images since they're more specific
      const imageUrl =
        variantData.images?.[0]?.imageUrl || // Variant images (most specific)
        variantData.images?.[0]?.url || // Alternative field name
        variantData.product.images?.[0]?.imageUrl || // Product images
        variantData.product.images?.[0]?.url || // Alternative field name
        variantData.product.mainImageUrl || // Product main image
        variantData.image || // Direct image field
        "/placeholder-image.jpg";

      console.log("Final selected imageUrl:", imageUrl);
      console.log("=== END IMAGE DEBUG ===");

      console.log("createLocalCartItem - calculated values:", {
        productName: variantData.product.name,
        basePrice,
        discountPercent,
        discountPrice,
        imageUrl,
        variantSku: variantData.sku,
        colorName: variantData.color?.name,
        sizeName: variantData.size?.name,
      });

      const cartItem = {
        id: `local-${variantId}`,
        quantity,
        maxQuantity: variantData.stockQuantity || 100,
        name: variantData.product.name || "Unnamed Product",
        price: basePrice,
        discountPrice: discountPrice,
        imageUrl: imageUrl,
        image: imageUrl,
        slug: variantData.product.slug || "",
        variant: variantData,
        color: variantData.color?.name || "",
        size: variantData.size?.name || "",
        sku: variantData.sku || "",
      };

      console.log("Final cart item created:", cartItem);
      return cartItem;
    } catch (err) {
      console.error("Failed to fetch variant data for local cart:", err);
      throw new Error("Could not fetch product details");
    }
  }; // Merge local cart to API cart when user logs in
  const mergeLocalToApiCart = useCallback(async () => {
    console.log("mergeLocalToApiCart called:", {
      isAuthenticated,
      localItemsCount: localItems.length,
    });

    if (!isAuthenticated || localItems.length === 0) {
      console.log("Skipping merge: not authenticated or no local items");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting merge process with local items:", localItems);

      // Convert local items to merge format
      const guestCartItems = (localItems || []).map((item) => ({
        variantId:
          typeof item.variant === "string"
            ? item.variant
            : item.variant?.id || "",
        quantity: item.quantity,
      }));

      console.log("Guest cart items to merge:", guestCartItems);

      // Merge with API
      const request: MergeGuestCartRequest = { items: guestCartItems };
      const mergeResult = await cartApi.mergeGuestCart(request);
      console.log("Merge result:", mergeResult);

      // Clear local cart after successful merge
      localStorage.removeItem("cart");
      setLocalItems([]);
      console.log("Local cart cleared after merge");

      // Fetch updated API cart
      await fetchApiCart();
      console.log("API cart fetched after merge");
    } catch (err: any) {
      console.error("Failed to merge local cart:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      setError(err.message || "Failed to merge cart");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, localItems]); // Removed fetchApiCart from dependencies
  // Handle logout - optionally preserve cart items in localStorage
  const handleLogout = useCallback(async () => {
    if (cart && cart.items && cart.items.length > 0) {
      // Convert API cart items to local format before logout
      const localCartItems: CartItem[] = cart.items
        .map(convertCartItemResponseToCartItem)
        .filter((item): item is CartItem => item !== null);
      saveLocalCart(localCartItems);
    }

    setCart(null);
  }, [cart, saveLocalCart]); // Initialize cart based on auth status  // Main effect for auth changes and cart management
  useEffect(() => {
    console.log("Auth effect triggered:", {
      isAuthenticated,
      localItemsCount: localItems.length,
    });

    if (isAuthenticated) {
      // User is logged in - fetch API cart first
      fetchApiCart().then(() => {
        // After fetching API cart, merge local items if any
        if (localItems.length > 0) {
          console.log("User logged in with local items, merging...");
          mergeLocalToApiCart();
        }
      });
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
        setError(null);

        if (isAuthenticated) {
          // Optimistic update: Update UI immediately
          const cartItem = cart?.items.find(
            (item) => item.variant.id === variantId
          );
          if (cartItem && cart) {
            const updatedItems = cart.items
              .map((item) =>
                item.variant.id === variantId ? { ...item, quantity } : item
              )
              .filter((item) => item.quantity > 0);

            const updatedCart = {
              ...cart,
              items: updatedItems,
              itemCount: updatedItems.length,
              subtotal: updatedItems.reduce((sum, item) => {
                const price = item.variant.product.discountPercent
                  ? item.variant.product.basePrice *
                    (1 - item.variant.product.discountPercent / 100)
                  : item.variant.product.basePrice;
                return sum + price * item.quantity;
              }, 0),
            };
            setCart(updatedCart);

            // Then update API in background (no loading state)
            try {
              if (quantity <= 0) {
                await cartItemsApi.removeByVariant(variantId);
              } else {
                await cartItemsApi.updateQuantity(cartItem.id, { quantity });
              }
              // Optionally sync with server after successful update
              // await fetchApiCart(); // Commented out to avoid extra API call
            } catch (apiError) {
              // If API fails, revert the optimistic update
              console.error("Failed to update cart on server:", apiError);
              await fetchApiCart(); // Fetch fresh data to revert
              setError("Failed to update cart");
            }
          }
        } else {
          // Update local cart (already fast)
          const updatedItems = (localItems || [])
            .map((item) =>
              item.variant?.id === variantId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0);

          saveLocalCart(updatedItems);
        }
      } catch (err: any) {
        setError(err.message);
        // Revert optimistic update on error
        if (isAuthenticated) {
          await fetchApiCart();
        }
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
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []); // Computed values
  const items = isAuthenticated
    ? (cart?.items || [])
        .map(convertCartItemResponseToCartItem)
        .filter((item): item is CartItem => item !== null)
    : localItems || [];
  const totalItems = (items || []).reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );
  const totalAmount = (items || []).reduce((sum: number, item: CartItem) => {
    const price =
      item.discountPrice && item.discountPrice > 0
        ? item.discountPrice
        : item.price || 0;
    console.log(
      `Calculating price for item ${item.id}: discountPrice=${item.discountPrice}, price=${item.price}, final=${price}`
    );
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
