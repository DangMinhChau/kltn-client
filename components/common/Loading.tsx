"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Loading component cho ProductCard
export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

// Loading component cho Category card
export const CategoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-2/3 mt-2" />
      </CardContent>
    </Card>
  );
};

// Loading component cho Collection card
export const CollectionCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-6 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
};

// Loading component cho danh sách sản phẩm
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Loading component cho hero section
export const HeroSkeleton = () => {
  return (
    <section className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12 lg:py-20">
          <div className="space-y-8">
            <Skeleton className="h-8 w-32 bg-slate-700" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-slate-700" />
              <Skeleton className="h-8 w-3/4 bg-slate-700" />
            </div>
            <Skeleton className="h-6 w-full bg-slate-700" />
            <div className="flex space-x-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 bg-slate-700 mb-2" />
                  <Skeleton className="h-4 w-12 bg-slate-700" />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 bg-slate-700" />
              <Skeleton className="h-12 w-32 bg-slate-700" />
            </div>
          </div>
          <div className="relative">
            <Skeleton className="aspect-[4/5] w-full bg-slate-700 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Loading component chung
export const LoadingSpinner = ({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

// Loading page toàn trang
export const PageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
};
