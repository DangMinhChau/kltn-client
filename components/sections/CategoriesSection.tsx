"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryApi } from "@/lib/api";
import { Category } from "@/types";
import { ArrowRight, Grid3X3, ChevronRight } from "lucide-react";

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await categoryApi.getCategories();
        console.log("📦 Categories response:", response);

        // Handle different response structures - cast to any to handle unknown structure
        const data = Array.isArray(response)
          ? response
          : (response as any)?.data || [];
        console.log("📦 Categories data array:", data); // Filter active categories and take parent categories only
        const parentCategories = data.filter(
          (cat: any) => cat.isActive && !cat.parentId
        );
        setCategories(parentCategories.slice(0, 8));
      } catch (err) {
        setError("Không thể tải danh mục sản phẩm");
        console.error("❌ Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);
  const CategorySkeleton = () => (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
  // Category image mapping - improved categorization
  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      áo: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=80",
      quần: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&q=80",
      "sơ mi":
        "https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=400&h=400&fit=crop&q=80",
      polo: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=80",
      thun: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80",
      jean: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&q=80",
      khoác:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop&q=80",
      "phụ kiện":
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&q=80",
      giày: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&q=80",
      túi: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&q=80",
    };

    const lowerName = categoryName.toLowerCase();
    for (const [key, image] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        return image;
      }
    }
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80";
  };
  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
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
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Danh mục sản phẩm
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Mua sắm theo danh mục
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
              Tìm kiếm sản phẩm theo từng danh mục cụ thể để dễ dàng lựa chọn
            </p>
          </div>

          <Button asChild variant="outline" className="hidden lg:flex">
            <Link href="/categories">
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>{" "}
        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden aspect-square border-0 bg-white/50 backdrop-blur-sm"
                >
                  <Link href={`/categories/${category.slug}`}>
                    <CardContent className="p-0 h-full">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={getCategoryImage(category.name)}
                          alt={category.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          priority={categories.indexOf(category) < 4}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 text-white">
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 group-hover:text-yellow-300 transition-colors">
                            {category.name}
                          </h3>

                          {category.description && (
                            <p className="text-white/80 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                              {category.description}
                            </p>
                          )}

                          <div className="flex items-center text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            Xem sản phẩm
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Mobile-friendly footer for smaller screens */}
                      <div className="p-2 sm:p-3 bg-white sm:hidden">
                        <h3 className="font-medium text-foreground text-center text-xs">
                          {category.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="text-center lg:hidden">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/categories">
                  Xem tất cả danh mục
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4 text-lg">
              Hiện tại chưa có danh mục sản phẩm nào
            </p>
            <Button asChild variant="outline">
              <Link href="/">Quay về trang chủ</Link>
            </Button>
          </div>
        )}{" "}
        {/* Quick Access Links */}
        {categories.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 lg:pt-16 border-t border-muted/30">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center mb-6 sm:mb-8">
              Truy cập nhanh
            </h3>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs sm:text-sm border-muted/50 hover:border-primary hover:bg-primary/5"
                >
                  <Link href={`/categories/${category.slug}`}>
                    {category.name}
                  </Link>
                </Button>
              ))}

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-dashed text-xs sm:text-sm border-muted/50 hover:border-primary hover:bg-primary/5"
              >
                <Link href="/categories">Xem thêm...</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
