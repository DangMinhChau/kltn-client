import api from "../api";
import { Voucher, VoucherValidationResult } from "@/types";

export interface CreateVoucherData {
  code: string;
  description: string;
  discountType: "amount" | "percent";
  discountAmount?: number;
  discountPercent?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startAt: string;
  expireAt: string;
  usageLimit?: number;
  isActive?: boolean;
}

export interface UpdateVoucherData extends Partial<CreateVoucherData> {}

export interface VoucherQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  discountType?: "amount" | "percent";
}

export interface VoucherListResponse {
  message: string;
  data: Voucher[];
  meta: {
    total: number;
    page: number;
    limit: number;
    timestamp: string;
  };
}

export interface VoucherResponse {
  message: string;
  data: Voucher;
  meta: {
    timestamp: string;
  };
}

export interface VoucherStatistics {
  total: number;
  active: number;
  expired: number;
  totalUsage: number;
}

// Admin Voucher API
export const adminVoucherApi = {
  // Get all vouchers with pagination and filters
  getVouchers: (params?: VoucherQueryParams): Promise<VoucherListResponse> => {
    const queryString = new URLSearchParams();

    if (params?.page) queryString.set("page", params.page.toString());
    if (params?.limit) queryString.set("limit", params.limit.toString());
    if (params?.search) queryString.set("search", params.search);
    if (params?.isActive !== undefined)
      queryString.set("isActive", params.isActive.toString());
    if (params?.discountType)
      queryString.set("discountType", params.discountType);

    const query = queryString.toString();
    return api.get(`/vouchers${query ? `?${query}` : ""}`);
  },

  // Get single voucher
  getVoucher: (id: string): Promise<VoucherResponse> =>
    api.get(`/vouchers/${id}`),

  // Create new voucher
  createVoucher: (data: CreateVoucherData): Promise<VoucherResponse> =>
    api.post("/vouchers", data),

  // Update voucher
  updateVoucher: (
    id: string,
    data: UpdateVoucherData
  ): Promise<VoucherResponse> => api.patch(`/vouchers/${id}`, data),

  // Toggle voucher status
  toggleVoucherStatus: (id: string): Promise<VoucherResponse> =>
    api.patch(`/vouchers/${id}/toggle-status`),

  // Delete voucher
  deleteVoucher: (id: string): Promise<void> => api.delete(`/vouchers/${id}`),

  // Get voucher statistics
  getStatistics: (): Promise<VoucherStatistics> =>
    api.get("/vouchers/statistics"),

  // Get active vouchers
  getActiveVouchers: (): Promise<{ data: Voucher[] }> =>
    api.get("/vouchers/active"),

  // Validate voucher
  validateVoucher: (
    code: string,
    orderTotal: number
  ): Promise<VoucherValidationResult> =>
    api.get(`/vouchers/validate/${code}?orderTotal=${orderTotal}`),

  // Apply voucher
  applyVoucher: (
    code: string,
    orderTotal: number
  ): Promise<{
    voucher: Voucher;
    discountAmount: number;
  }> => api.post("/vouchers/apply", { code, orderTotal }),
};

export default adminVoucherApi;
