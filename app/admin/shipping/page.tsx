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
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Package,
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
import { useShippingMethods } from "@/lib/hooks/useAdminData";
import {
  useDeleteShippingMethod,
  useBulkShippingAction,
  useActivateShippingMethod,
  useDeactivateShippingMethod,
} from "@/lib/hooks/useAdminMutations";
import { DataTable, Column, ActionItem, BulkAction } from "@/components/admin/DataTable";
import { toast } from "sonner";

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  type: "standard" | "express" | "overnight" | "free";
  price: number;
  estimatedDays: number;
  status: "active" | "inactive";
  zones: Array<{
    id: string;
    name: string;
    regions: string[];
  }>;
  restrictions: {
    minWeight?: number;
    maxWeight?: number;
    minOrderValue?: number;
    maxOrderValue?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);

  // Data fetching
  const {
    data: shippingMethods = [],
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
  } = useShippingMethods();

  // Mutations
  const deleteMethod = useDeleteShippingMethod();
  const bulkAction = useBulkShippingAction();
  const activateMethod = useActivateShippingMethod();
  const deactivateMethod = useDeactivateShippingMethod();

  // Table columns configuration
  const columns: Column<ShippingMethod>[] = [
    {
      id: "name",
      header: "Shipping Method",
      accessorKey: "name",
      sortable: true,
      filterable: true,
      cell: (method) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <Truck className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{method.name}</div>
            <div className="text-sm text-muted-foreground">
              {method.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Standard", value: "standard" },
        { label: "Express", value: "express" },
        { label: "Overnight", value: "overnight" },
        { label: "Free", value: "free" },
      ],
      cell: (method) => (
        <Badge
          variant={
            method.type === "express"
              ? "default"
              : method.type === "overnight"
              ? "destructive"
              : method.type === "free"
              ? "secondary"
              : "outline"
          }
        >
          {method.type}
        </Badge>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      sortable: true,
      align: "right",
      cell: (method) => (
        <div className="text-right">
          <div className="font-medium">
            {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
          </div>
        </div>
      ),
    },
    {
      id: "estimatedDays",
      header: "Delivery Time",
      accessorKey: "estimatedDays",
      sortable: true,
      align: "center",
      cell: (method) => (
        <div className="text-center flex items-center justify-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {method.estimatedDays === 1 
              ? "1 day" 
              : `${method.estimatedDays} days`}
          </span>
        </div>
      ),
    },
    {
      id: "zones",
      header: "Coverage",
      cell: (method) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {method.zones.length} zone{method.zones.length !== 1 ? "s" : ""}
          </span>
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
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      cell: (method) => (
        <Badge
          variant={method.status === "active" ? "default" : "secondary"}
        >
          {method.status}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      sortable: true,
      cell: (method) => (
        <div className="text-sm text-muted-foreground">
          {new Date(method.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<ShippingMethod>[] = [
    {
      label: "View",
      onClick: (method) => router.push(`/admin/shipping/${method.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit",
      onClick: (method) => router.push(`/admin/shipping/${method.id}/edit`),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Activate",
      onClick: async (method) => {
        await activateMethod.mutate(method.id);
        refresh();
      },
      icon: <Truck className="h-4 w-4" />,
      disabled: (method) => method.status === "active",
    },
    {
      label: "Deactivate",
      onClick: async (method) => {
        await deactivateMethod.mutate(method.id);
        refresh();
      },
      icon: <AlertTriangle className="h-4 w-4" />,
      disabled: (method) => method.status === "inactive",
    },
    {
      label: "Delete",
      onClick: (method) => setDeleteMethodId(method.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<ShippingMethod>[] = [
    {
      label: "Activate",
      onClick: async (methods) => {
        await bulkAction.mutate({
          action: "activate",
          methodIds: methods.map((m) => m.id),
        });
        refresh();
      },
      icon: <Truck className="h-4 w-4" />,
    },
    {
      label: "Deactivate",
      onClick: async (methods) => {
        await bulkAction.mutate({
          action: "deactivate",
          methodIds: methods.map((m) => m.id),
        });
        refresh();
      },
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      label: "Delete",
      onClick: async (methods) => {
        if (confirm(`Are you sure you want to delete ${methods.length} shipping methods?`)) {
          await bulkAction.mutate({
            action: "delete",
            methodIds: methods.map((m) => m.id),
          });
          refresh();
        }
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  const handleDeleteMethod = async () => {
    if (!deleteMethodId) return;
    
    try {
      await deleteMethod.mutate(deleteMethodId);
      setDeleteMethodId(null);
      refresh();
    } catch (error) {
      console.error("Failed to delete shipping method:", error);
    }
  };

  const handleExport = () => {
    // Implementation for exporting shipping methods
    toast.info("Export functionality will be implemented soon");
  };

  const activeMethods = shippingMethods.filter(m => m.status === "active").length;
  const averagePrice = shippingMethods.length > 0 
    ? shippingMethods.reduce((sum, m) => sum + m.price, 0) / shippingMethods.length 
    : 0;
  const averageDeliveryTime = shippingMethods.length > 0 
    ? shippingMethods.reduce((sum, m) => sum + m.estimatedDays, 0) / shippingMethods.length 
    : 0;
  const totalZones = new Set(shippingMethods.flatMap(m => m.zones.map(z => z.id))).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
          <p className="text-muted-foreground">
            Manage shipping methods, zones, and delivery options.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/shipping/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Methods</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Shipping options available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Methods</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMethods}</div>
            <p className="text-xs text-muted-foreground">
              {((activeMethods / total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per shipping method
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDeliveryTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">
              Average delivery time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Methods</CardTitle>
          <CardDescription>
            Manage all shipping methods and delivery options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={shippingMethods}
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
            getRowId={(method) => method.id}
          />
        </CardContent>
      </Card>

      {/* Delete Method Dialog */}
      <Dialog open={!!deleteMethodId} onOpenChange={() => setDeleteMethodId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shipping Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shipping method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMethodId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMethod}
              disabled={deleteMethod.loading}
            >
              {deleteMethod.loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
