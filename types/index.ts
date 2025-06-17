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
  displayOrder: number;
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
}

export interface Size {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
  parent?: Category;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Style {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
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
  image: string;
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
  fullName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
