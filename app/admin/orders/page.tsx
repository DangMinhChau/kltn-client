"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Download,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MoreHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/lib/hooks/useAdminData";
import {
  useUpdateOrderStatus,
  useBulkOrderStatusUpdate,
  useExportOrders,
} from "@/lib/hooks/useAdminMutations";
import {
  DataTable,
  Column,
  ActionItem,
  BulkAction,
} from "@/components/admin/DataTable";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total: number;
  itemCount: number;
  shippingAddress: {
    city: string;
    district: string;
  };
  createdAt: string;
  updatedAt: string;
}

const orderStatusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    variant: "default" as const,
    icon: Package,
  },
  shipped: { label: "Shipped", variant: "default" as const, icon: Truck },
  delivered: {
    label: "Delivered",
    variant: "default" as const,
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [statusUpdateOrderId, setStatusUpdateOrderId] = useState<string | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("");

  // Data fetching
  const {
    data: orders = [],
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
  } = useOrders();

  // Mutations
  const updateOrderStatus = useUpdateOrderStatus();
  const bulkStatusUpdate = useBulkOrderStatusUpdate();
  const exportOrders = useExportOrders();

  // Table columns configuration
  const columns: Column<Order>[] = [
    {
      id: "orderNumber",
      header: "Order",
      accessorKey: "orderNumber",
      sortable: true,
      filterable: true,
      cell: (order) => (
        <div>
          <div className="font-medium">{order.orderNumber}</div>
          <div className="text-sm text-muted-foreground">
            {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      sortable: true,
      filterable: true,
      cell: (order) => (
        <div>
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-sm text-muted-foreground">
            {order.customer.email}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Object.entries(orderStatusConfig).map(
        ([value, config]) => ({
          label: config.label,
          value,
        })
      ),
      cell: (order) => {
        const config = orderStatusConfig[order.status];
        const Icon = config.icon;
        return (
          <Badge variant={config.variant}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "total",
      header: "Total",
      accessorKey: "total",
      sortable: true,
      align: "right",
      cell: (order) => (
        <div className="text-right font-medium">${order.total.toFixed(2)}</div>
      ),
    },
    {
      id: "shippingAddress",
      header: "Shipping To",
      cell: (order) => (
        <div className="text-sm">
          {order.shippingAddress.district}, {order.shippingAddress.city}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Order Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (order) => (
        <div className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<Order>[] = [
    {
      label: "View Details",
      onClick: (order) => router.push(`/admin/orders/${order.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Update Status",
      onClick: (order) => {
        setStatusUpdateOrderId(order.id);
        setNewStatus(order.status);
      },
      icon: <Package className="h-4 w-4" />,
      disabled: (order) =>
        order.status === "delivered" || order.status === "cancelled",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Order>[] = [
    {
      label: "Mark as Confirmed",
      onClick: async (orders) => {
        await bulkStatusUpdate.mutate({
          orderIds: orders.map((o) => o.id),
          status: "confirmed",
        });
        refresh();
      },
      icon: <CheckCircle className="h-4 w-4" />,
      disabled: (orders) => orders.some((o) => o.status !== "pending"),
    },
    {
      label: "Mark as Processing",
      onClick: async (orders) => {
        await bulkStatusUpdate.mutate({
          orderIds: orders.map((o) => o.id),
          status: "processing",
        });
        refresh();
      },
      icon: <Package className="h-4 w-4" />,
      disabled: (orders) =>
        orders.some((o) => !["confirmed", "pending"].includes(o.status)),
    },
    {
      label: "Mark as Shipped",
      onClick: async (orders) => {
        await bulkStatusUpdate.mutate({
          orderIds: orders.map((o) => o.id),
          status: "shipped",
        });
        refresh();
      },
      icon: <Truck className="h-4 w-4" />,
      disabled: (orders) => orders.some((o) => o.status !== "processing"),
    },
  ];

  const handleStatusUpdate = async () => {
    if (!statusUpdateOrderId || !newStatus) return;

    try {
      await updateOrderStatus.mutate({
        id: statusUpdateOrderId,
        status: newStatus,
      });
      setStatusUpdateOrderId(null);
      setNewStatus("");
      refresh();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleExport = async () => {
    try {
      await exportOrders.mutate({ ...filters, search });
      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Failed to export orders:", error);
    }
  };

  // Calculate stats
  const stats = {
    total,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders and fulfillment.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportOrders.loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportOrders.loading ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            Manage all customer orders and their fulfillment status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders}
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
            getRowId={(order) => order.id}
          />
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog
        open={!!statusUpdateOrderId}
        onOpenChange={() => setStatusUpdateOrderId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order to reflect its current state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(orderStatusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center">
                        <config.icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusUpdateOrderId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateOrderStatus.loading || !newStatus}
            >
              {updateOrderStatus.loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
