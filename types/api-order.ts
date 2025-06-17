// Re-export types from main types file for backward compatibility
export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderListItem,
} from "./index";

import { OrderStatus, Order } from "./index";

// Admin-specific order types for enhanced UI
export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  status: OrderStatus;
  subTotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  items: AdminOrderItem[];
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };
  shipping: {
    id: string;
    trackingNumber: string;
    status: string;
    shippingFee: number;
    expectedDeliveryDate: Date;
  };
  orderedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantSku: string;
  colorName: string;
  sizeName: string;
  orderId: string;
  variantId: string;
  totalPrice: number;
}

export interface OrderQueryDto {
  search?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface OrderListApiResponse {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
