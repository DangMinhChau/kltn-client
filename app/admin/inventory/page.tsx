"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  MoreHorizontal,
  Archive,
  RotateCcw,
  Eye,
  Edit,
  History,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";

const stockAdjustmentSchema = z.object({
  variantId: z.string().min(1, "Variant is required"),
  adjustmentType: z.enum(["increase", "decrease", "set"]),
  quantity: z.number().min(1, "Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;

interface InventoryItem {
  id: string;
  variantId: string;
  variant: {
    id: string;
    sku: string;
    product: {
      id: string;
      name: string;
      mainImageUrl: string;
    };
    color: {
      name: string;
      hexCode: string;
    };
    size: {
      name: string;
    };
    price: number;
  };
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  lastRestockedAt?: string;
  lastSoldAt?: string;
  totalSold: number;
  averageMonthlySales: number;
  reorderPoint: number;
  reorderQuantity: number;
  location?: string;
  supplier?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  variantId: string;
  variant: {
    sku: string;
    product: {
      name: string;
    };
  };
  type: "sale" | "purchase" | "adjustment" | "return" | "transfer";
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  notes?: string;
  orderId?: string;
  userId?: string;
  user?: {
    fullName: string;
  };
  createdAt: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topSellingItems: Array<{
    variantId: string;
    productName: string;
    sku: string;
    soldQuantity: number;
  }>;
  slowMovingItems: Array<{
    variantId: string;
    productName: string;
    sku: string;
    daysSinceLastSale: number;
  }>;
  monthlyMovements: Array<{
    month: string;
    sales: number;
    purchases: number;
    adjustments: number;
  }>;
}

function StockAdjustmentForm({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: StockAdjustmentData) => void;
  onClose: () => void;
}) {
  const [variants, setVariants] = useState<any[]>([]);

  const form = useForm<StockAdjustmentData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      variantId: "",
      adjustmentType: "increase",
      quantity: 1,
      reason: "",
      notes: "",
    },
  });
  useEffect(() => {
    const loadVariants = async () => {
      try {
        const response = await adminApi.variants.getAll();
        setVariants(response.data || []);
      } catch (error) {
        toast.error("Failed to load variants");
      }
    };
    loadVariants();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="variantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Variant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.product.name} - {variant.color.name} (
                      {variant.size.name}) - {variant.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="adjustmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="increase">Increase Stock</SelectItem>
                    <SelectItem value="decrease">Decrease Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="damage">Damaged Items</SelectItem>
                  <SelectItem value="theft">Theft/Loss</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                  <SelectItem value="correction">
                    Inventory Correction
                  </SelectItem>
                  <SelectItem value="promotion">Promotional Samples</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Apply Adjustment</Button>
        </div>
      </form>
    </Form>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Use variants endpoint for inventory data since backend doesn't have dedicated inventory module
      const variantsResponse = await fetch("/api/variants");
      const variantsData = await variantsResponse.json();

      // Transform variants data to inventory format
      const mockInventory: InventoryItem[] = variantsData.data?.map(
        (variant: any) => ({
          id: variant.id,
          variantId: variant.id,
          variant: {
            id: variant.id,
            sku: variant.sku,
            product: {
              id: variant.product?.id || variant.productId,
              name: variant.product?.name || "Product Name",
              mainImageUrl:
                variant.images?.[0]?.url || "https://via.placeholder.com/100",
            },
            color: variant.color || { name: "Default", hexCode: "#000000" },
            size: variant.size || { name: "Default" },
            price: variant.price || 0,
          },
          stockQuantity: variant.stockQuantity || 0,
          reservedQuantity: 0, // Not supported by backend
          availableQuantity: variant.stockQuantity || 0,
          lowStockThreshold: variant.lowStockThreshold || 10,
          stockStatus:
            variant.stockQuantity === 0
              ? "out_of_stock"
              : variant.stockQuantity <= (variant.lowStockThreshold || 10)
              ? "low_stock"
              : "in_stock",
          totalSold: 0, // Not supported by backend
          averageMonthlySales: 0, // Not supported by backend
          reorderPoint: variant.lowStockThreshold || 10,
          reorderQuantity: 100,
          createdAt: variant.createdAt || new Date().toISOString(),
          updatedAt: variant.updatedAt || new Date().toISOString(),
        })
      ) || [
        // Fallback mock data if API fails
        {
          id: "1",
          variantId: "v1",
          variant: {
            id: "v1",
            sku: "SKU-001-S-RED",
            product: {
              id: "p1",
              name: "Cotton T-Shirt",
              mainImageUrl: "https://via.placeholder.com/100",
            },
            color: { name: "Red", hexCode: "#FF0000" },
            size: { name: "S" },
            price: 250000,
          },
          stockQuantity: 45,
          reservedQuantity: 5,
          availableQuantity: 40,
          lowStockThreshold: 10,
          stockStatus: "in_stock",
          totalSold: 125,
          averageMonthlySales: 25,
          reorderPoint: 15,
          reorderQuantity: 100,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];

      // Mock movements since backend doesn't support stock movements
      const mockMovements: StockMovement[] = [
        {
          id: "1",
          variantId: "v1",
          variant: {
            sku: "SKU-001-S-RED",
            product: { name: "Cotton T-Shirt" },
          },
          type: "sale",
          quantityChange: -2,
          quantityBefore: 47,
          quantityAfter: 45,
          reason: "Customer purchase",
          orderId: "ORD-001",
          createdAt: new Date().toISOString(),
        },
      ];

      // Calculate stats from inventory data
      const mockStats: InventoryStats = {
        totalItems: mockInventory.length,
        totalValue: mockInventory.reduce(
          (sum, item) => sum + item.variant.price * item.stockQuantity,
          0
        ),
        lowStockItems: mockInventory.filter(
          (item) => item.stockStatus === "low_stock"
        ).length,
        outOfStockItems: mockInventory.filter(
          (item) => item.stockStatus === "out_of_stock"
        ).length,
        topSellingItems: [
          {
            variantId: "v1",
            productName: "Cotton T-Shirt",
            sku: "SKU-001",
            soldQuantity: 125,
          },
        ],
        slowMovingItems: [
          {
            variantId: "v2",
            productName: "Winter Jacket",
            sku: "SKU-002",
            daysSinceLastSale: 45,
          },
        ],
        monthlyMovements: [
          { month: "Jan", sales: 1200, purchases: 800, adjustments: 50 },
          { month: "Feb", sales: 1100, purchases: 600, adjustments: 30 },
          { month: "Mar", sales: 1350, purchases: 900, adjustments: 40 },
        ],
      };

      setInventory(mockInventory);
      setMovements(mockMovements);
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to load inventory data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };
  const handleStockAdjustment = async (data: StockAdjustmentData) => {
    try {
      // Use variants endpoint to update stock since backend doesn't have dedicated inventory endpoints
      const variantId = data.variantId;
      await fetch(`/api/variants/${variantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockQuantity: data.quantity,
          // Include reason in notes if supported by variants endpoint
          notes: `Stock adjustment: ${data.reason}. ${data.notes || ""}`.trim(),
        }),
      });

      toast.success("Stock adjustment applied successfully");
      setShowAdjustmentDialog(false);
      loadInventoryData();
    } catch (error) {
      console.error("Failed to apply stock adjustment:", error);
      toast.error("Failed to apply stock adjustment");
    }
  };

  const exportInventoryReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        inventory,
        stats,
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Inventory report exported");
    } catch (error) {
      toast.error("Failed to export inventory report");
    }
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "in_stock":
        return "default";
      case "low_stock":
        return "outline";
      case "out_of_stock":
        return "destructive";
      case "discontinued":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      case "discontinued":
        return "Discontinued";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.variant.product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.variant.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.stockStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const inventoryColumns = [
    {
      id: "product",
      header: "Product",
      cell: (item: InventoryItem) => {
        return (
          <div className="flex items-center space-x-3">
            <img
              src={item.variant.product.mainImageUrl}
              alt={item.variant.product.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div>
              <div className="font-medium">{item.variant.product.name}</div>
              <div className="text-sm text-gray-500">
                {item.variant.color.name} · {item.variant.size.name}
              </div>
              <div className="text-xs text-gray-400">
                SKU: {item.variant.sku}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: (item: InventoryItem) => {
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {item.availableQuantity} available
            </div>
            <div className="text-sm text-gray-500">
              {item.stockQuantity} total ({item.reservedQuantity} reserved)
            </div>
            <Badge variant={getStatusBadgeVariant(item.stockStatus)}>
              {getStatusLabel(item.stockStatus)}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "performance",
      header: "Sales Performance",
      cell: (item: InventoryItem) => {
        return (
          <div className="space-y-1">
            <div className="text-sm">
              <span className="font-medium">{item.totalSold}</span> total sold
            </div>
            <div className="text-sm text-gray-500">
              ~{item.averageMonthlySales}/month avg
            </div>
          </div>
        );
      },
    },
    {
      id: "reorder",
      header: "Reorder",
      cell: (item: InventoryItem) => {
        const needsReorder = item.availableQuantity <= item.reorderPoint;
        return (
          <div className="space-y-1">
            <div className="text-sm">Point: {item.reorderPoint}</div>
            <div className="text-sm">Qty: {item.reorderQuantity}</div>
            {needsReorder && <Badge variant="outline">Reorder Now</Badge>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: InventoryItem) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History className="w-4 h-4 mr-2" />
                View History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RotateCcw className="w-4 h-4 mr-2" />
                Quick Restock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    loadInventoryData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Monitor stock levels, track movements, and manage inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportInventoryReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowAdjustmentDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Total Items</span>
              </div>
              <div className="mt-2 text-2xl font-bold">
                {stats.totalItems.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Value: {formatCurrency(stats.totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Low Stock</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-yellow-600">
                {stats.lowStockItems}
              </div>
              <div className="text-xs text-gray-500">Need attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600">
                {stats.outOfStockItems}
              </div>
              <div className="text-xs text-gray-500">Restock urgently</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Top Seller</span>
              </div>
              <div className="mt-2 text-sm font-bold">
                {stats.topSellingItems[0]?.productName || "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                {stats.topSellingItems[0]?.soldQuantity || 0} sold
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by product name or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Inventory Items ({filteredInventory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <DataTable
                columns={inventoryColumns}
                data={filteredInventory}
                total={filteredInventory.length}
                page={page}
                pageSize={pageSize}
                loading={loading}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onRefresh={loadInventoryData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          movement.type === "sale"
                            ? "bg-red-500"
                            : movement.type === "purchase"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">
                          {movement.variant.product.name} (
                          {movement.variant.sku})
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.reason} •{" "}
                          {new Date(movement.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium ${
                          movement.quantityChange > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.quantityChange > 0 ? "+" : ""}
                        {movement.quantityChange}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.quantityBefore} → {movement.quantityAfter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Stock Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.monthlyMovements}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#ef4444" name="Sales" />
                      <Bar
                        dataKey="purchases"
                        fill="#22c55e"
                        name="Purchases"
                      />
                      <Bar
                        dataKey="adjustments"
                        fill="#3b82f6"
                        name="Adjustments"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.topSellingItems.map((item, index) => (
                        <div
                          key={item.variantId}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sku}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {item.soldQuantity}
                            </div>
                            <div className="text-sm text-gray-500">sold</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Slow Moving Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.slowMovingItems.map((item, index) => (
                        <div
                          key={item.variantId}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sku}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-orange-600">
                              {item.daysSinceLastSale}
                            </div>
                            <div className="text-sm text-gray-500">
                              days ago
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>
          <StockAdjustmentForm
            onSubmit={handleStockAdjustment}
            onClose={() => setShowAdjustmentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
