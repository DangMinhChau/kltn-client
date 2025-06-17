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
  mainImageUrl?: string;
  images?: Image[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  color?: Color;
  size?: Size;
  product: Product;
  images?: Image[];
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  imageUrl: string;
  altText?: string;
  isMain: boolean;
  isPrimary?: boolean;
  sortOrder?: number;
  displayOrder: number;
}

export interface Color {
  id: string;
  name: string;
  code?: string;
  hexCode: string;
  isActive: boolean;
  productCount?: number;
}

export interface Size {
  id: string;
  name: string;
  description?: string;
  category?: Category;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  parent?: Category;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  productCount?: number;
}

export interface Material {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  careInstructions?: string;
  isActive: boolean;
  productCount?: number;
}

export interface Style {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  season?: string;
  year?: number;
  images?: Image[];
  products?: Product[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role?: "USER" | "ADMIN";
  isEmailVerified?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart Types (Local only)
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
  color: string;
  size: string;
  sku: string;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: User;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export interface PaginatedApiResponse<T = any> {
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    timestamp: string;
  };
}

// Location Types (for shipping)
export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export interface Ward {
  id: string;
  name: string;
  districtId: number;
}

// Voucher Types
export interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherValidationResult {
  isValid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  message?: string;
  error?: string;
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
  // GHN specific fields
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceCode?: string;
  ghnDistrictCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  shippingFee?: number;
  paymentMethod: "COD" | "PAYPAL";
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  orderItems: OrderItem[];
  user?: User;
  createdAt: string;
  updatedAt: string;
  // Additional properties for UI
  customerName?: string;
  customerEmail?: string;
  totalPrice?: number;
  items?: OrderItem[];
  payment?: {
    status: PaymentStatus;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant: ProductVariant;
  product: Product;
  productName?: string;
  variantSku?: string;
  colorName?: string;
  sizeName?: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

// Product Filter Types
export interface ProductFilters {
  search?: string;
  category?: string;
  collection?: string;
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  categories: Category[];
  collections: Collection[];
  colors: Color[];
  sizes: Size[];
  materials: Material[];
  styles: Style[];
  tags: Tag[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Pagination Types
export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cart State Type
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedVoucher?: VoucherValidationResult;
}
