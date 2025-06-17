import { api } from "@/lib/api";
import { VoucherValidationResult } from "@/types";

export const voucherApi = {
  validateVoucher: async (
    code: string,
    cartTotal: number
  ): Promise<VoucherValidationResult> => {
    const response = await api.post("/vouchers/validate", {
      code,
      cartTotal,
    });
    const responseBody = response.data;
    // Backend returns: { message, data: VoucherValidationResult, meta: { timestamp } }
    return responseBody.data;
  },
};

export default voucherApi;
