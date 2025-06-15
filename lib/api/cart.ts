import { api } from "../api";
import { CartItem } from "@/types";
import type {
  BaseResponse,
  PaginatedResponse,
  CartResponse,
  CartItemResponse,
  CartSummaryResponse,
  CartValidationResponse,
  AddToCartRequest as AddToCartDto,
  BulkAddToCartRequest as BulkAddToCartDto,
  MergeGuestCartRequest as MergeGuestCartDto,
  ShippingEstimateRequest,
  ShippingEstimateResponse,
} from "@/types/api-cart";

// Re-export CartItem for backward compatibility
export type { CartItem } from "@/types";

// Legacy interfaces for backward compatibility
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

// Helper function to extract data from BaseResponse
const extractData = <T>(response: BaseResponse<T>): T => response.data;

// Helper function to extract data from PaginatedResponse
const extractPaginatedData = <T>(response: PaginatedResponse<T>): T[] =>
  response.data;

// Cart API endpoints
export const cartApi = {
  // Get current user's cart with items
  getMyCart: async (): Promise<CartResponse> => {
    const response: BaseResponse<CartResponse> = await api.get(
      "/carts/my-cart"
    );
    console.log("getMyCart API response:", response);
    const extractedData = extractData(response);
    console.log("getMyCart extracted data:", extractedData);
    return extractedData;
  },

  // Get cart summary
  getCartSummary: async (): Promise<CartSummaryResponse> => {
    const response: BaseResponse<CartSummaryResponse> = await api.get(
      "/carts/summary"
    );
    return extractData(response);
  },
  // Clear entire cart
  clearMyCart: async (): Promise<{ message: string }> => {
    const response: BaseResponse<null> = await api.delete(
      "/carts/my-cart/clear"
    );
    return { message: response.message };
  },

  // Merge guest cart items
  mergeGuestCart: async (request: MergeGuestCartDto): Promise<CartResponse> => {
    const response: BaseResponse<CartResponse> = await api.post(
      "/carts/merge-guest-cart",
      request
    );
    return extractData(response);
  },

  // Get product recommendations based on cart
  getRecommendations: async (): Promise<any[]> => {
    const response: BaseResponse<any[]> = await api.get(
      "/carts/recommendations"
    );
    return extractData(response);
  },

  // Estimate shipping costs
  estimateShipping: async (
    request: ShippingEstimateRequest
  ): Promise<ShippingEstimateResponse> => {
    const response: BaseResponse<ShippingEstimateResponse> = await api.post(
      "/carts/shipping-estimate",
      request
    );
    return extractData(response);
  },
};

// Cart Items API endpoints (token-based)
export const cartItemsApi = {
  // Add item to cart
  addToCart: async (request: AddToCartDto): Promise<CartItemResponse> => {
    const response: BaseResponse<CartItemResponse> = await api.post(
      "/cart-items/add-to-cart",
      request
    );
    return extractData(response);
  },

  // Add multiple items to cart
  bulkAddToCart: async (
    request: BulkAddToCartDto
  ): Promise<CartItemResponse[]> => {
    const response: BaseResponse<CartItemResponse[]> = await api.post(
      "/cart-items/bulk-add-to-cart",
      request
    );
    return extractData(response);
  },

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
    const cartResponse = await cartApi.getMyCart();
    return transformCartResponse(cartResponse);
  },

  // Add single item to cart
  addItem: async (
    variantId: string,
    quantity: number = 1
  ): Promise<CartItem> => {
    const itemResponse = await cartItemsApi.addToCart({ variantId, quantity });
    return transformCartItemResponse(itemResponse);
  },

  // Update item quantity by finding the cart item
  updateItemQuantity: async (
    variantId: string,
    quantity: number
  ): Promise<CartItem | null> => {
    const cartResponse = await cartApi.getMyCart();
    const cart = transformCartResponse(cartResponse);
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
    const cartResponse = await cartApi.getMyCart();
    return cartResponse.itemCount;
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

// Transformation functions for backward compatibility
const transformCartResponse = (cartResponse: CartResponse): Cart => ({
  id: cartResponse.id,
  user: cartResponse.user,
  items: cartResponse.items.map(transformCartItemResponse),
  itemCount: cartResponse.itemCount,
  subtotal: cartResponse.subtotal,
  createdAt: new Date(cartResponse.createdAt),
  updatedAt: new Date(cartResponse.updatedAt),
});

const transformCartItemResponse = (
  itemResponse: CartItemResponse
): CartItem => ({
  id: itemResponse.id,
  quantity: itemResponse.quantity,
  maxQuantity: itemResponse.variant.stockQuantity,
  name: itemResponse.variant.product.name,
  price: itemResponse.variant.product.basePrice,
  discountPrice: itemResponse.variant.product.discountPercent
    ? itemResponse.variant.product.basePrice *
      (1 - itemResponse.variant.product.discountPercent / 100)
    : undefined,
  imageUrl:
    itemResponse.variant.product.images?.[0]?.url ||
    itemResponse.variant.images?.[0]?.url ||
    "",
  image:
    itemResponse.variant.product.images?.[0]?.url ||
    itemResponse.variant.images?.[0]?.url ||
    "",
  slug: itemResponse.variant.product.slug,
  variant: {
    id: itemResponse.variant.id,
    sku: itemResponse.variant.sku,
    stockQuantity: itemResponse.variant.stockQuantity,
    isActive: itemResponse.variant.isActive,
    color: {
      ...itemResponse.variant.color,
      code: itemResponse.variant.color.hexCode, // Map hexCode to code
      isActive: true, // Default value
      createdAt: itemResponse.createdAt,
      updatedAt: itemResponse.updatedAt,
    },
    size: {
      ...itemResponse.variant.size,
      isActive: true, // Default value
      category: {} as any, // Will need to be populated if needed
      createdAt: itemResponse.createdAt,
      updatedAt: itemResponse.updatedAt,
    },
    images: itemResponse.variant.images?.map((img) => ({
      id: "", // Generated ID
      imageUrl: img.url,
      altText: img.altText,
      isPrimary: false,
      sortOrder: 0,
    })),
    product: itemResponse.variant.product,
    createdAt: itemResponse.createdAt,
    updatedAt: itemResponse.updatedAt,
  },
  color: itemResponse.variant.color.name,
  size: itemResponse.variant.size.name,
  sku: itemResponse.variant.sku,
});

export default {
  cartApi,
  cartItemsApi,
  cartHelpers,
};
