"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Product } from "@/types";

interface WishlistItem {
  id: string;
  product: Product;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
}

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

type WishlistAction =
  | { type: "ADD_TO_WISHLIST"; payload: Product }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

function wishlistReducer(
  state: WishlistState,
  action: WishlistAction
): WishlistState {
  switch (action.type) {
    case "ADD_TO_WISHLIST": {
      // Check if product already exists in wishlist
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );

      if (existingItem) {
        return state; // Don't add duplicate
      }

      const newItem: WishlistItem = {
        id: action.payload.id,
        product: action.payload,
        addedAt: new Date(),
      };

      const updatedItems = [...state.items, newItem];

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
      };
    }

    case "REMOVE_FROM_WISHLIST": {
      const updatedItems = state.items.filter(
        (item) => item.product.id !== action.payload
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
      };
    }

    case "CLEAR_WISHLIST": {
      return {
        ...state,
        items: [],
        totalItems: 0,
      };
    }

    case "LOAD_WISHLIST": {
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.length,
      };
    }

    default:
      return state;
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Convert addedAt strings back to Date objects
        const wishlistWithDates = parsedWishlist.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: "LOAD_WISHLIST", payload: wishlistWithDates });
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [state.items]);

  const addToWishlist = (product: Product) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: product });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some((item) => item.product.id === productId);
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const value: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

export default WishlistContext;
