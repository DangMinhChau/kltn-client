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

export interface GHNService {
  service_id: number;
  service_type_id: number;
  short_name: string;
  name: string;
}

export interface ShippingFeeParams {
  to_district_id: number;
  to_ward_code: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  service_id?: number;
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
    const responseBody = response.data;
    console.log("GHN Provinces response:", responseBody);
    // Backend returns: { message, data: GHNProvince[], meta: { timestamp } }
    // Fallback to direct response if not in BaseResponseDto format
    return responseBody.data || responseBody || [];
  },
  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts: async (provinceId: number): Promise<GHNDistrict[]> => {
    const response = await api.post("/ghn/districts", {
      province_id: provinceId,
    });
    const responseBody = response.data;
    console.log("GHN Districts response:", responseBody);
    // Backend returns: { message, data: GHNDistrict[], meta: { timestamp } }
    // Fallback to direct response if not in BaseResponseDto format
    return responseBody.data || responseBody || [];
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWards: async (districtId: number): Promise<GHNWard[]> => {
    const response = await api.post("/ghn/wards", { district_id: districtId });
    const responseBody = response.data;
    console.log("GHN Wards response:", responseBody);
    // Backend returns: { message, data: GHNWard[], meta: { timestamp } }
    // Fallback to direct response if not in BaseResponseDto format
    return responseBody.data || responseBody || [];
  },
  // Tính phí vận chuyển
  calculateShippingFee: async (
    params: ShippingFeeParams
  ): Promise<ShippingFeeResult> => {
    const response = await api.post("/ghn/shipping-fee", params);
    const responseBody = response.data;
    console.log("GHN Shipping Fee response:", responseBody);

    // Backend returns: { message, data: ShippingFeeResult, meta: { timestamp } }
    // If there's an error, data might be null
    if (responseBody.data) {
      return responseBody.data;
    } else {
      // Check if it's an error response
      if (responseBody.message && !responseBody.data) {
        throw new Error(responseBody.message);
      }
      // Fallback to direct response if not in BaseResponseDto format
      return responseBody;
    }
  },
  // Lấy thông tin dịch vụ vận chuyển
  getServices: async (params: {
    to_district: number;
    from_district?: number;
  }): Promise<GHNService[]> => {
    const response = await api.get("/ghn/services", {
      params: { to_district: params.to_district },
    });
    const responseBody = response.data;
    console.log("GHN Services response:", responseBody);
    // Backend returns: { message, data: Service[], meta: { timestamp } }
    return responseBody.data || responseBody || [];
  },

  // Lấy thời gian giao hàng dự kiến
  getLeadTime: async (params: {
    from_district_id?: number;
    to_district_id: number;
    to_ward_code: string;
    service_id: number;
  }) => {
    const response = await api.post("/ghn/leadtime", params);
    const responseBody = response.data;
    // Backend returns: { message, data: LeadTimeResult, meta: { timestamp } }
    return responseBody.data;
  },
};

export default ghnApi;
