"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreHorizontal,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useVouchers } from "@/lib/hooks/useAdminData";
import {
  useDeleteVoucher,
  useBulkVoucherAction,
  useActivateVoucher,
  useDeactivateVoucher,
} from "@/lib/hooks/useAdminMutations";
import { adminApi } from "@/lib/api/admin";
import {
  DataTable,
  Column,
  ActionItem,
  BulkAction,
} from "@/components/admin/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "fixed" | "percentage";
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  status: "active" | "inactive" | "expired";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function VouchersPage() {
  const router = useRouter();
  const [deleteVoucherId, setDeleteVoucherId] = useState<string | null>(null);
  // Data fetching
  const {
    data: vouchersData = [],
    total,
    page,
    pageSize,
    loading,
    search,
    filters,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setSorting,
    refresh,
  } = useVouchers();

  const vouchers: Voucher[] = vouchersData || [];

  // Mutations
  const deleteVoucher = useDeleteVoucher();
  const bulkAction = useBulkVoucherAction();
  const activateVoucher = useActivateVoucher();
  const deactivateVoucher = useDeactivateVoucher();

  // Table columns configuration
  const columns: Column<Voucher>[] = [
    {
      id: "code",
      header: "Voucher Code",
      accessorKey: "code",
      sortable: true,
      filterable: true,
      cell: (voucher) => (
        <div>
          <div className="font-mono font-semibold">{voucher.code}</div>
          <div className="text-sm text-muted-foreground">{voucher.name}</div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Discount",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Fixed Amount", value: "fixed" },
        { label: "Percentage", value: "percentage" },
      ],
      cell: (voucher) => (
        <div className="flex items-center space-x-2">
          {voucher.type === "percentage" ? (
            <Percent className="h-4 w-4 text-green-600" />
          ) : (
            <DollarSign className="h-4 w-4 text-blue-600" />
          )}
          <span className="font-medium">
            {voucher.type === "percentage"
              ? `${voucher.value}%`
              : `$${voucher.value.toFixed(2)}`}
          </span>
        </div>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      sortable: true,
      align: "center",
      cell: (voucher) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {voucher.usedCount}
            {voucher.usageLimit ? `/${voucher.usageLimit}` : ""}
          </div>
          {voucher.usageLimit && (
            <div className="text-xs text-muted-foreground">
              {((voucher.usedCount / voucher.usageLimit) * 100).toFixed(0)}%
              used
            </div>
          )}
        </div>
      ),
    },
    {
      id: "minimumOrder",
      header: "Min. Order",
      sortable: true,
      align: "right",
      cell: (voucher) => (
        <div className="text-right">
          {voucher.minimumOrder ? (
            <span className="text-sm">${voucher.minimumOrder.toFixed(2)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">No minimum</span>
          )}
        </div>
      ),
    },
    {
      id: "validity",
      header: "Validity",
      sortable: true,
      cell: (voucher) => {
        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);
        const isActive = now >= startDate && now <= endDate;
        const isExpired = now > endDate;

        return (
          <div className="text-sm">
            <div
              className={
                isExpired
                  ? "text-red-600"
                  : isActive
                  ? "text-green-600"
                  : "text-orange-600"
              }
            >
              {isExpired ? "Expired" : isActive ? "Active" : "Not started"}
            </div>
            <div className="text-xs text-muted-foreground">
              Until {endDate.toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Expired", value: "expired" },
      ],
      cell: (voucher) => (
        <Badge
          variant={
            voucher.status === "active"
              ? "default"
              : voucher.status === "expired"
              ? "destructive"
              : "secondary"
          }
        >
          {voucher.status}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (voucher) => (
        <div className="text-sm text-muted-foreground">
          {new Date(voucher.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<Voucher>[] = [
    {
      label: "View",
      onClick: (voucher) => router.push(`/admin/vouchers/${voucher.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: (voucher) => router.push(`/admin/vouchers/${voucher.id}/edit`),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Activate",
      onClick: async (voucher) => {
        await activateVoucher.mutate(voucher.id);
        refresh();
      },
      icon: <Gift className="h-4 w-4" />,
      disabled: (voucher) => voucher.status === "active",
    },
    {
      label: "Deactivate",
      onClick: async (voucher) => {
        await deactivateVoucher.mutate(voucher.id);
        refresh();
      },
      icon: <AlertTriangle className="h-4 w-4" />,
      disabled: (voucher) => voucher.status === "inactive",
    },
    {
      label: "Delete",
      onClick: (voucher) => setDeleteVoucherId(voucher.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Voucher>[] = [
    {
      label: "Activate",
      onClick: async (vouchers) => {
        await bulkAction.mutate({
          action: "activate",
          voucherIds: vouchers.map((v) => v.id),
        });
        refresh();
      },
      icon: <Gift className="h-4 w-4" />,
    },
    {
      label: "Deactivate",
      onClick: async (vouchers) => {
        await bulkAction.mutate({
          action: "deactivate",
          voucherIds: vouchers.map((v) => v.id),
        });
        refresh();
      },
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: async (vouchers) => {
        if (
          confirm(
            `Are you sure you want to delete ${vouchers.length} vouchers?`
          )
        ) {
          await bulkAction.mutate({
            action: "delete",
            voucherIds: vouchers.map((v) => v.id),
          });
          refresh();
        }
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  const handleDeleteVoucher = async () => {
    if (!deleteVoucherId) return;

    try {
      await deleteVoucher.mutate(deleteVoucherId);
      setDeleteVoucherId(null);
      refresh();
    } catch (error) {
      console.error("Failed to delete voucher:", error);
    }
  };
  const handleExport = async (format: "csv" | "xlsx" = "csv") => {
    try {
      const exportFilters = {
        ...filters,
        search,
        sortBy,
        sortOrder,
      };

      const response = await adminApi.vouchers.export(format, exportFilters);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `vouchers-export-${new Date().toISOString().split("T")[0]}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Vouchers exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export vouchers");
    }
  };

  const activeVouchers = vouchers.filter((v) => v.status === "active").length;
  const expiredVouchers = vouchers.filter((v) => v.status === "expired").length;
  const totalUsage = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
  const totalSavings = vouchers.reduce((sum, v) => {
    if (v.type === "fixed") {
      return sum + v.value * v.usedCount;
    }
    // For percentage discounts, we'd need order data to calculate actual savings
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">
            Manage discount vouchers and promotional codes.
          </p>
        </div>{" "}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href="/admin/vouchers/analytics">Analytics</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/vouchers/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Voucher
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vouchers
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vouchers
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVouchers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeVouchers / total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Times vouchers were used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Customer savings to date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher List</CardTitle>
          <CardDescription>
            Manage all discount vouchers and promotional codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={vouchers}
            columns={columns}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            search={search}
            filters={filters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
            onFiltersChange={setFilters}
            onSortChange={setSorting}
            onRefresh={refresh}
            onExport={handleExport}
            actions={actions}
            bulkActions={bulkActions}
            selectable={true}
            getRowId={(voucher) => voucher.id}
          />
        </CardContent>
      </Card>

      {/* Delete Voucher Dialog */}
      <Dialog
        open={!!deleteVoucherId}
        onOpenChange={() => setDeleteVoucherId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Voucher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this voucher? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVoucherId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVoucher}
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
