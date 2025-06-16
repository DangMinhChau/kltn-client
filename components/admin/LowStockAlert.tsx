"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { adminVariantsApi } from "@/lib/api/admin";
import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface LowStockAlertProps {
  threshold?: number;
  maxItems?: number;
}

export function LowStockAlert({
  threshold = 10,
  maxItems = 5,
}: LowStockAlertProps) {
  const [lowStockItems, setLowStockItems] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLowStockItems();
  }, [threshold]);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminVariantsApi.getVariants({
        minStock: 1,
        maxStock: threshold,
        limit: maxItems,
        sortBy: "stockQuantity",
        sortOrder: "ASC",
      });

      setLowStockItems(response.data);
    } catch (err: any) {
      console.error("Error fetching low stock items:", err);
      setError(err.message || "Failed to fetch low stock items");
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (quantity: number) => {
    if (quantity === 0) return "out";
    if (quantity <= 3) return "critical";
    if (quantity <= 5) return "low";
    return "warning";
  };

  const getStockBadge = (quantity: number) => {
    const level = getStockLevel(quantity);

    switch (level) {
      case "out":
        return <Badge variant="destructive">Hết hàng</Badge>;
      case "critical":
        return (
          <Badge variant="destructive" className="bg-red-600">
            Rất ít: {quantity}
          </Badge>
        );
      case "low":
        return (
          <Badge variant="destructive" className="bg-orange-600">
            Ít: {quantity}
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-600"
          >
            Cảnh báo: {quantity}
          </Badge>
        );
      default:
        return <Badge variant="outline">{quantity}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Cảnh báo tồn kho</CardTitle>
          </div>
          <CardDescription>
            Sản phẩm sắp hết hàng (≤ {threshold} sản phẩm)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Lỗi tải dữ liệu</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchLowStockItems} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Tồn kho ổn định</CardTitle>
          </div>
          <CardDescription>Không có sản phẩm nào sắp hết hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tất cả sản phẩm đều có số lượng tồn kho trên {threshold} sản phẩm.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Cảnh báo tồn kho</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchLowStockItems}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {lowStockItems.length} sản phẩm sắp hết hàng (≤ {threshold} sản phẩm)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {variant.images && variant.images.length > 0 ? (
                  <Image
                    src={
                      typeof variant.images[0] === "string"
                        ? variant.images[0]
                        : variant.images[0].imageUrl
                    }
                    alt={variant.product?.name || ""}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">
                    {variant.product?.name}
                  </p>
                  <TrendingDown className="h-4 w-4 text-orange-500 flex-shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {variant.sku}
                  </code>
                  {variant.color && (
                    <span className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: variant.color.hexCode }}
                      />
                      {variant.color.name}
                    </span>
                  )}
                  {variant.size && <span>{variant.size.name}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStockBadge(variant.stockQuantity)}
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`/admin/products/variants?productId=${variant.product?.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {lowStockItems.length >= maxItems && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/inventory?stockStatus=low-stock">
                Xem tất cả sản phẩm sắp hết hàng
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
