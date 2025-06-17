"use client";

// Export the local cart as the main cart system
export {
  useLocalCart as useCart,
  LocalCartProvider as CartProvider,
} from "./LocalCartContext";

// Export auth context
export { useAuth, AuthProvider } from "./AuthContext";
