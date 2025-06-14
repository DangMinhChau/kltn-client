import { useState, useCallback } from "react";
import { adminApi } from "@/lib/api/admin";
import { useToast } from "@/components/ui/use-toast";

export interface UseMutationOptions<T = any> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export interface UseMutationReturn<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
  data: TData | null;
  reset: () => void;
}

export function useAdminMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData> = {}
): UseMutationReturn<TData, TVariables> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = "Operation completed successfully",
  } = options;

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setLoading(true);
        setError(null);

        const result = await mutationFn(variables);
        setData(result);

        if (showSuccessToast) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        if (showErrorToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      mutationFn,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      toast,
    ]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

// User mutations
export function useCreateUser() {
  return useAdminMutation((userData: any) => adminApi.users.create(userData), {
    successMessage: "User created successfully",
  });
}

export function useUpdateUser() {
  return useAdminMutation(
    ({ id, ...userData }: { id: string } & any) =>
      adminApi.users.update(id, userData),
    { successMessage: "User updated successfully" }
  );
}

export function useDeleteUser() {
  return useAdminMutation((id: string) => adminApi.users.delete(id), {
    successMessage: "User deleted successfully",
  });
}

export function useActivateUser() {
  return useAdminMutation((id: string) => adminApi.users.activate(id), {
    successMessage: "User activated successfully",
  });
}

export function useDeactivateUser() {
  return useAdminMutation((id: string) => adminApi.users.deactivate(id), {
    successMessage: "User deactivated successfully",
  });
}

// Product mutations
export function useCreateProduct() {
  return useAdminMutation(
    (productData: any) => adminApi.products.create(productData),
    { successMessage: "Product created successfully" }
  );
}

export function useUpdateProduct() {
  return useAdminMutation(
    ({ id, ...productData }: { id: string } & any) =>
      adminApi.products.update(id, productData),
    { successMessage: "Product updated successfully" }
  );
}

export function useDeleteProduct() {
  return useAdminMutation((id: string) => adminApi.products.delete(id), {
    successMessage: "Product deleted successfully",
  });
}

export function useActivateProduct() {
  return useAdminMutation((id: string) => adminApi.products.activate(id), {
    successMessage: "Product activated successfully",
  });
}

export function useDeactivateProduct() {
  return useAdminMutation((id: string) => adminApi.products.deactivate(id), {
    successMessage: "Product deactivated successfully",
  });
}

export function useUploadProductImages() {
  return useAdminMutation(
    ({ productId, files }: { productId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
      return adminApi.products.uploadImages(productId, formData);
    },
    { successMessage: "Images uploaded successfully" }
  );
}

// Order mutations
export function useUpdateOrderStatus() {
  return useAdminMutation(
    ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      adminApi.orders.updateStatus(id, status, notes),
    { successMessage: "Order status updated successfully" }
  );
}

export function useBulkOrderStatusUpdate() {
  return useAdminMutation(
    (orders: { id: string; status: string }[]) =>
      adminApi.orders.bulkUpdateStatus(orders),
    { successMessage: "Orders updated successfully" }
  );
}

export function useExportOrders() {
  return useAdminMutation((filters: any) => adminApi.orders.export(filters), {
    successMessage: "Orders exported successfully",
  });
}

// Review mutations
export function useUpdateReviewStatus() {
  return useAdminMutation(
    ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected" | "pending";
    }) => adminApi.reviews.updateStatus(id, status),
    { successMessage: "Review status updated successfully" }
  );
}

export function useBulkReviewAction() {
  return useAdminMutation(
    ({
      action,
      reviewIds,
    }: {
      action: "approve" | "reject" | "delete";
      reviewIds: string[];
    }) => {
      switch (action) {
        case "approve":
          return adminApi.reviews.bulkApprove(reviewIds);
        case "reject":
          return adminApi.reviews.bulkReject(reviewIds);
        case "delete":
          return adminApi.reviews.bulkDelete(reviewIds);
        default:
          throw new Error("Invalid action");
      }
    },
    { successMessage: "Bulk action completed successfully" }
  );
}

export function useDeleteReview() {
  return useAdminMutation((id: string) => adminApi.reviews.delete(id), {
    successMessage: "Review deleted successfully",
  });
}

// Additional review mutations
export function useApproveReview() {
  return useAdminMutation((id: string) => adminApi.reviews.approve(id), {
    successMessage: "Review approved successfully",
  });
}

export function useRejectReview() {
  return useAdminMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.reviews.reject(id, reason),
    { successMessage: "Review rejected successfully" }
  );
}

export function useRespondToReview() {
  return useAdminMutation(
    ({ id, response }: { id: string; response: string }) =>
      adminApi.reviews.respond(id, response),
    { successMessage: "Response added successfully" }
  );
}

// Voucher mutations
export function useCreateVoucher() {
  return useAdminMutation(
    (voucherData: any) => adminApi.vouchers.create(voucherData),
    { successMessage: "Voucher created successfully" }
  );
}

