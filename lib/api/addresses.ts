import api from "../api";

// Address interface
export interface Address {
  id: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  // GHN fields
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceCode?: string;
  ghnDistrictCode?: string;
}

// Create address request
export interface CreateAddressRequest {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
  // GHN fields - match backend DTO
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceCode?: string;
  ghnDistrictCode?: string;
}

// Update address request
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Address API
export const addressApi = {
  // Get all user addresses
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get("/addresses");
    const responseBody = response.data;
    // Backend returns: { message, data: Address[], meta: { timestamp, total } }
    return responseBody.data || [];
  },

  // Get single address by ID
  getAddress: async (id: string): Promise<Address> => {
    const response = await api.get(`/addresses/${id}`);
    const responseBody = response.data;
    // Backend returns: { message, data: Address, meta: { timestamp } }
    return responseBody.data;
  },

  // Create new address
  createAddress: async (
    addressData: CreateAddressRequest
  ): Promise<Address> => {
    const response = await api.post("/addresses", addressData);
    const responseBody = response.data;
    // Backend returns: { message, data: Address, meta: { timestamp } }
    return responseBody.data;
  },

  // Update address
  updateAddress: async (
    id: string,
    addressData: UpdateAddressRequest
  ): Promise<Address> => {
    const response = await api.patch(`/addresses/${id}`, addressData);
    const responseBody = response.data;
    // Backend returns: { message, data: Address, meta: { timestamp } }
    return responseBody.data;
  },

  // Delete address
  deleteAddress: async (id: string): Promise<void> => {
    const response = await api.delete(`/addresses/${id}`);
    // Backend returns: { message, data: null, meta: { timestamp } }
    // No need to return data for delete operation
  },
  // Set default address (using update endpoint)
  setDefaultAddress: async (id: string): Promise<Address> => {
    const response = await api.patch(`/addresses/${id}`, { isDefault: true });
    const responseBody = response.data;
    // Backend returns: { message, data: Address, meta: { timestamp } }
    return responseBody.data;
  },

  // Get default address
  getDefaultAddress: async (): Promise<Address | null> => {
    const response = await api.get("/addresses/default");
    const responseBody = response.data;
    // Backend returns: { message, data: Address | null, meta: { timestamp } }
    return responseBody.data;
  },
};

// Admin Address API (for admin access to user addresses)
export const adminAddressApi = {
  // ✅ NEW: Get user addresses (Admin only)
  getUserAddresses: async (userId: string): Promise<Address[]> => {
    const response = await api.get(`/addresses/user/${userId}`);
    const responseBody = response.data;
    // Backend returns: { message, data: Address[], meta: { timestamp, total } }
    return responseBody.data || [];
  },
};

export default addressApi;
