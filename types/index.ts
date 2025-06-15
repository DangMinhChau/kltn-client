// Export order types
export * from "./order";
// Export API DTOs separately to avoid naming conflicts
export type {
  CreateOrderDto,
  CreateOrderItemDto,
  OrderApiResponse,
} from "./api-order";

// Export cart API types
export type {
  BaseResponse,
  PaginatedResponse,
  CartResponse,
  CartItemResponse,
  CartSummaryResponse,
  CartValidationResponse,
  AddToCartRequest,
  BulkAddToCartRequest,
  MergeGuestCartRequest,
  ShippingEstimateRequest,
  ShippingEstimateResponse,
} from "./api-cart";

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  baseSku: string;
  basePrice: number;
  discountPercent?: number;
  isActive: boolean;
  tags?: Tag[];
  materials?: Material[];
  styles?: Style[];
  collections?: Collection[];
  image: Image;
  category?: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  // Optional computed fields
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  color: Color;
  size: Size;
  images?: Image[];
  product: {
    id: string;
    name: string;
    basePrice?: number;
    discountPercent?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  publicId?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  parent?: Category;
  parentId?: string; // Add parentId for backwards compatibility
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  season?: string;
  year?: number;
  description?: string;
  images?: Image[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Optional computed fields for client usage
  imageUrl?: string; // Can be computed from images[0] or primary image
  products?: Product[];
}

// Collection API Response - matches backend DTO exactly
export interface CollectionResponse {
  id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description?: string; // Should be optional since DB field is nullable
  images?: Image[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Style Types
export interface Style {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Material Types
export interface Material {
  id: string;
  name: string;
  slug: string;
  description?: string;
  careInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Color Types
export interface Color {
  id: string;
  name: string;
  code: string;
  hexCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Size Types
export interface Size {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// User and Authentication Types
export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
}

// Address Types
export interface Address {
  id: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Cart Types
export interface Cart {
  id: string;
  user: User;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  quantity: number;
  maxQuantity: number;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl: string; // Used in page.tsx
  image: string; // Used in components
  slug: string;
  variant: ProductVariant;
  color: string; // For convenience access to variant.color.name
  size: string; // For convenience access to variant.size.name
  sku: string; // For convenience access to variant.sku
}

// Cart Context Types
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
}

export interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

// Unified Cart Context Types
export interface UnifiedCartContextType {
  // Cart state
  cart: Cart | null;
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

// Order Types are now exported from ./order.ts to avoid duplication

// API Response Types
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  timestamp: string;
  path: string;
}

// Pagination Types
export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth Types
export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  collections?: string[];
  materials?: string[];
  styles?: string[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  // Single filter selections
  collection?: string;
  material?: string;
  style?: string;
  tag?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "rating";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  categories: FilterSlugItem[];
  materials: FilterSlugItem[];
  styles: FilterSlugItem[];
  collections: FilterSlugItem[];
  tags: FilterSlugItem[];
  colors: FilterColorItem[];
  sizes: FilterSizeItem[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface FilterSlugItem {
  slug: string;
  name: string;
  productCount: number;
}

export interface FilterColorItem {
  code: string;
  name: string;
  hexCode: string;
  productCount: number;
}

export interface FilterSizeItem {
  name: string;
  productCount: number;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  user: User;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

// Voucher Types
// Matching backend DiscountType but extended for frontend
export enum VoucherType {
  PERCENTAGE = "PERCENT", // Matches backend DiscountType.PERCENT
  FIXED_AMOUNT = "AMOUNT", // Matches backend DiscountType.AMOUNT
  FREE_SHIPPING = "FREE_SHIPPING", // Extended for frontend
  BUY_X_GET_Y = "BUY_X_GET_Y", // Extended for frontend
  CUSTOM = "CUSTOM", // Extended for frontend
}

export interface Voucher {
  id: string;
  code: string;
  name?: string; // Optional since backend might not have this field
  description?: string;
  type: VoucherType;
  value: number; // Giá trị giảm giá (% hoặc số tiền cố định)
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string; // Maps to startAt in backend
  endDate: string; // Maps to expireAt in backend
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherValidationResult {
  isValid: boolean;
  voucher?: Voucher;
  discountAmount: number;
  message: string;
}

// Payment Types are now exported from ./order.ts to avoid duplication

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string; // Use string instead of enum to avoid conflicts
  status: string; // Use string instead of enum to avoid conflicts
  transactionId?: string;
  paymentData?: Record<string, any>;
  paidAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Shipping Types are now exported from ./order.ts to avoid duplication

// Notification Types
// Đồng bộ với NotificationType từ backend
export enum NotificationType {
  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_SHIPPED = "order_shipped",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  PROMOTION = "promotion",
  SYSTEM = "system",
  ACCOUNT = "account", // Extended for frontend
}

export interface Notification {
  id: string;
  userId: string; // Reference to user.id
  title: string;
  message: string; // Maps to content in backend
  type: NotificationType;
  isRead: boolean;
  relatedId?: string; // Maps to metadata in backend
  readAt?: string; // Added from backend
  createdAt: string;
  updatedAt: string;
}
