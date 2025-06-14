"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Gift,
  AlertTriangle,
  Calendar,
  Users,
  ShoppingCart,
  BarChart3,
  Percent,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useVoucher } from "@/lib/hooks/useAdminData";
import {
  useDeleteVoucher,
  useActivateVoucher,
  useDeactivateVoucher,
} from "@/lib/hooks/useAdminMutations";
import { useState } from "react";
import { toast } from "sonner";

export default function VoucherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: voucher, loading, error, refresh } = useVoucher(voucherId);
  const deleteVoucher = useDeleteVoucher();
  const activateVoucher = useActivateVoucher();
  const deactivateVoucher = useDeactivateVoucher();

  const handleDelete = async () => {
    try {
      await deleteVoucher.mutate(voucherId);
      toast.success("Voucher deleted successfully");
      router.push("/admin/vouchers");
    } catch (error) {
      console.error("Failed to delete voucher:", error);
    }
  };

  const handleActivate = async () => {
    try {
      await activateVoucher.mutate(voucherId);
      refresh();
      toast.success("Voucher activated successfully");
    } catch (error) {
      console.error("Failed to activate voucher:", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateVoucher.mutate(voucherId);
      refresh();
      toast.success("Voucher deactivated successfully");
    } catch (error) {
      console.error("Failed to deactivate voucher:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Voucher not found</h2>
        <p className="text-muted-foreground">
          The voucher you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/admin/vouchers")} className="mt-4">
          Back to Vouchers
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  const getDiscountDisplay = () => {
    if (voucher.type === "PERCENTAGE") {
      return (
        <div className="flex items-center space-x-2">
          <Percent className="h-5 w-5 text-green-600" />
          <span className="text-xl font-bold text-green-600">
            {voucher.value}% OFF
          </span>
        </div>
      );
    } else if (voucher.type === "FIXED_AMOUNT") {
      return (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">
            {voucher.value.toLocaleString()}₫ OFF
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-purple-600" />
          <span className="text-xl font-bold text-purple-600">
            FREE SHIPPING
          </span>
        </div>
      );
    }
  };

  const usagePercentage = voucher.usageLimit
    ? (voucher.usedCount / voucher.usageLimit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {voucher.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-muted-foreground">Code:</span>
              <code className="px-2 py-1 text-sm font-mono bg-muted rounded">
                {voucher.code}
              </code>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {voucher.status === "inactive" ? (
            <Button
              onClick={handleActivate}
              disabled={activateVoucher.loading}
              size="sm"
            >
              <Gift className="h-4 w-4 mr-2" />
              Activate
            </Button>
          ) : (
            <Button
              onClick={handleDeactivate}
              disabled={deactivateVoucher.loading}
              variant="outline"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          )}

          <Button
            onClick={() => router.push(`/admin/vouchers/${voucherId}/edit`)}
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button
            onClick={() => setDeleteDialogOpen(true)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voucher Details */}
          <Card>
            <CardHeader>
              <CardTitle>Voucher Information</CardTitle>
              <CardDescription>
                Basic information and discount details for this voucher.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Discount Display */}
              <div className="text-center p-6 border rounded-lg bg-muted/50">
                {getDiscountDisplay()}
                {voucher.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {voucher.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Discount Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {voucher.type === "PERCENTAGE" && "Percentage Discount"}
                    {voucher.type === "FIXED_AMOUNT" && "Fixed Amount Discount"}
                    {voucher.type === "FREE_SHIPPING" && "Free Shipping"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Discount Value</Label>
                  <p className="text-sm text-muted-foreground">
                    {voucher.type === "PERCENTAGE"
                      ? `${voucher.value}%`
                      : `${voucher.value.toLocaleString()}₫`}
                  </p>
                </div>

                {voucher.minimumOrderAmount && (
                  <div>
                    <Label className="text-sm font-medium">Minimum Order</Label>
                    <p className="text-sm text-muted-foreground">
                      {voucher.minimumOrderAmount.toLocaleString()}₫
                    </p>
                  </div>
                )}

                {voucher.maximumDiscount && (
                  <div>
                    <Label className="text-sm font-medium">
                      Maximum Discount
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {voucher.maximumDiscount.toLocaleString()}₫
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Valid From</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(voucher.startDate), "PPP")}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Valid Until</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(voucher.endDate), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Detailed usage statistics and performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Usage Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Usage Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {voucher.usedCount}
                      {voucher.usageLimit ? `/${voucher.usageLimit}` : ""} uses
                    </span>
                  </div>
                  {voucher.usageLimit && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {voucher.usedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Times Used
                    </div>
                  </div>

                  {voucher.usageLimit && (
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {voucher.usageLimit - voucher.usedCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Remaining
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {usagePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Usage Rate
                    </div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.ceil(
                        (new Date(voucher.endDate).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Days Left
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge()}
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {format(new Date(voucher.createdAt), "MMM dd, yyyy")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm">
                  {format(new Date(voucher.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>

              {voucher.usageLimit && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Usage Limit
                  </span>
                  <span className="text-sm">{voucher.usageLimit}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voucher Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Customer View</CardTitle>
              <CardDescription>
                How this voucher appears to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-mono font-bold">
                    {voucher.code}
                  </div>
                  <div className="text-sm font-medium">{voucher.name}</div>
                  {voucher.description && (
                    <div className="text-xs text-muted-foreground">
                      {voucher.description}
                    </div>
                  )}
                  <div className="text-sm font-bold text-primary">
                    {voucher.type === "PERCENTAGE" && `${voucher.value}% OFF`}
                    {voucher.type === "FIXED_AMOUNT" &&
                      `${voucher.value.toLocaleString()}₫ OFF`}
                    {voucher.type === "FREE_SHIPPING" && "FREE SHIPPING"}
                  </div>
                  {voucher.minimumOrderAmount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Min. order: {voucher.minimumOrderAmount.toLocaleString()}₫
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Voucher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the voucher "{voucher.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteVoucher.loading}
            >
              {deleteVoucher.loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
