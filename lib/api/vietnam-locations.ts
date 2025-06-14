// Vietnam Provinces API Client
// Using https://provinces.open-api.vn/api/

export interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
}

export interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  code_name: string;
  district_code: number;
}

class VietnamLocationApi {
  private baseUrl = "https://provinces.open-api.vn/api";
  private cache = new Map<string, any>();

  private async request<T>(endpoint: string, useCache = true): Promise<T> {
    const cacheKey = endpoint;

    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      console.log(`Vietnam Location API: Using cached data for ${endpoint}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`Vietnam Location API: Fetching ${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error("Vietnam Location API error:", error);
      throw error;
    }
  }

  // Get all provinces
  async getProvinces(): Promise<Province[]> {
    return this.request<Province[]>("/p/");
  }

  // Get districts by province code
  async getDistricts(provinceCode: number): Promise<District[]> {
    return this.request<District[]>(`/p/${provinceCode}?depth=2`).then(
      (data: any) => data.districts || []
    );
  }

  // Get wards by district code
  async getWards(districtCode: number): Promise<Ward[]> {
    return this.request<Ward[]>(`/d/${districtCode}?depth=2`).then(
      (data: any) => data.wards || []
    );
  }

  // Get full province info with districts
  async getProvinceWithDistricts(provinceCode: number): Promise<{
    province: Province;
    districts: District[];
  }> {
    const data = await this.request<any>(`/p/${provinceCode}?depth=2`);
    return {
      province: {
        code: data.code,
        name: data.name,
        name_en: data.name_en,
        full_name: data.full_name,
        full_name_en: data.full_name_en,
        code_name: data.code_name,
      },
      districts: data.districts || [],
    };
  }

  // Get full district info with wards
  async getDistrictWithWards(districtCode: number): Promise<{
    district: District;
    wards: Ward[];
  }> {
    const data = await this.request<any>(`/d/${districtCode}?depth=2`);
    return {
      district: {
        code: data.code,
        name: data.name,
        name_en: data.name_en,
        full_name: data.full_name,
        full_name_en: data.full_name_en,
        code_name: data.code_name,
        province_code: data.province_code,
      },
      wards: data.wards || [],
    };
  }
}

export const vietnamLocationApi = new VietnamLocationApi();

// Helper functions for easy use
export const getProvinces = () => vietnamLocationApi.getProvinces();
export const getDistricts = (provinceCode: number) =>
  vietnamLocationApi.getDistricts(provinceCode);
export const getWards = (districtCode: number) =>
  vietnamLocationApi.getWards(districtCode);
