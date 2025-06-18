"use client";

// Direct GHN API service for frontend (Development only)
// Note: This approach has security risks in production

interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
  Code: string;
}

interface GHNWard {
  WardCode: string;
  WardName: string;
}

class DirectGHNService {
  private readonly baseUrl = "https://online-gateway.ghn.vn/shiip/public-api";
  private readonly apiKey = process.env.NEXT_PUBLIC_GHN_API_KEY || "";
  private readonly shopId = process.env.NEXT_PUBLIC_GHN_SHOP_ID || "";

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Token: this.apiKey,
        ShopId: this.shopId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GHN API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async getProvinces(): Promise<GHNProvince[]> {
    try {
      const response = await this.makeRequest("/master-data/province");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new Error("Không thể tải danh sách tỉnh/thành phố");
    }
  }

  async getDistricts(provinceId: number): Promise<GHNDistrict[]> {
    try {
      const response = await this.makeRequest("/master-data/district", {
        method: "POST",
        body: JSON.stringify({ province_id: provinceId }),
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw new Error("Không thể tải danh sách quận/huyện");
    }
  }

  async getWards(districtId: number): Promise<GHNWard[]> {
    try {
      const response = await this.makeRequest("/master-data/ward", {
        method: "POST",
        body: JSON.stringify({ district_id: districtId }),
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw new Error("Không thể tải danh sách phường/xã");
    }
  }
  async calculateShippingFee(params: {
    to_district_id: number;
    to_ward_code: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  }) {
    try {
      // Use mock values appropriate for clothing/fashion items
      const mockParams = {
        service_type_id: 2, // Standard service
        from_district_id: 1488, // Default from district (can be configured)
        from_ward_code: "1A0107", // Default from ward (can be configured)
        to_district_id: params.to_district_id,
        to_ward_code: params.to_ward_code,
        weight: Math.max(params.weight || 500, 250), // Min 250g, default 500g for clothing
        length: params.length || 30, // 30cm for folded clothing
        width: params.width || 20, // 20cm width
        height: params.height || 5, // 5cm height for folded clothing
        insurance_value: 0,
      };

      console.log(
        "Direct GHN shipping calculation with mock params:",
        mockParams
      );

      const response = await this.makeRequest("/v2/shipping-order/fee", {
        method: "POST",
        body: JSON.stringify(mockParams),
      });
      return response.data;
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
      throw new Error("Không thể tính phí vận chuyển");
    }
  }
}

export const directGhnService = new DirectGHNService();
export type { GHNProvince, GHNDistrict, GHNWard };
