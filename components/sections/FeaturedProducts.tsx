"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/common/ProductCard";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { ArrowRight, TrendingUp, Star, Flame } from "lucide-react";
import Link from "next/link";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productApi.getFeaturedProducts(8);
        console.log("📦 Featured products response:", response);

        // Handle different response structures
        let products = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (
          response &&
          (response as any).data &&
          Array.isArray((response as any).data)
        ) {
          products = (response as any).data;
        } else {
          console.warn("⚠️ Unexpected response structure:", response);
          products = [];
        }

        setProducts(products);
      } catch (err) {
        setError("Không thể tải sản phẩm nổi bật");
        console.error("❌ Error fetching featured products:", err);
        setProducts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const ProductSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Sản phẩm nổi bật
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Bestsellers của chúng tôi
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Khám phá những sản phẩm được yêu thích nhất, được khách hàng tin
            tưởng và lựa chọn
          </p>
        </div>{" "}
        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showQuickView={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Hiện tại chưa có sản phẩm nổi bật nào
            </p>
            <Button asChild variant="outline">
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        )}
        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center">
            <Button asChild size="lg" className="group">
              <Link href="/products?featured=true">
                Xem tất cả sản phẩm nổi bật
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
export default FeaturedProducts;
