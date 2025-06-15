// Backend Response Types - match với DTOs từ backend
export interface BaseResponse<T> {
  message: string;
  data: T;
  meta: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    timestamp: string;
  };
}

// Cart DTOs - match với backend CartResponseDto
export interface CartResponse {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  items: CartItemResponse[];
  itemCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// CartItem DTOs - match với backend CartItemResponseDto
export interface CartItemResponse {
  id: string;
  quantity: number;
  itemTotal: number;
  variant: {
    id: string;
    sku: string;
    stockQuantity: number;
    isActive: boolean;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      discountPercent?: number;
      images?: { url: string; altText: string }[];
    };
    color: {
      id: string;
      name: string;
      hexCode: string;
    };
    size: {
      id: string;
      name: string;
    };
    images?: { url: string; altText: string }[];
  };
  createdAt: string;
  updatedAt: string;
}

// Cart Summary DTO - match với backend CartSummaryResponseDto
export interface CartSummaryResponse {
  totalItems: number;
  totalAmount: number;
  isEmpty: boolean;
  items: CartItemResponse[];
}

// Cart Validation DTO - match với backend CartValidationResponseDto
export interface CartValidationResponse {
  valid: boolean;
  issues: {
    itemId: string;
    issue: string;
    variant?: any;
  }[];
  summary: {
    totalValidItems: number;
    totalInvalidItems: number;
  };
}

// Request DTOs - match với backend request DTOs
export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface BulkAddToCartRequest {
  items: AddToCartRequest[];
}

export interface MergeGuestCartRequest {
  items: {
    variantId: string;
    quantity: number;
  }[];
}

export interface ShippingEstimateRequest {
  province: string;
  district: string;
  ward: string;
  address?: string;
  shippingMethod?: "standard" | "express" | "same-day";
}

export interface ShippingEstimateResponse {
  estimatedCost: number;
  estimatedDeliveryDays: number;
  availableShippingMethods: {
    name: string;
    cost: number;
    days: number;
  }[];
}
