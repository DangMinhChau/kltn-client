"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CartItem } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface LocalCartContextType {
  // Cart state
  items: CartItem[];
  loading: boolean;
  error: string | null;

  // Cart actions
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;

  // Cart UI state
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed values
  totalItems: number;
  totalAmount: number;

  // Validation
  validateCart: () => Promise<void>;
}

const LocalCartContext = createContext<LocalCartContextType | undefined>(
  undefined
);

export function LocalCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        setItems(cartItems);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setItems([]);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items]);

  // Fetch variant data from server (only for validation)
  const fetchVariantData = async (variantId: string) => {
    try {
      const response = await api.get(`/variants/${variantId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Failed to fetch variant ${variantId}:`, error);
      throw new Error("Could not fetch product details");
    }
  };

  // Add item to cart (local only)
  const addToCart = useCallback(
    async (variantId: string, quantity: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fresh variant data to get product info and pricing
        const variantData = await fetchVariantData(variantId);

        if (!variantData) {
          throw new Error("Product not found");
        }

        if (!variantData.isActive) {
          throw new Error("Product is not available");
        }

        // We'll check stock when validating cart, not when adding
        const basePrice = variantData.product.basePrice || 0;
        const discountPercent = variantData.product.discountPercent || 0;
        const discountPrice =
          discountPercent > 0
            ? basePrice * (1 - discountPercent / 100)
            : undefined;

        const imageUrl =
          variantData.images?.[0]?.imageUrl ||
          variantData.product.images?.[0]?.url ||
          variantData.product.mainImageUrl ||
          "/placeholder-image.jpg";

        setItems((prevItems) => {
          const existingIndex = prevItems.findIndex(
            (item) => item.variant.id === variantId
          );

          if (existingIndex >= 0) {
            // Update existing item
            const existingItem = prevItems[existingIndex];
            const newQuantity = existingItem.quantity + quantity;

            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQuantity,
              price: basePrice,
              discountPrice,
            };
            return updatedItems;
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `local-${variantId}`,
              quantity,
              maxQuantity: variantData.stockQuantity || 999, // Store for reference
              name: variantData.product.name || "Unnamed Product",
              price: basePrice,
              discountPrice,
              imageUrl,
              image: imageUrl,
              slug: variantData.product.slug || "",
              variant: variantData,
              color: variantData.color?.name || "",
              size: variantData.size?.name || "",
              sku: variantData.sku || "",
            };
            return [...prevItems, newItem];
          }
        });

        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      } catch (err: any) {
        setError(err.message);
        toast.error(
          err.message || "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update item quantity (local only)
  const updateItemQuantity = useCallback(
    (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(variantId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.variant.id === variantId) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    },
    []
  );

  // Remove item from cart (local only)
  const removeItem = useCallback((variantId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.variant.id !== variantId)
    );
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
  }, []);

  // Clear cart (local only)
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
    toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng!");
  }, []);

  // Validate cart against current stock (only when needed)
  const validateCart = useCallback(async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);
      const updatedItems: CartItem[] = [];
      let hasChanges = false;

      for (const item of items) {
        try {
          const variantData = await fetchVariantData(item.variant.id);

          if (!variantData || !variantData.isActive) {
            // Product no longer available
            toast.error(
              `Sản phẩm "${item.name}" không còn có sẵn và đã được xóa khỏi giỏ hàng`
            );
            hasChanges = true;
            continue;
          }

          const currentStock = variantData.stockQuantity || 0;
          let adjustedQuantity = item.quantity;

          // Check if quantity exceeds current stock
          if (item.quantity > currentStock) {
            if (currentStock > 0) {
              adjustedQuantity = currentStock;
              toast.warning(
                `Số lượng "${item.name}" đã được điều chỉnh từ ${item.quantity} về ${adjustedQuantity} do không đủ hàng`
              );
              hasChanges = true;
            } else {
              toast.error(
                `"${item.name}" đã hết hàng và được xóa khỏi giỏ hàng`
              );
              hasChanges = true;
              continue;
            }
          }

          // Update pricing if needed
          const basePrice = variantData.product.basePrice || 0;
          const discountPercent = variantData.product.discountPercent || 0;
          const discountPrice =
            discountPercent > 0
              ? basePrice * (1 - discountPercent / 100)
              : undefined;

          updatedItems.push({
            ...item,
            quantity: adjustedQuantity,
            maxQuantity: currentStock,
            price: basePrice,
            discountPrice,
            variant: variantData,
          });
        } catch (error) {
          console.error(
            `Failed to validate variant ${item.variant.id}:`,
            error
          );
          // Keep the item but show warning
          toast.warning(`Không thể kiểm tra tồn kho cho "${item.name}"`);
          updatedItems.push(item);
        }
      }

      if (hasChanges) {
        setItems(updatedItems);
      }
    } catch (error) {
      console.error("Failed to validate cart:", error);
      setError("Không thể kiểm tra tồn kho sản phẩm");
      toast.error("Không thể kiểm tra tồn kho sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Cart UI actions
  const openCart = useCallback(() => {
    setIsCartOpen(true);
    // Validate cart when opening
    if (items.length > 0) {
      validateCart();
    }
  }, [items, validateCart]);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => {
    if (!isCartOpen) {
      openCart();
    } else {
      closeCart();
    }
  }, [isCartOpen, openCart, closeCart]);

  // Computed values
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value: LocalCartContextType = {
    items,
    loading,
    error,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    totalItems,
    totalAmount,
    validateCart,
  };

  return (
    <LocalCartContext.Provider value={value}>
      {children}
    </LocalCartContext.Provider>
  );
}

export function useLocalCart() {
  const context = useContext(LocalCartContext);
  if (!context) {
    throw new Error("useLocalCart must be used within LocalCartProvider");
  }
  return context;
}

// Export as default cart for backward compatibility
export { useLocalCart as useCart };
