import { Product, ProductVariant } from "@/types";

export interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  showVariantSelector?: boolean;
  className?: string;
  variant?: "card" | "list";
}

export interface ProductImageProps {
  product: Product;
  imageLoading: boolean;
  onImageLoad: () => void;
  variant?: "card" | "list";
  className?: string;
}

export interface ProductBadgesProps {
  product: Product;
  stockStatus: {
    status: string;
    label: string;
    color: string;
  };
  className?: string;
}

export interface ProductInfoProps {
  product: Product;
  actualPrice: number;
  hasDiscount: boolean;
  stockStatus: {
    status: string;
    label: string;
    color: string;
  };
  variant?: "card" | "list";
  className?: string;
}

export interface ProductVariantsProps {
  uniqueColors: string[];
  uniqueSizes: string[];
  product: Product;
  maxDisplay?: number;
  className?: string;
}

export interface ProductActionsProps {
  product: Product;
  showQuickView?: boolean;
  onQuickView: (e: React.MouseEvent) => void;
  variant?: "card" | "list";
  className?: string;
}
