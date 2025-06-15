import api from "../api";
import { Voucher, VoucherValidationResult } from "@/types";

export interface CreateVoucherData {
  code: string;
  description: string;
  discountType: "AMOUNT" | "PERCENT";
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
  getVouchers: async (
    params?: VoucherQueryParams
  ): Promise<VoucherListResponse> => {
    const queryString = new URLSearchParams();

    if (params?.page) queryString.set("page", params.page.toString());
    if (params?.limit) queryString.set("limit", params.limit.toString());
    if (params?.search) queryString.set("search", params.search);
    if (params?.isActive !== undefined)
      queryString.set("isActive", params.isActive.toString());
    if (params?.discountType)
      queryString.set("discountType", params.discountType);

    const query = queryString.toString();
    const response = await api.get(`/vouchers${query ? `?${query}` : ""}`);
    return response.data;
  },
  // Get single voucher
  getVoucher: async (id: string): Promise<VoucherResponse> => {
    const response = await api.get(`/vouchers/${id}`);
    return response.data;
  },

  // Create new voucher
  createVoucher: async (data: CreateVoucherData): Promise<VoucherResponse> => {
    const response = await api.post("/vouchers", data);
    return response.data;
  },

  // Update voucher
  updateVoucher: async (
    id: string,
    data: UpdateVoucherData
  ): Promise<VoucherResponse> => {
    const response = await api.patch(`/vouchers/${id}`, data);
    return response.data;
  },

  // Toggle voucher status
  toggleVoucherStatus: async (id: string): Promise<VoucherResponse> => {
    const response = await api.patch(`/vouchers/${id}/toggle-status`);
    return response.data;
  },

  // Delete voucher
  deleteVoucher: async (id: string): Promise<void> => {
    await api.delete(`/vouchers/${id}`);
  },

  // Get voucher statistics
  getStatistics: async (): Promise<VoucherStatistics> => {
    const response = await api.get("/vouchers/statistics");
    return response.data;
  },

  // Get active vouchers
  getActiveVouchers: async (): Promise<{ data: Voucher[] }> => {
    const response = await api.get("/vouchers/active");
    return response.data;
  },

  // Validate voucher
  validateVoucher: async (
    code: string,
    orderTotal: number
  ): Promise<VoucherValidationResult> => {
    const response = await api.get(
      `/vouchers/validate/${code}?orderTotal=${orderTotal}`
    );
    return response.data;
  },

  // Apply voucher
  applyVoucher: async (
    code: string,
    orderTotal: number
  ): Promise<{
    voucher: Voucher;
    discountAmount: number;
  }> => {
    const response = await api.post("/vouchers/apply", { code, orderTotal });
    return response.data;
  },
};

export default adminVoucherApi;
