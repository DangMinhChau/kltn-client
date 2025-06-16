import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="group cursor-pointer transition-all duration-500 overflow-hidden rounded-xl">
      <CardContent className="p-0">
        {/* Image Skeleton */}
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="relative aspect-[3/4] bg-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <div className="h-3 bg-gray-200 animate-pulse rounded w-16"></div>

          {/* Product Name */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-20"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-8"></div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-gray-200 animate-pulse rounded w-8"></div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 w-6 bg-gray-200 animate-pulse rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
