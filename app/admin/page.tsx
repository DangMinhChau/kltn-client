"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { TablesSection } from "@/components/admin/dashboard/TablesSection";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { useDashboardAnalytics, useAdminStats } from "@/lib/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardAnalytics, AdminStats } from "@/lib/api/admin";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    data: analytics,
    loading: analyticsLoading,
    refresh: refreshAnalytics,
  } = useDashboardAnalytics();
  const {
    data: stats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useAdminStats();

  const loading = analyticsLoading || statsLoading;

  const handleRefresh = async () => {
    await Promise.all([refreshAnalytics(), refreshStats()]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>{" "}
      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        stats && <StatsCards stats={stats} formatCurrency={formatCurrency} />
      )}{" "}
      {/* Charts */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        analytics && (
          <DashboardCharts
            revenueData={(analytics.revenueChart || []).map((item) => ({
              name: item.date,
              value: item.revenue,
              revenue: item.revenue,
              orders: item.orders,
            }))}
            orderData={(analytics.revenueChart || []).map((item) => ({
              name: item.date,
              value: item.orders,
              orders: item.orders,
            }))}
            customerData={(analytics.customerGrowth || []).map((item) => ({
              name: item.month,
              value: item.customers,
              customers: item.customers,
            }))}
            categoryData={[]}
          />
        )
      )}
      {/* Tables and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          {loading ? (
            <Skeleton className="h-96" />
          ) : (
            analytics && (
              <TablesSection
                topProducts={analytics.topProducts || []}
                recentOrders={analytics.recentOrders || []}
                formatCurrency={formatCurrency}
              />
            )
          )}
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
