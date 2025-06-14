/**
 * API Request/Response types for Order system
 * Designed to match backend DTOs exactly
 */

import { PaymentMethod, ShippingMethod } from "./order";

// ================================
// CREATE ORDER DTOs
// ================================

export interface CreateOrderItemDto {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: CreateOrderItemDto[];
  voucherId?: string;
  subTotal: number;
  shippingFee?: number;
  discount?: number;
  totalPrice: number;
  note?: string;
}

export interface CreateOrderPaymentDto extends CreateOrderDto {
  // Payment Information
  paymentMethod: PaymentMethod;
  paymentNote?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

// ================================
// SHIPPING DTOs
// ================================

export interface CreateShippingDto {
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
  shippingMethod: ShippingMethod;
  shippingFee?: number;
  trackingNumber?: string;
  note?: string;
  // GHN specific fields
  codAmount?: number;
  serviceId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
}

export interface CalculateShippingFeeDto {
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  insuranceValue?: number;
  codAmount?: number;
  serviceId?: number;
}

export interface ShippingCalculationDto {
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  insuranceValue?: number;
  codAmount?: number;
  serviceId?: number;
}

export interface VoucherValidationDto {
  code: string;
  orderAmount: number;
  userId?: string;
}

export interface AddressValidationDto {
  provinceId: number;
  districtId: number;
  wardCode: string;
}

// ================================
// COMPLETE ORDER DTO
// ================================

export interface ShippingInfoDto {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  note?: string;
}

export interface CompleteOrderDto extends CreateOrderDto {
  // Payment Information
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;

  // Shipping Information
  shippingInfo: ShippingInfoDto;
}

// ================================
// QUERY DTOs
// ================================

export interface OrderQueryDto {
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaymentQueryDto {
  status?: string;
  method?: string;
  orderId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ================================
// UPDATE DTOs
// ================================

export interface UpdateOrderDto {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  note?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  note?: string;
}

export interface UpdateShippingDto {
  recipientName?: string;
  recipientPhone?: string;
  address?: string;
  note?: string;
  trackingNumber?: string;
}

export interface UpdateStatusDto {
  status: string;
}

// ================================
// PAYMENT DTOs
// ================================

export interface PaymentRetryDto {
  orderId: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentCallbackDto {
  vnp_TmnCode?: string;
  vnp_Amount?: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_OrderInfo?: string;
  vnp_TransactionNo?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef?: string;
  vnp_SecureHash?: string;
}

// ================================
// GHN ADDRESS DTOs
// ================================

export interface ProvinceDto {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
}

export interface DistrictDto {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  Type: number;
  SupportType: number;
}

export interface WardDto {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension: string[];
  IsEnable: number;
  CanUpdateCOD: boolean;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  SupportType: number;
  PickType: number;
  DeliverType: number;
}

export interface ShippingServiceDto {
  service_id: number;
  short_name: string;
  service_type_id: number;
}

// ================================
// API RESPONSE WRAPPERS
// ================================

export interface BaseResponseDto<T = any> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
  path: string;
}

export interface PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ================================
// RESPONSE TYPES
// ================================

export interface OrderApiResponse extends BaseResponseDto<Order> {}

export interface OrderListApiResponse extends PaginatedResponseDto<Order> {}

export interface OrderTrackingResponse
  extends BaseResponseDto<{
    order: Order;
    tracking: {
      currentStatus: string;
      estimatedDelivery?: Date;
      events: Array<{
        status: string;
        timestamp: Date;
        description: string;
        location?: string;
      }>;
    };
  }> {}

export interface OrderPreviewResponse
  extends BaseResponseDto<{
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    estimatedDelivery: string;
    availableVouchers?: Array<{
      id: string;
      code: string;
      discount: number;
    }>;
  }> {}

export interface VoucherValidationResponse
  extends BaseResponseDto<{
    isValid: boolean;
    voucher?: any;
    discountAmount: number;
    message?: string;
  }> {}

export interface PaymentCreationResponse
  extends BaseResponseDto<{
    paymentUrl?: string;
    qrCode?: string;
    instructions?: string;
    paymentId: string;
  }> {}

export interface PaymentStatusResponse
  extends BaseResponseDto<{
    status: "pending" | "paid" | "failed";
    paidAt?: Date;
    transactionId?: string;
  }> {}

// Import Order type
import { Order } from "./order";

// ================================
// UPDATED API RESPONSE WRAPPERS
// ================================