export function useUpdateVoucher() {
  return useAdminMutation(
    ({ id, ...voucherData }: { id: string } & any) =>
      adminApi.vouchers.update(id, voucherData),
    { successMessage: "Voucher updated successfully" }
  );
}

export function useDeleteVoucher() {
  return useAdminMutation((id: string) => adminApi.vouchers.delete(id), {
    successMessage: "Voucher deleted successfully",
  });
}

export function useActivateVoucher() {
  return useAdminMutation((id: string) => adminApi.vouchers.activate(id), {
    successMessage: "Voucher activated successfully",
  });
}

export function useDeactivateVoucher() {
  return useAdminMutation((id: string) => adminApi.vouchers.deactivate(id), {
    successMessage: "Voucher deactivated successfully",
  });
}

export function useBulkVoucherAction() {
  return useAdminMutation(
    ({
      action,
      voucherIds,
    }: {
      action: "activate" | "deactivate" | "delete";
      voucherIds: string[];
    }) => {
      switch (action) {
        case "activate":
          return adminApi.vouchers.bulkActivate(voucherIds);
        case "deactivate":
          return adminApi.vouchers.bulkDeactivate(voucherIds);
        case "delete":
          return adminApi.vouchers.bulkDelete(voucherIds);
        default:
          throw new Error("Invalid action");
      }
    },
    { successMessage: "Bulk action completed successfully" }
  );
}

export function useExportVouchers() {
  return useAdminMutation(
    (filters?: {
      status?: string;
      type?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      format?: "csv" | "xlsx";
    }) => {
      const exportFilters = {
        format: "csv",
        ...filters,
      };
      return adminApi.vouchers.export(exportFilters);
    },
    {
      successMessage: "Vouchers exported successfully",
      showSuccessToast: false, // We'll handle the download differently
    }
  );
}

// Category mutations
export function useCreateCategory() {
  return useAdminMutation(
    (categoryData: {
      name: string;
      slug: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
    }) => adminApi.categories.create(categoryData),
    { successMessage: "Category created successfully" }
  );
}

export function useUpdateCategory() {
  return useAdminMutation(
    ({ id, ...categoryData }: { id: string } & any) =>
      adminApi.categories.update(id, categoryData),
    { successMessage: "Category updated successfully" }
  );
}

export function useDeleteCategory() {
  return useAdminMutation((id: string) => adminApi.categories.delete(id), {
    successMessage: "Category deleted successfully",
  });
}

// Collections mutations
export function useCreateCollection() {
  return useAdminMutation(
    (collectionData: {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
    }) => adminApi.collections.create(collectionData),
    { successMessage: "Collection created successfully" }
  );
}

export function useUpdateCollection() {
  return useAdminMutation(
    ({ id, ...collectionData }: { id: string } & any) =>
      adminApi.collections.update(id, collectionData),
    { successMessage: "Collection updated successfully" }
  );
}

export function useDeleteCollection() {
  return useAdminMutation((id: string) => adminApi.collections.delete(id), {
    successMessage: "Collection deleted successfully",
  });
}

// Shipping mutations
export function useCreateShippingMethod() {
  return useAdminMutation(
    (shippingData: any) => adminApi.shipping.create(shippingData),
    { successMessage: "Shipping method created successfully" }
  );
}

export function useUpdateShippingMethod() {
  return useAdminMutation(
    ({ id, ...shippingData }: { id: string } & any) =>
      adminApi.shipping.update(id, shippingData),
    { successMessage: "Shipping method updated successfully" }
  );
}

export function useDeleteShippingMethod() {
  return useAdminMutation((id: string) => adminApi.shipping.delete(id), {
    successMessage: "Shipping method deleted successfully",
  });
}

// File upload mutations
export function useUploadFile() {
  return useAdminMutation((file: File) => adminApi.files.upload(file), {
    successMessage: "File uploaded successfully",
  });
}

export function useBulkUploadFiles() {
  return useAdminMutation(
    (files: FileList) => adminApi.files.bulkUpload(files),
    { successMessage: "Files uploaded successfully" }
  );
}

// Import/Export mutations
export function useImportData() {
  return useAdminMutation(
    ({ type, file }: { type: "users" | "products" | "orders"; file: File }) => {
      switch (type) {
        case "users":
          return adminApi.users.import(file);
        case "products":
          return adminApi.products.import(file);
        case "orders":
          return adminApi.orders.import(file);
        default:
          throw new Error("Invalid import type");
      }
    },
    { successMessage: "Data imported successfully" }
  );
}

// System mutations
export function useClearCache() {
  return useAdminMutation(() => adminApi.system.clearCache(), {
    successMessage: "Cache cleared successfully",
  });
}

export function useBackupData() {
  return useAdminMutation(() => adminApi.system.backup(), {
    successMessage: "Backup created successfully",
  });
}
