"use client";

// Re-export unified cart as the main cart hook for backward compatibility
export {
  useUnifiedCart as useCart,
  UnifiedCartProvider as CartProvider,
} from "./UnifiedCartContext";

// Also export the original for specific use cases
export {
  useCart as useLocalCart,
  CartProvider as LocalCartProvider,
} from "./CartContext";

export { useApiCart, ApiCartProvider } from "./ApiCartContext";

// Keep original types for compatibility
export type { CartState, CartContextType } from "@/types";
