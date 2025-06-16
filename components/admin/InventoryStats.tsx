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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  DollarSign,
  Eye,
} from "lucide-react";
import { adminVariantsApi } from "@/lib/api/admin";
import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface InventoryStatsData {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockValue: number;
  topStockItems: ProductVariant[];
}

export function InventoryStats() {
  const [stats, setStats] = useState<InventoryStatsData>({
    totalProducts: 0,
    totalVariants: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    stockValue: 0,
    topStockItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all variants for stats calculation
      const [
        allVariants,
        lowStockVariants,
        outOfStockVariants,
        topStockVariants,
      ] = await Promise.all([
        adminVariantsApi.getVariants({ limit: 1000 }), // Get a large number for stats
        adminVariantsApi.getVariants({ minStock: 1, maxStock: 10, limit: 100 }),
        adminVariantsApi.getVariants({ minStock: 0, maxStock: 0, limit: 100 }),
        adminVariantsApi.getVariants({
          sortBy: "stockQuantity",
          sortOrder: "DESC",
          limit: 5,
        }),
      ]);

      const totalStock = allVariants.data.reduce(
        (sum, variant) => sum + variant.stockQuantity,
        0
      );
      const stockValue = allVariants.data.reduce((sum, variant) => {
        const price = variant.product?.basePrice || 0;
        return sum + price * variant.stockQuantity;
      }, 0);

      setStats({
        totalProducts: new Set(allVariants.data.map((v) => v.product?.id)).size,
        totalVariants: allVariants.data.length,
        totalStock,
        lowStockItems: lowStockVariants.data.length,
        outOfStockItems: outOfStockVariants.data.length,
        stockValue,
        topStockItems: topStockVariants.data,
      });
    } catch (err: any) {
      console.error("Error fetching inventory stats:", err);
      setError(err.message || "Failed to fetch inventory stats");
      toast.error("Không thể tải thống kê kho hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lỗi tải thống kê</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchInventoryStats}>Thử lại</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVariants} biến thể
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tồn kho</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStock.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Đơn vị sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị kho</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.stockValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng giá trị tồn kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hàng</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">≤ 10 sản phẩm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Cần nhập hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản lý kho</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/inventory">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Stock Items */}
      {stats.topStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top sản phẩm tồn kho cao
            </CardTitle>
            <CardDescription>
              5 biến thể có số lượng tồn kho cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topStockItems.map((variant, index) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {variant.product?.name}
                    </p>
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
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {variant.stockQuantity}
                    </p>
                    <p className="text-xs text-muted-foreground">đơn vị</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
