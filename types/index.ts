// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  baseSku: string;
  basePrice: string;
  discount?: number;
  isActive: boolean;
  tags?: Tag[];
  materials?: Material[];
  styles?: Style[];
  collections?: Collection[];
  images?: ProductImage[];
  image?: ProductImage;
  category?: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  // Computed fields for compatibility
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  color?: Color;
  size?: Size;
  images?: ProductImage[];
}

export interface ProductImage {
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
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  season: string;
  year: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  code: string;
  type?: string;
  description?: string;
  isActive: boolean;
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
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
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
  imageUrl: string;
  slug: string;
  variant: ProductVariant;
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

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  orderedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantSku: string;
  colorName: string;
  sizeName: string;
  variant: ProductVariant;
}

// Enums
export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

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
