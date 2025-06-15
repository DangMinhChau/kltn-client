"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  Ruler,
  Palette,
  Tag,
  Users,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

import { Product, ProductVariant, ProductImage } from "@/types";
import { productApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantSelector } from "@/components/common/VariantSelector";
import ProductCard from "@/components/common/ProductCard";
import { WishlistButton } from "@/components/common/WishlistButton";
import { useCart } from "@/lib/context/CartContext";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/common/Loading";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem } = useCart();
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        console.log("=== Fetching Product ===");
        console.log("Slug:", slug);

        // Fetch product data
        const productData = await productApi.getProductBySlug(slug);
        console.log("Product data received:", productData); // Handle different response formats from backend
        const product = (productData as any).data || productData;
        console.log("Processed product:", product);

        setProduct(product); // Set default variant (prioritize variants with stock)
        if (product.variants && product.variants.length > 0) {
          const availableVariant =
            product.variants.find((v: ProductVariant) => v.stockQuantity > 0) ||
            product.variants[0];
          setSelectedVariant(availableVariant);
          console.log("Set default variant:", availableVariant.id);
        }

        // Fetch related products from the same category
        if (product.category?.slug) {
          try {
            const relatedResponse = await productApi.getProducts({
              category: product.category.slug,
              limit: 4,
              page: 1,
            }); // Handle different response formats
            const relatedData =
              (relatedResponse as any).data || relatedResponse;
            const products = Array.isArray(relatedData)
              ? relatedData
              : (relatedData as any).data || [];

            const filtered = products
              .filter((p: Product) => p.id !== product.id)
              .slice(0, 4);
            setRelatedProducts(filtered);
          } catch (error) {
            console.warn("Failed to fetch related products:", error);
            setRelatedProducts([]);
          }
        } else {
          // Fallback: fetch random products
          try {
            const randomResponse = await productApi.getProducts({
              limit: 4,
              page: 1,
            });
            const randomData = (randomResponse as any).data || randomResponse;
            const products = Array.isArray(randomData)
              ? randomData
              : (randomData as any).data || [];

            const filtered = products
              .filter((p: Product) => p.id !== product.id)
              .slice(0, 4);
            setRelatedProducts(filtered);
          } catch (error) {
            console.warn("Failed to fetch random products:", error);
            setRelatedProducts([]);
          }
        }
      } catch (error: any) {
        console.error("=== Error fetching product ===");
        console.error("Error details:", error);
        console.error("Slug was:", slug);

        if (error.response?.status === 404) {
          console.error("Product not found");
        } else {
          console.error("Network or server error");
        }
        notFound();
      } finally {
        console.log("=== Fetch completed, setting loading false ===");
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return <PageLoading />;
  }

  if (!product) {
    notFound();
  } // Get images for display - improved logic:
  // - If color selected (but not full variant): show all images of that color from all sizes
  // - If full variant selected: show only that variant's images, fallback to product image
  // - If no color selected: show ALL images (product + all variants)
  const getDisplayImages = () => {
    // If a specific variant is selected, prioritize that variant's images
    if (selectedVariant) {
      if (selectedVariant.images && selectedVariant.images.length > 0) {
        console.log(
          `Using images from selected variant: ${selectedVariant.id}`
        );
        return selectedVariant.images.sort((a, b) => a.sortOrder - b.sortOrder);
      } else {
        // Variant has no images, fallback to product main image
        console.log("Selected variant has no images, using product image");
        if (product.image) {
          return [product.image];
        }
      }
    }

    // If a color is selected (but not full variant), show all images of that color
    if (selectedColor && product.variants && product.variants.length > 0) {
      const colorImages: ProductImage[] = [];

      // Find all variants with the selected color and collect their images
      const colorVariants = product.variants.filter(
        (variant) => variant.color?.name === selectedColor
      );

      colorVariants.forEach((variant) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((img) => {
            // Avoid duplicates by checking imageUrl
            if (
              !colorImages.some(
                (existing) => existing.imageUrl === img.imageUrl
              )
            ) {
              colorImages.push(img);
            }
          });
        }
      });

      // If we found images for this color, return them
      if (colorImages.length > 0) {
        console.log(
          `Using ${colorImages.length} images from color: ${selectedColor}`
        );
        return colorImages.sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
      }
    } // If no variant is selected, collect ALL images from product and variants
    const allImages: ProductImage[] = [];

    // Add main product image first (highest priority)
    if (product.image) {
      allImages.push(product.image);
    }

    // Add product images array
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        // Avoid duplicates by checking imageUrl
        if (!allImages.some((existing) => existing.imageUrl === img.imageUrl)) {
          allImages.push(img);
        }
      });
    } // Add images from ALL variants when no specific color/variant is selected
    if (
      !selectedColor &&
      !selectedVariant &&
      product.variants &&
      product.variants.length > 0
    ) {
      product.variants.forEach((variant) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((img) => {
            // Avoid duplicates by checking imageUrl
            if (
              !allImages.some((existing) => existing.imageUrl === img.imageUrl)
            ) {
              allImages.push(img);
            }
          });
        }
      });
    }

    // Sort all images by sortOrder
    allImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Return all images, or fallback if none found
    return allImages.length > 0
      ? allImages
      : [
          {
            id: "fallback",
            imageUrl: "/placeholder-image.jpg",
            isPrimary: true,
            sortOrder: 0,
            altText: product.name,
          },
        ];
  };
  const displayImages = getDisplayImages();
  console.log("=== Product Detail Images Debug ===");
  console.log("Product exists:", !!product);
  if (product) {
    console.log("Product name:", product.name);
    console.log("Selected color:", selectedColor || "None");
    console.log("Selected variant:", selectedVariant?.id || "None");
    console.log("Selected variant color:", selectedVariant?.color || "None");
    console.log("Display images count:", displayImages.length);
    console.log(
      "Display images:",
      displayImages.map((img) => ({
        id: img.id,
        url: img.imageUrl?.substring(0, 50) + "...",
        isPrimary: img.isPrimary,
      }))
    );
    if (product.variants?.length) {
      console.log("Total variants:", product.variants.length);
      console.log(
        "Variants with images:",
        product.variants.filter((v) => (v.images?.length || 0) > 0).length
      );
    }
  }
  console.log("=== End Debug ===");
  const handleVariantChange = (variant: ProductVariant) => {
    console.log("=== Variant Change ===");
    console.log("Previous variant:", selectedVariant?.id || "None");
    console.log("New variant:", variant.id);
    console.log("New variant color:", variant.color?.name || "No color");
    console.log("New variant images count:", variant.images?.length || 0);
    if (variant.images?.length) {
      console.log(
        "New variant image URLs:",
        variant.images.map((img) => img.imageUrl.substring(0, 50) + "...")
      );
    }

    setSelectedVariant(variant);
    setSelectedColor(variant.color?.name);
    setSelectedImageIndex(0);
    // Reset quantity to 1 when changing variant to avoid exceeding new stock limit
    setQuantity(1);

    console.log("=== End Variant Change ===");
  };

  // Handler for when only color is selected (without full variant selection)
  const handleColorChange = (colorName: string) => {
    console.log("=== Color Change ===");
    console.log("Selected color:", colorName);

    setSelectedColor(colorName);
    setSelectedVariant(undefined); // Clear variant selection
    setSelectedImageIndex(0);

    console.log("=== End Color Change ===");
  };

  // Handler to clear both color and variant selection
  const handleClearSelection = () => {
    console.log("=== Clear Selection ===");
    setSelectedColor(undefined);
    setSelectedVariant(undefined);
    setSelectedImageIndex(0);
    console.log("=== End Clear Selection ===");
  };
  const handleAddToCart = () => {
    // For products without variants, create a default variant
    let variantToAdd: ProductVariant;
    if (!selectedVariant) {
      if (product.variants && product.variants.length > 0) {
        alert("Vui lòng chọn phiên bản sản phẩm");
        return;
      } // Create default variant for products without variants
      // Note: Variants don't have price fields - they use product price
      variantToAdd = {
        id: `default-${product.id}`,
        sku: product.baseSku,
        stockQuantity: 999, // Default stock for products without variants
        isActive: true,
      } as ProductVariant;
    } else {
      variantToAdd = selectedVariant;
    }

    // Check stock
    const stockQuantity = variantToAdd.stockQuantity;
    if (stockQuantity <= 0) {
      alert("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > stockQuantity) {
      alert(`Chỉ còn ${stockQuantity} sản phẩm trong kho`);
      return;
    }

    // Get the image to display in cart
    const cartImage = displayImages[0]?.imageUrl || "/placeholder-image.jpg";
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      quantity,
      maxQuantity: stockQuantity,
      name: product.name,
      price: priceInfo.price,
      discountPrice:
        priceInfo.hasDiscount && priceInfo.originalPrice
          ? priceInfo.originalPrice
          : undefined,
      imageUrl: cartImage,
      slug: product.slug,
      variant: variantToAdd,
    });

    // Show success message
    console.log(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng:`, {
      product: product.name,
      variant: selectedVariant
        ? `${selectedVariant.color?.name || ""} ${
            selectedVariant.size?.name || ""
          }`.trim()
        : "Default",
      quantity,
    });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };
  const getMaxQuantity = () => {
    if (selectedVariant) {
      return selectedVariant.stockQuantity;
    }
    // For products without variants, return a reasonable default
    return 999;
  };

  const incrementQuantity = () => {
    const maxQty = getMaxQuantity();
    if (quantity < maxQty) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    const maxQty = getMaxQuantity();
    setQuantity(Math.min(newQuantity, maxQty));
  };
  const formatPrice = (price: number) => {
    // Handle invalid prices
    if (isNaN(price) || price < 0) {
      return "Liên hệ";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }; // Calculate current price based on product base price
  // All variants share the same price from the product
  const getCurrentPrice = () => {
    // Handle base price safely
    let basePrice = 0;
    if (product.basePrice) {
      if (typeof product.basePrice === "string") {
        basePrice = parseFloat(product.basePrice);
      } else if (typeof product.basePrice === "number") {
        basePrice = product.basePrice;
      }
    }

    // Debug logging
    console.log("=== Price Debug ===");
    console.log("product.basePrice:", product.basePrice);
    console.log("parsed basePrice:", basePrice);
    console.log("isNaN(basePrice):", isNaN(basePrice));
    console.log("basePrice <= 0:", basePrice <= 0);
    console.log("product.discountPercent:", product.discountPercent);

    // Only consider price invalid if it's actually NaN or negative
    // A price of 0 is still valid (free product)
    if (isNaN(basePrice) || basePrice < 0) {
      console.log("Invalid base price detected");
      return {
        price: NaN,
        originalPrice: null,
        hasDiscount: false,
      };
    } // Apply discount if exists
    if (product.discountPercent && product.discountPercent > 0) {
      const discountedPrice = basePrice * (1 - product.discountPercent / 100);
      console.log("discounted price:", discountedPrice);
      return {
        price: discountedPrice,
        originalPrice: basePrice,
        hasDiscount: true,
      };
    }

    console.log("final price:", basePrice);
    return {
      price: basePrice,
      originalPrice: null,
      hasDiscount: false,
    };
  };

  const priceInfo = getCurrentPrice();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <span>Trang chủ</span>
          <span>/</span>
          <span>{product.category?.name || "Sản phẩm"}</span>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {" "}
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
              <img
                src={
                  displayImages[selectedImageIndex]?.imageUrl ||
                  "/placeholder-image.jpg"
                }
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  console.warn("Image failed to load, using fallback");
                  e.currentTarget.src = "/placeholder-image.jpg";
                }}
              />
              {displayImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}{" "}
              {priceInfo.hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                  {product.discountPercent
                    ? `-${Math.round(product.discountPercent)}%`
                    : "SALE"}
                </Badge>
              )}
            </div>
            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={image.id || index}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden border-2",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    )}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({product.totalReviews || 0} đánh giá)
                  </span>
                </div>
              </div>{" "}
              {/* SKU */}
              <p className="text-sm text-muted-foreground">
                SKU: {selectedVariant?.sku || product.baseSku}
              </p>{" "}
              {/* Product Tags - Quick info */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              {/* Short Description */}
              {product.description && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description.length > 150
                      ? `${product.description.substring(0, 150)}...`
                      : product.description}
                  </p>
                </div>
              )}
            </div>
            {/* Product Attributes */}
            {((product.materials?.length || 0) > 0 ||
              (product.collections?.length || 0) > 0 ||
              (product.styles?.length || 0) > 0) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-900">
                  Thông tin sản phẩm
                </h3>

                {product.materials && product.materials.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Palette className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Chất liệu:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {product.materials.map((m) => m.name).join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                {product.styles && product.styles.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Phong cách:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {product.styles.map((s) => s.name).join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                {product.collections && product.collections.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Bộ sưu tập:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {product.collections.map((c) => c.name).join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}{" "}
            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                {isNaN(priceInfo.price) ? (
                  <span className="text-2xl lg:text-3xl font-bold text-primary">
                    Liên hệ để biết giá
                  </span>
                ) : (
                  <>
                    <span className="text-2xl lg:text-3xl font-bold text-primary">
                      {formatPrice(priceInfo.price)}
                    </span>
                    {priceInfo.hasDiscount &&
                      priceInfo.originalPrice &&
                      !isNaN(priceInfo.originalPrice) && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(priceInfo.originalPrice)}
                        </span>
                      )}
                  </>
                )}
              </div>
              {priceInfo.hasDiscount &&
                priceInfo.originalPrice &&
                !isNaN(priceInfo.originalPrice) &&
                !isNaN(priceInfo.price) && (
                  <div className="text-sm text-green-600 font-medium">
                    Tiết kiệm{" "}
                    {formatPrice(priceInfo.originalPrice - priceInfo.price)}
                  </div>
                )}
            </div>{" "}
            {/* Stock Status */}
            <div>
              {product.variants && product.variants.length > 0 ? (
                selectedVariant ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        selectedVariant.stockQuantity > 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedVariant.stockQuantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {selectedVariant.stockQuantity > 0
                        ? `Còn ${selectedVariant.stockQuantity} sản phẩm`
                        : "Hết hàng"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-muted-foreground">
                      Chọn phiên bản để xem tình trạng kho
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Sẵn có
                  </span>
                </div>
              )}
            </div>{" "}
            {/* Color and Variant Selector */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-4">
                {/* Color Selection - Independent */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Màu sắc:{" "}
                    {selectedColor && (
                      <span className="text-gray-900">{selectedColor}</span>
                    )}
                  </label>{" "}
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        (product.variants || [])
                          .filter((v) => v.color?.name)
                          .map((v) => v.color!.name)
                      )
                    ).map((colorName) => {
                      const colorVariant = (product.variants || []).find(
                        (v) => v.color?.name === colorName
                      );
                      const color = colorVariant?.color;
                      const hasStock = (product.variants || []).some(
                        (v) =>
                          v.color?.name === colorName && v.stockQuantity > 0
                      );
                      const isSelected = selectedColor === colorName;

                      return (
                        <button
                          key={colorName}
                          onClick={() => handleColorChange(colorName)}
                          disabled={!hasStock}
                          className={`
                            w-10 h-10 relative rounded-full border-2 transition-all duration-200
                            ${
                              isSelected
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-300 hover:border-gray-400"
                            }
                            ${
                              !hasStock
                                ? "opacity-40 cursor-not-allowed"
                                : "cursor-pointer hover:scale-110"
                            }
                          `}
                          style={{
                            backgroundColor: color?.hexCode || "#gray",
                          }}
                          title={colorName}
                        >
                          {!hasStock && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection - Only show when color is selected */}
                {selectedColor && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kích thước:{" "}
                      {selectedVariant?.size?.name && (
                        <span className="text-gray-900">
                          {selectedVariant.size.name}
                        </span>
                      )}
                    </label>{" "}
                    <div className="flex flex-wrap gap-2">
                      {(product.variants || [])
                        .filter((v) => v.color?.name === selectedColor)
                        .map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const hasStock = variant.stockQuantity > 0;

                          return (
                            <button
                              key={variant.id}
                              onClick={() => handleVariantChange(variant)}
                              disabled={!hasStock}
                              className={`
                                px-4 py-2 border rounded-md transition-all duration-200 font-medium
                                ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                                }
                                ${
                                  !hasStock
                                    ? "opacity-40 cursor-not-allowed line-through"
                                    : "cursor-pointer hover:shadow-md"
                                }
                              `}
                            >
                              {variant.size?.name || variant.sku}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Button to clear color/variant selection and show all images */}
                {(selectedColor || selectedVariant) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-sm"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Xem tất cả ảnh
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Sản phẩm chuẩn</strong> - Không có biến thể khác
                </p>
              </div>
            )}
            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Số lượng:
                </Label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>{" "}
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-16 text-center border-0 focus-visible:ring-0"
                    min="1"
                    max={getMaxQuantity()}
                  />{" "}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementQuantity}
                    disabled={quantity >= getMaxQuantity()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                {" "}
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    ((product.variants?.length || 0) > 0 && !selectedVariant) ||
                    (selectedVariant && selectedVariant.stockQuantity === 0) ||
                    quantity <= 0 ||
                    isNaN(priceInfo.price)
                  }
                  className="flex-1"
                  size="lg"
                >
                  {" "}
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isNaN(priceInfo.price)
                    ? "Liên hệ"
                    : selectedVariant && selectedVariant.stockQuantity === 0
                    ? "Hết hàng"
                    : "Thêm vào giỏ hàng"}
                </Button>
                <WishlistButton product={product} size="lg" />
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Miễn phí vận chuyển</p>
                <p className="text-xs text-muted-foreground">
                  Đơn hàng từ 500k
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Đổi trả dễ dàng</p>
                <p className="text-xs text-muted-foreground">Trong 30 ngày</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Bảo hành chính hãng</p>
                <p className="text-xs text-muted-foreground">12 tháng</p>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
            <TabsTrigger value="specifications">Thông tin chi tiết</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  {product.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Chưa có mô tả cho sản phẩm này.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4" />
                        Danh mục
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {product.category?.name || "Chưa phân loại"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Ruler className="h-4 w-4" />
                        SKU gốc
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {product.baseSku}
                      </p>
                    </div>{" "}
                    {product.materials && product.materials.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Layers className="h-4 w-4 text-blue-600" />
                          Chất liệu
                        </div>
                        <div className="ml-6 space-y-2">
                          {product.materials.map((material) => (
                            <div
                              key={material.id}
                              className="border border-blue-100 rounded-lg p-3 bg-blue-50/50"
                            >
                              <span className="font-medium text-blue-900">
                                {material.name}
                              </span>
                              {material.description && (
                                <span className="block text-xs text-blue-700 mt-1">
                                  {material.description}
                                </span>
                              )}
                              {material.careInstructions && (
                                <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                  <span className="font-medium text-blue-900">
                                    💡 Hướng dẫn bảo quản:
                                  </span>
                                  <span className="text-blue-800">
                                    {material.careInstructions}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}{" "}
                    {product.styles && product.styles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          Phong cách
                        </div>
                        <div className="ml-6 space-y-2">
                          {product.styles.map((style) => (
                            <div
                              key={style.id}
                              className="border border-purple-100 rounded-lg p-3 bg-purple-50/50"
                            >
                              <span className="font-medium text-purple-900">
                                {style.name}
                              </span>
                              {style.description && (
                                <span className="block text-xs text-purple-700 mt-1">
                                  {style.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}{" "}
                    {product.collections && product.collections.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Package className="h-4 w-4 text-green-600" />
                          Bộ sưu tập
                        </div>
                        <div className="ml-6 space-y-2">
                          {product.collections.map((collection) => (
                            <div
                              key={collection.id}
                              className="border border-green-100 rounded-lg p-3 bg-green-50/50"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-green-900">
                                  {collection.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-green-300 text-green-700"
                                >
                                  {collection.season} {collection.year}
                                </Badge>
                              </div>
                              {collection.description && (
                                <span className="block text-xs text-green-700">
                                  {collection.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}{" "}
                    {product.tags && product.tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Tag className="h-4 w-4 text-orange-600" />
                          Thẻ
                        </div>
                        <div className="ml-6 flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
                            >
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">
                          Thông tin phiên bản đã chọn
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Palette className="h-4 w-4" />
                              Màu sắc
                            </div>
                            <div className="ml-6 flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor:
                                    selectedVariant.color?.hexCode || "#ccc",
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {selectedVariant.color?.name || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Ruler className="h-4 w-4" />
                              Kích thước
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {selectedVariant.size?.name || "N/A"}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Tag className="h-4 w-4" />
                              SKU phiên bản
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {selectedVariant.sku}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Users className="h-4 w-4" />
                              Số lượng tồn kho
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              {selectedVariant.stockQuantity} sản phẩm
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}{" "}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  showQuickView
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
