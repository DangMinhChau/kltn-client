import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in VND
export function formatPrice(price: number): string {
  console.log("formatPrice called with:", price, typeof price);
  if (typeof price !== "number" || isNaN(price)) {
    console.warn("formatPrice received invalid price:", price);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(0);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Format currency - alias for formatPrice for consistency
export function formatCurrency(price: number): string {
  return formatPrice(price);
}

// Format date with time
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

// Format date only (without time)
export function formatDateOnly(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

// Calculate discounted price
export function calculateDiscountedPrice(
  basePrice: number,
  discountPercent: number
): number {
  return basePrice - (basePrice * discountPercent) / 100;
}

// Format number with thousands separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Generate product URL
export function generateProductUrl(slug: string): string {
  return `/products/${slug}`;
}

// Generate category URL
export function generateCategoryUrl(slug: string): string {
  return `/categories/${slug}`;
}

// Generate collection URL
export function generateCollectionUrl(slug: string): string {
  return `/collections/${slug}`;
}

// Get stock status
export function getStockStatus(stockQuantity: number): {
  status: "in-stock" | "low-stock" | "out-of-stock";
  label: string;
  color: string;
} {
  if (stockQuantity === 0) {
    return {
      status: "out-of-stock",
      label: "Hết hàng",
      color: "text-red-600",
    };
  } else if (stockQuantity <= 5) {
    return {
      status: "low-stock",
      label: `Chỉ còn ${stockQuantity} sản phẩm`,
      color: "text-orange-600",
    };
  } else {
    return {
      status: "in-stock",
      label: "Còn hàng",
      color: "text-green-600",
    };
  }
}

// Generate star rating
export function generateStarRating(
  rating: number,
  maxRating: number = 5
): string[] {
  const stars: string[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push("full");
  }

  if (hasHalfStar) {
    stars.push("half");
  }

  while (stars.length < maxRating) {
    stars.push("empty");
  }

  return stars;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check if image URL is valid
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Get placeholder image
export function getPlaceholderImage(
  width: number = 300,
  height: number = 300
): string {
  return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=${width}&h=${height}&fit=crop&crop=center`;
}
