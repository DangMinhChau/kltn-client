import { useState, useEffect, useCallback } from "react";
import { addressApi, Address } from "@/lib/api/addresses";
import { toast } from "sonner";

interface UseAddressesReturn {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  error: string | null;
  loadAddresses: () => Promise<void>;
  selectAddress: (address: Address) => void;
  refreshAddresses: () => Promise<void>;
}

export const useAddresses = (autoSelectDefault = true): UseAddressesReturn => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await addressApi.getAddresses();
      setAddresses(data);

      // Auto-select default address if enabled and no address is currently selected
      if (autoSelectDefault && !selectedAddress && data.length > 0) {
        const defaultAddress = data.find((addr) => addr.isDefault) || data[0];
        setSelectedAddress(defaultAddress);
      }
    } catch (error: any) {
      console.error("Failed to load addresses:", error);

      // Handle specific error cases
      if (error?.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn");
        // Don't show toast here as the API interceptor will handle redirect
      } else if (error?.response?.status >= 500) {
        setError("Lỗi server, vui lòng thử lại sau");
        toast.error("Lỗi server, vui lòng thử lại sau");
      } else if (error?.code === "NETWORK_ERROR" || !error?.response) {
        setError("Lỗi kết nối mạng");
        toast.error("Lỗi kết nối mạng, vui lòng kiểm tra internet");
      } else {
        setError("Không thể tải danh sách địa chỉ");
        toast.error("Không thể tải danh sách địa chỉ");
      }

      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [autoSelectDefault, selectedAddress]);

  const selectAddress = useCallback((address: Address) => {
    setSelectedAddress(address);
  }, []);

  const refreshAddresses = useCallback(async () => {
    await loadAddresses();
  }, [loadAddresses]);

  // Load addresses on hook initialization
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    selectedAddress,
    loading,
    error,
    loadAddresses,
    selectAddress,
    refreshAddresses,
  };
};
