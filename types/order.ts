import { CartItem } from "./index";

// Order interfaces
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    sku: string;
    mainImageUrl: string;
  };
  variant: {
    id: string;
    color: {
      name: string;
      hexCode: string;
    };
    size: {
      name: string;
    };
  };
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Pricing
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  // Shipping
  shippingInfo: ShippingInfo;
  shippingMethod: string;
  estimatedDelivery?: Date;

  // Items
  items: OrderItem[];

  // Voucher
  voucherCode?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;

  // Additional info
  notes?: string;
  trackingNumber?: string;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  COD = "cod", // Cash on delivery
  BANK_TRANSFER = "bank_transfer",
  MOMO = "momo",
  ZALOPAY = "zalopay",
  VNPAY = "vnpay",
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
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  FREE_SHIPPING = "free_shipping",
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
    productId: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.discountPrice || item.price,
    totalPrice: (item.discountPrice || item.price) * item.quantity,
    product: {
      id: item.id,
      name: item.name,
      sku: item.sku,
      mainImageUrl: item.image,
    },
    variant: {
      id: item.variantId,
      color: {
        name: item.color,
        hexCode: "#000000", // Default, should be fetched from API
      },
      size: {
        name: item.size,
      },
    },
  }));
}
