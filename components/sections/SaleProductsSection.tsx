"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { productApi } from "@/lib/api";
import ProductCard from "@/components/common/ProductCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  TrendingDown,
  ArrowRight,
  Percent,
  Clock,
  Star,
} from "lucide-react";

interface SaleProductsSectionProps {
  className?: string;
  maxProducts?: number;
}

export function SaleProductsSection({
  className = "",
  maxProducts = 8,
}: SaleProductsSectionProps) {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSaleProducts: 0,
    maxDiscountPercent: 0,
    averageDiscountPercent: 0,
    totalDiscountValue: 0,
  });

  useEffect(() => {
    fetchSaleData();
  }, [maxProducts]);

  const fetchSaleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both products and statistics in parallel
      const [productsResult, statsResult] = await Promise.all([
        productApi.getSaleProducts({
          page: 1,
          limit: maxProducts,
          sort: "discount_desc",
        }),
        productApi.getSaleStatistics(),
      ]);

      setSaleProducts(productsResult.data || []);
      setStats(statsResult);
    } catch (err) {
      console.error("Error fetching sale data:", err);
      setError("Không thể tải sản phẩm sale");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return null; // Ẩn section nếu có lỗi
  }
  const maxDiscount = stats.maxDiscountPercent || 0;

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Flame className="h-8 w-8 text-red-500 animate-pulse" />
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  FLASH SALE
                </h2>
                <Flame className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Cơ hội vàng - Giảm giá sốc chỉ trong thời gian có hạn!
              </p>

              {/* Sale Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1 text-sm"
                >
                  <TrendingDown className="h-4 w-4" />
                  Giảm đến {maxDiscount}%
                </Badge>{" "}
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-sm border-orange-200 text-orange-700"
                >
                  <Star className="h-4 w-4" />
                  {stats.totalSaleProducts} sản phẩm
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-sm border-blue-200 text-blue-700"
                >
                  <Clock className="h-4 w-4" />
                  Thời gian có hạn
                </Badge>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0"
            >
              <Link href="/products/sale" className="flex items-center gap-2">
                Xem tất cả Sale
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: maxProducts }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : saleProducts.length > 0 ? (
            saleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <Percent className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Hiện tại chưa có sản phẩm nào đang sale
                </p>
                <p className="text-sm">
                  Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!loading && saleProducts.length > 0 && (
          <div className="text-center mt-10">
            <Card className="inline-block bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Ưu đãi có thời hạn!</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Đừng bỏ lỡ cơ hội sở hữu những sản phẩm yêu thích với giá ưu
                  đãi
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Link
                    href="/products/sale"
                    className="flex items-center gap-2"
                  >
                    Khám phá thêm
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
