"use client";

import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { Product } from "@/types";

export function useProductActions() {
  const { addItem: addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const handleAddToCart = async (
    product: Product,
    variantId?: string,
    quantity: number = 1
  ) => {
    try {
      const selectedVariant = product.variants?.[0] || {
        id: "default",
        sku: product.baseSku,
        price: product.basePrice,
        stockQuantity: 100,
        isActive: true,
        size: {
          id: "default",
          name: "Default",
          code: "DEFAULT",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        color: {
          id: "default",
          name: "Default",
          code: "DEFAULT",
          hexCode: "#000000",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [],
      };

      await addToCart({
        id: `${product.id}-${selectedVariant.id}`,
        quantity,
        maxQuantity: selectedVariant.stockQuantity,
        name: product.name,
        price: product.basePrice,
        imageUrl: product.image?.imageUrl || "",
        slug: product.slug,
        variant: selectedVariant,
      });
      toast.success("Đã thêm vào giỏ hàng", {
        description: "Sản phẩm đã được thêm vào giỏ hàng của bạn",
        action: {
          label: "Xem giỏ hàng",
          onClick: () => (window.location.href = "/cart"),
        },
      });
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!user) {
      toast.warning("Cần đăng nhập", {
        description: "Vui lòng đăng nhập để tiếp tục",
        action: {
          label: "Đăng nhập",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }
    try {
      const inWishlist = isInWishlist(product.id);

      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist(product);
        toast.success("Đã thêm vào danh sách yêu thích", {
          description: "Sản phẩm đã được lưu vào danh sách yêu thích",
        });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra", {
        description: "Vui lòng thử lại sau",
      });
    }
  };
  const handleQuickBuy = async (product: Product, variantId?: string) => {
    if (!user) {
      toast.warning("Cần đăng nhập", {
        description: "Vui lòng đăng nhập để tiếp tục",
        action: {
          label: "Đăng nhập",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    try {
      const selectedVariant = product.variants?.[0] || {
        id: "default",
        sku: product.baseSku,
        price: product.basePrice,
        stockQuantity: 100,
        isActive: true,
        size: {
          id: "default",
          name: "Default",
          code: "DEFAULT",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        color: {
          id: "default",
          name: "Default",
          code: "DEFAULT",
          hexCode: "#000000",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [],
      };

      await addToCart({
        id: `${product.id}-${selectedVariant.id}`,
        quantity: 1,
        maxQuantity: selectedVariant.stockQuantity,
        name: product.name,
        price: product.basePrice,
        imageUrl: product.image?.imageUrl || "",
        slug: product.slug,
        variant: selectedVariant,
      }); // Redirect to checkout
      window.location.href = "/checkout";
    } catch (error) {
      toast.error("Không thể mua ngay", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  return {
    handleAddToCart,
    handleToggleWishlist,
    handleQuickBuy,
    isInWishlist,
    user,
  };
}
