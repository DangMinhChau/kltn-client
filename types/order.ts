import { CartItem } from "./index";

// Order interfaces
export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantSku: string;
  colorName: string;
  sizeName: string;
  // Relations from backend
  orderId?: string;
  variantId?: string;
  // Calculated field
  totalPrice?: number;
}

export interface ShippingInfo {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  notes?: string;
}

// Enhanced shipping response to match backend
export interface ShippingResponse {
  id: string;
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  ward: string;
  district: string;
  province: string;
  shippingMethod: string;
  shippingFee: number;
  trackingNumber: string;
  status: string;
  note?: string;
  // GHN specific fields
  ghnOrderCode?: string;
  ghnSortCode?: string;
  codAmount?: number;
  serviceId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
  expectedDeliveryDate?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  status: OrderStatus;

  // Pricing
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;

  // Items
  items: OrderItem[];

  // Voucher
  voucher?: {
    id: string;
    code: string;
    name: string;
  };

  // Payment info
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };

  // Shipping info
  shipping?: {
    id: string;
    trackingNumber: string;
    status: string;
    shippingFee: number;
    // Additional GHN fields
    ghnOrderCode?: string;
    expectedDeliveryDate?: Date;
  };

  // Timestamps
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Backend specific fields
  isPaid?: boolean;
  paidAt?: Date | null;
  canceledAt?: Date | null;
  completedAt?: Date | null;

  // Additional info
  note?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed", // Add missing status from backend
  PROCESSING = "processing",
  SHIPPED = "shipped", // Add missing status from backend
  DELIVERED = "delivered", // Add missing status from backend
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  RETURNED = "returned", // Add missing status from backend
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  UNPAID = "unpaid",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  COD = "COD", // Cash on delivery
  CREDIT_CARD = "CREDIT_CARD",
  PAYPAL = "PAYPAL",
}

// Add shipping enums to match backend
export enum ShippingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PICKING = "picking",
  PICKED = "picked",
  IN_TRANSIT = "in_transit",
  DELIVERING = "delivering",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  ECONOMY = "ECONOMY",
  OVERNIGHT = "OVERNIGHT",
}

// Order creation request
export interface CreateOrderRequest {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  shippingMethod: string;
  voucherCode?: string;
  notes?: string;
}

// Order response for listing
export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
  estimatedDelivery?: Date;
}

// Order History for user orders page
export interface OrderHistory {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Order tracking
export interface OrderTrackingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  description: string;
  createdAt: Date;
  location?: string;
}

export interface OrderTracking {
  order: Order;
  events: OrderTrackingEvent[];
  currentStatus: OrderStatus;
  progress: number; // 0-100
}

// Voucher interfaces
export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  value: number; // percentage or fixed amount
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export enum VoucherType {
  FIXED = "fixed",
  PERCENT = "percent",
  FREE_SHIPPING = "free_shipping",
  MIN_ORDER_FIXED = "min_order_fixed",
  MIN_ORDER_PERCENT = "min_order_percent",
  BUY_X_GET_Y = "buy_x_get_y",
  CUSTOM = "custom",
}

export interface VoucherValidationResult {
  isValid: boolean;
  voucher?: Voucher;
  discountAmount: number;
  message: string;
}

// Cart to Order conversion
export interface OrderPreview {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  estimatedDelivery: Date;
}

// Helper function to convert cart items to order items
export function convertCartToOrderItems(
  cartItems: CartItem[]
): Omit<OrderItem, "id" | "orderId">[] {
  return cartItems.map((item) => ({
    quantity: item.quantity,
    unitPrice: item.discountPrice || item.price,
    totalPrice: (item.discountPrice || item.price) * item.quantity,
    productName: item.name,
    variantSku: item.variant.sku,
    colorName: item.variant.color?.name || "Default",
    sizeName: item.variant.size?.name || "Default",
    variantId: item.variant.id,
  }));
}

// API mapping interfaces
export interface OrderApiRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  voucherCode?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  shippingMethod: string;
}

export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    productName: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    colorName: string;
    sizeName: string;
  }>;
  voucher?: {
    id: string;
    code: string;
    name: string;
  };
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  status: string;
  note?: string;
  payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
    transactionId?: string;
    paidAt?: Date;
  };
  shipping?: {
    id: string;
    trackingNumber: string;
    status: string;
    shippingFee: number;
    ghnOrderCode?: string;
    expectedDeliveryDate?: Date;
  };
  isPaid?: boolean;
  paidAt?: Date;
  canceledAt?: Date;
  completedAt?: Date;
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Shipping API responses to match backend
export interface ShippingTrackingResponse {
  success: boolean;
  data: {
    trackingNumber: string;
    status: string;
    statusDescription: string;
    trackingHistory: Array<{
      time: string;
      description: string;
      location: string;
    }>;
    estimatedDeliveryTime: string;
    ghnStatus?: string;
    expectedDeliveryTime?: string;
    logs?: Array<{
      status: string;
      updated_date: string;
      description: string;
    }>;
  };
}

export interface ShippingFeeResponse {
  success: boolean;
  data: {
    totalFee: number;
    serviceFee: number;
    insuranceFee: number;
    codFee: number;
    estimatedDeliveryTime: string;
    currency: string;
  };
}

export interface AvailableShippingService {
  serviceId: number;
  serviceName: string;
  serviceTypeId: number;
  estimatedDeliveryTime: string;
  isAvailable: boolean;
}
