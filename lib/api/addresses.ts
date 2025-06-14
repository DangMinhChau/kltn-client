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
}

// Update address request
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Address API
export const addressApi = {
  // Get all user addresses
  getAddresses: (): Promise<Address[]> => api.get("/addresses"),

  // Get single address by ID
  getAddress: (id: string): Promise<Address> => api.get(`/addresses/${id}`),

  // Create new address
  createAddress: (addressData: CreateAddressRequest): Promise<Address> =>
    api.post("/addresses", addressData),

  // Update address
  updateAddress: (
    id: string,
    addressData: UpdateAddressRequest
  ): Promise<Address> => api.patch(`/addresses/${id}`, addressData),

  // Delete address
  deleteAddress: (id: string): Promise<void> => api.delete(`/addresses/${id}`),
  // Set default address
  setDefaultAddress: (id: string): Promise<Address> =>
    api.patch(`/addresses/${id}/set-default`),

  // Get default address
  getDefaultAddress: (): Promise<Address | null> =>
    api.get("/addresses/default"),
};

// Admin Address API (for admin access to user addresses)
export const adminAddressApi = {
  // ✅ NEW: Get user addresses (Admin only)
  getUserAddresses: (userId: string): Promise<Address[]> =>
    api.get(`/addresses/user/${userId}`),
};

export default addressApi;
