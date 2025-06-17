import { api } from "@/lib/api";

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
}

export interface GHNDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
  Type: number;
  SupportType: number;
}

export interface GHNWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

export interface ShippingFeeParams {
  to_district_id: number;
  to_ward_code: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  service_type_id?: number;
}

export interface ShippingFeeResult {
  total: number;
  service_fee: number;
  insurance_fee: number;
  pick_station_fee: number;
  coupon_value: number;
  r2s_fee: number;
}

export const ghnApi = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async (): Promise<GHNProvince[]> => {
    const response = await api.get("/ghn/provinces");
    return response.data;
  },

  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts: async (provinceId: number): Promise<GHNDistrict[]> => {
    const response = await api.post("/ghn/districts", { provinceId });
    return response.data;
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWards: async (districtId: number): Promise<GHNWard[]> => {
    const response = await api.post("/ghn/wards", { districtId });
    return response.data;
  },

  // Tính phí vận chuyển
  calculateShippingFee: async (
    params: ShippingFeeParams
  ): Promise<ShippingFeeResult> => {
    const response = await api.post("/ghn/shipping-fee", params);
    return response.data;
  },

  // Lấy thông tin dịch vụ vận chuyển
  getServices: async (params: {
    to_district: number;
    from_district?: number;
  }) => {
    const response = await api.post("/ghn/services", params);
    return response.data;
  },

  // Lấy thời gian giao hàng dự kiến
  getLeadTime: async (params: {
    from_district_id?: number;
    to_district_id: number;
    to_ward_code: string;
    service_id: number;
  }) => {
    const response = await api.post("/ghn/leadtime", params);
    return response.data;
  },
};

export default ghnApi;
