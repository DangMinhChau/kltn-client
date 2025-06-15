"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Percent,
  Calendar,
  Users,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Promotion {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  startDate: string;
  endDate?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC",
    page: 1,
    limit: 20,
  });

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    fetchPromotions();
  }, [filters]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual admin API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockPromotions: Promotion[] = [
        {
          id: "1",
          name: "Summer Sale 2024",
          code: "SUMMER2024",
          description: "Giảm giá mùa hè cho tất cả sản phẩm",
          type: "percentage",
          value: 20,
          minOrderValue: 500000,
          maxDiscountAmount: 200000,
          isActive: true,
          usageCount: 125,
          usageLimit: 1000,
          startDate: "2024-06-01T00:00:00Z",
          endDate: "2024-08-31T23:59:59Z",
          createdAt: "2024-05-15T10:30:00Z",
          updatedAt: "2024-06-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Free Shipping Promo",
          code: "FREESHIP",
          description: "Miễn phí vận chuyển cho đơn hàng trên 300k",
          type: "free_shipping",
          value: 0,
          minOrderValue: 300000,
          isActive: true,
          usageCount: 89,
          startDate: "2024-01-01T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "New Customer Discount",
          code: "WELCOME50",
          description: "Giảm 50k cho khách hàng mới",
          type: "fixed_amount",
          value: 50000,
          minOrderValue: 200000,
          isActive: false,
          usageCount: 245,
          usageLimit: 500,
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-05-31T23:59:59Z",
          createdAt: "2023-12-15T10:30:00Z",
          updatedAt: "2024-06-01T00:00:00Z",
        },
      ];

      setPromotions(mockPromotions);
      setPagination({
        page: 1,
        limit: 20,
        total: mockPromotions.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : Number(value),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      // Mock API call - replace with actual admin API
      toast.success("Promotion deleted successfully");
      fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.isActive) return false;

    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

    if (now < startDate) return false;
    if (endDate && now > endDate) return false;
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit)
      return false;

    return true;
  };

  const StatusBadge = ({ promotion }: { promotion: Promotion }) => {
    const active = isPromotionActive(promotion);
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

    if (!promotion.isActive) {
      return <Badge variant="secondary">Disabled</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return <Badge variant="destructive">Usage Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const TypeBadge = ({
    type,
    value,
  }: {
    type: Promotion["type"];
    value: number;
  }) => {
    switch (type) {
      case "percentage":
        return (
          <Badge variant="outline">
            <Percent className="h-3 w-3 mr-1" />
            {value}% Off
          </Badge>
        );
      case "fixed_amount":
        return (
          <Badge variant="outline">
            <Tag className="h-3 w-3 mr-1" />
            {formatPrice(value)}
          </Badge>
        );
      case "free_shipping":
        return <Badge variant="outline">Free Shipping</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage discount codes, coupons and promotional campaigns
          </p>
        </div>
        <Link href="/admin/promotions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Promotions
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">All time promotions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Promotions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotions.filter((p) => isPromotionActive(p)).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                promotions.filter((p) => {
                  if (!p.endDate) return false;
                  const endDate = new Date(p.endDate);
                  const weekFromNow = new Date();
                  weekFromNow.setDate(weekFromNow.getDate() + 7);
                  return endDate <= weekFromNow && endDate > new Date();
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promotions..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isActive}
              onValueChange={(value) => handleFilterChange("isActive", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as "ASC" | "DESC",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-DESC">Newest first</SelectItem>
                <SelectItem value="createdAt-ASC">Oldest first</SelectItem>
                <SelectItem value="startDate-DESC">
                  Start date (newest)
                </SelectItem>
                <SelectItem value="startDate-ASC">
                  Start date (oldest)
                </SelectItem>
                <SelectItem value="usageCount-DESC">Most used</SelectItem>
                <SelectItem value="usageCount-ASC">Least used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{promotion.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code:{" "}
                          <code className="bg-muted px-1 rounded">
                            {promotion.code}
                          </code>
                        </div>
                        {promotion.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {promotion.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TypeBadge
                        type={promotion.type}
                        value={promotion.value}
                      />
                    </TableCell>
                    <TableCell>
                      {promotion.minOrderValue ? (
                        formatPrice(promotion.minOrderValue)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {promotion.usageCount}
                        </div>
                        {promotion.usageLimit && (
                          <div className="text-sm text-muted-foreground">
                            / {promotion.usageLimit} limit
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>From: {formatDate(promotion.startDate)}</div>
                        {promotion.endDate && (
                          <div>To: {formatDate(promotion.endDate)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge promotion={promotion} />
                    </TableCell>
                    <TableCell>{formatDate(promotion.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/promotions/${promotion.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/promotions/${promotion.id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(promotion.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
