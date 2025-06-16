"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import adminVoucherApi, { VoucherListResponse } from "@/lib/api/admin-vouchers";
import { Voucher } from "@/types";

export default function PromotionsPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVouchers();
  }, [page]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await adminVoucherApi.getVouchers({
        page,
        limit: 10,
        search: searchTerm,
      });
      console.log("Vouchers API response:", response);

      // Handle both direct array and wrapped response
      const vouchersData = Array.isArray(response) ? response : response.data;
      const metaData = response.meta || {
        total: vouchersData?.length || 0,
        limit: 10,
      };

      console.log("Processed vouchers data:", vouchersData);
      console.log("First voucher example:", vouchersData?.[0]);

      setVouchers(vouchersData || []);
      setTotalPages(Math.ceil((metaData.total || 0) / (metaData.limit || 10)));
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVouchers([]); // Set empty array on error
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchVouchers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      try {
        await adminVoucherApi.deleteVoucher(id);
        toast.success("Xóa voucher thành công!");
        fetchVouchers();
      } catch (error) {
        console.error("Error deleting voucher:", error);
        toast.error("Có lỗi xảy ra khi xóa voucher");
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/promotions/edit/${id}`);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminVoucherApi.toggleVoucherStatus(id);
      toast.success("Cập nhật trạng thái thành công!");
      fetchVouchers();
    } catch (error) {
      console.error("Error toggling voucher status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (!voucher.isActive) {
      return <Badge variant="secondary">Tạm dừng</Badge>;
    }
    if (now < startDate) {
      return <Badge variant="outline">Chưa bắt đầu</Badge>;
    }
    if (now > endDate) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    return <Badge variant="default">Đang hoạt động</Badge>;
  };
  const getDiscountDisplay = (voucher: Voucher) => {
    console.log("Voucher discount data:", {
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      voucherObject: voucher,
    });

    if (
      !voucher.discountType ||
      voucher.discountValue === undefined ||
      voucher.discountValue === null
    ) {
      return "N/A";
    }

    if (voucher.discountType === "amount") {
      return formatPrice(Number(voucher.discountValue) || 0);
    } else if (voucher.discountType === "percent") {
      return `${Number(voucher.discountValue) || 0}%`;
    }

    console.warn("Unknown discount type:", voucher.discountType);
    return "N/A";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý Voucher
            </h1>
            <p className="text-muted-foreground">
              Tạo và quản lý các mã giảm giá cho khách hàng
            </p>
          </div>
          <Link href="/admin/promotions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Voucher
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Voucher</CardTitle>
            <CardDescription>
              Quản lý tất cả các voucher trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                placeholder="Tìm kiếm voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Voucher</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Giảm giá</TableHead>
                    <TableHead>Đơn tối thiểu</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(vouchers) && vouchers.length > 0 ? (
                    vouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">
                          {voucher.code}
                        </TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell>{getDiscountDisplay(voucher)}</TableCell>
                        <TableCell>
                          {voucher.minOrderValue
                            ? formatPrice(voucher.minOrderValue)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {voucher.usedCount}
                          {voucher.usageLimit ? `/${voucher.usageLimit}` : ""}
                        </TableCell>
                        <TableCell>{getStatusBadge(voucher)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(voucher.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(voucher.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                {voucher.isActive ? "Tạm dừng" : "Kích hoạt"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(voucher.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        {loading ? "Đang tải..." : "Không có voucher nào"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <span className="flex items-center px-4">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
