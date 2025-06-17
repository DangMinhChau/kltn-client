// GHN API Types
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

// API Response Types
export interface GHNResponse<T> {
  code: number;
  message: string;
  data: T;
}

const GHN_API_BASE = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN || "your-ghn-token";
const GHN_SHOP_ID = process.env.NEXT_PUBLIC_GHN_SHOP_ID || "your-shop-id";

class GHNService {
  private headers = {
    "Content-Type": "application/json",
    Token: GHN_TOKEN,
    ShopId: GHN_SHOP_ID,
  };

  // Lấy danh sách tỉnh/thành phố
  async getProvinces(): Promise<GHNProvince[]> {
    try {
      const response = await fetch(`${GHN_API_BASE}/master-data/province`, {
        method: "GET",
        headers: this.headers,
      });

      const result: GHNResponse<GHNProvince[]> = await response.json();

      if (result.code === 200) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  }

  // Lấy danh sách quận/huyện theo tỉnh
  async getDistricts(provinceId: number): Promise<GHNDistrict[]> {
    try {
      const response = await fetch(`${GHN_API_BASE}/master-data/district`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          province_id: provinceId,
        }),
      });

      const result: GHNResponse<GHNDistrict[]> = await response.json();

      if (result.code === 200) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  }

  // Lấy danh sách phường/xã theo quận/huyện
  async getWards(districtId: number): Promise<GHNWard[]> {
    try {
      const response = await fetch(`${GHN_API_BASE}/master-data/ward`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          district_id: districtId,
        }),
      });

      const result: GHNResponse<GHNWard[]> = await response.json();

      if (result.code === 200) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  }

  // Tính phí vận chuyển
  async calculateShippingFee(params: {
    to_province_id: number;
    to_district_id: number;
    to_ward_code: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    service_type_id?: number;
  }) {
    try {
      const response = await fetch(`${GHN_API_BASE}/v2/shipping-order/fee`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          service_type_id: params.service_type_id || 2, // Standard service
          from_district_id: 1442, // Your shop district ID
          to_district_id: params.to_district_id,
          to_ward_code: params.to_ward_code,
          height: params.height,
          length: params.length,
          weight: params.weight,
          width: params.width,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
      throw error;
    }
  }

  // Lấy thông tin dịch vụ vận chuyển
  async getServices(params: { to_district: number; from_district?: number }) {
    try {
      const response = await fetch(
        `${GHN_API_BASE}/v2/shipping-order/available-services`,
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            shop_id: parseInt(GHN_SHOP_ID),
            from_district: params.from_district || 1442, // Your shop district ID
            to_district: params.to_district,
          }),
        }
      );

      const result = await response.json();

      if (result.code === 200) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  }
}

export const ghnService = new GHNService();
