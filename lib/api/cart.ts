import { api } from "../api";
import { CartItem } from "@/types";

// Cart interfaces
export interface Cart {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiCartItem {
  id: string;
  cart: {
    id: string;
  };
  variant: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      basePrice: number;
    };
    size: {
      id: string;
      name: string;
    };
    color: {
      id: string;
      name: string;
      hexCode: string;
    };
    price: number;
    salePrice?: number;
    stock: number;
  };
  quantity: number;
  itemTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: {
    id: string;
    variantId: string;
    productName: string;
    variantDetails: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface BulkAddToCartRequest {
  items: AddToCartRequest[];
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartValidationResult {
  isValid: boolean;
  errors: {
    itemId: string;
    variantId: string;
    error: string;
    currentStock?: number;
    requestedQuantity?: number;
  }[];
  availableItems: CartItem[];
  unavailableItems: {
    item: CartItem;
    reason: string;
  }[];
}

export interface MergeGuestCartRequest {
  guestCartItems: {
    variantId: string;
    quantity: number;
  }[];
}

// Cart API endpoints
export const cartApi = {
  // ✅ Get current user's cart with items
  getMyCart: (): Promise<Cart> => api.get("/carts/my-cart"),

  // ✅ Get cart summary
  getCartSummary: (): Promise<CartSummary> => api.get("/carts/summary"),

  // ✅ Clear entire cart
  clearMyCart: (): Promise<{ message: string }> =>
    api.delete("/carts/my-cart/clear"),

  // ✅ Merge guest cart items
  mergeGuestCart: (request: MergeGuestCartRequest): Promise<Cart> =>
    api.post("/carts/merge-guest-cart", request),

  // ✅ Get product recommendations based on cart
  getRecommendations: (): Promise<
    {
      id: string;
      name: string;
      slug: string;
      images: string[];
      basePrice: number;
      salePrice?: number;
    }[]
  > => api.get("/carts/recommendations"),

  // ✅ Estimate shipping costs
  estimateShipping: (destination: {
    province: string;
    district: string;
    ward: string;
  }): Promise<{
    standardFee: number;
    expressFee: number;
    standardDeliveryDays: number;
    expressDeliveryDays: number;
  }> => api.post("/carts/shipping-estimate", { destination }),
};

// Cart Items API endpoints (token-based)
export const cartItemsApi = {
  // ✅ Add item to cart (NEW token-based endpoint)
  addToCart: (request: AddToCartRequest): Promise<CartItem> =>
    api.post("/cart-items/add-to-cart", request),

  // ✅ Add multiple items to cart
  bulkAddToCart: (request: BulkAddToCartRequest): Promise<CartItem[]> =>
    api.post("/cart-items/bulk-add", request),

  // ✅ Get current user's cart items (NEW token-based endpoint)
  getMyCartItems: (): Promise<CartItem[]> =>
    api.get("/cart-items/my-cart-items"),

  // ✅ Get cart summary with totals
  getCartSummary: (): Promise<CartSummary> =>
    api.get("/cart-items/cart-summary"),

  // ✅ Validate cart items (check stock, availability)
  validateCart: (): Promise<CartValidationResult> =>
    api.post("/cart-items/validate-cart"),

  // ✅ Clear all cart items (NEW token-based endpoint)
  clearMyCartItems: (): Promise<{ message: string }> =>
    api.delete("/cart-items/my-cart-items/clear"),

  // ✅ Remove specific item by variant ID (NEW token-based endpoint)
  removeByVariant: (variantId: string): Promise<{ message: string }> =>
    api.delete(`/cart-items/my-cart-items/${variantId}`),

  // Update cart item quantity (ID-based)
  updateQuantity: (
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> => api.patch(`/cart-items/${itemId}/quantity`, request),

  // Update entire cart item (ID-based)
  updateCartItem: (
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> => api.patch(`/cart-items/${itemId}`, request),

  // Remove cart item by ID (ID-based)
  removeCartItem: (itemId: string): Promise<{ message: string }> =>
    api.delete(`/cart-items/${itemId}`),

  // 🔒 Admin-only: Get cart items by cart ID (requires ADMIN role)
  getCartItemsByCartId: (cartId: string): Promise<CartItem[]> =>
    api.get(`/cart-items/by-cart/${cartId}`),
};

// Convenience functions for common cart operations
export const cartHelpers = {
  // Get complete cart with all details
  getFullCart: async (): Promise<Cart> => {
    return cartApi.getMyCart();
  },

  // Add single item to cart
  addItem: async (
    variantId: string,
    quantity: number = 1
  ): Promise<CartItem> => {
    return cartItemsApi.addToCart({ variantId, quantity });
  },

  // Update item quantity by finding the cart item
  updateItemQuantity: async (
    variantId: string,
    quantity: number
  ): Promise<CartItem | null> => {
    const cart = await cartApi.getMyCart();
    const cartItem = cart.items.find((item) => item.variant.id === variantId);

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    return cartItemsApi.updateQuantity(cartItem.id, { quantity });
  },

  // Remove item by variant ID (preferred method)
  removeItem: async (variantId: string): Promise<{ message: string }> => {
    return cartItemsApi.removeByVariant(variantId);
  },

  // Get cart item count
  getItemCount: async (): Promise<number> => {
    const cart = await cartApi.getMyCart();
    return cart.itemCount;
  },

  // Get cart total
  getCartTotal: async (): Promise<number> => {
    const summary = await cartItemsApi.getCartSummary();
    return summary.total;
  },

  // Check if cart is valid (all items available)
  isCartValid: async (): Promise<boolean> => {
    const validation = await cartItemsApi.validateCart();
    return validation.isValid;
  },

  // Clear all cart data
  clearAll: async (): Promise<{ message: string }> => {
    return cartApi.clearMyCart();
  },
};

export default {
  cartApi,
  cartItemsApi,
  cartHelpers,
};
