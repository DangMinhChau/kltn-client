"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import adminVoucherApi, { UpdateVoucherData } from "@/lib/api/admin-vouchers";
import Link from "next/link";
import { Voucher } from "@/types";

// Reuse the same schema from create page
const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(50, "Code must be less than 50 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(255, "Description must be less than 255 characters"),
    discountType: z.enum(["amount", "percent"]),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
    minOrderAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
    startAt: z.date({
      required_error: "Start date is required",
    }),
    expireAt: z.date({
      required_error: "Expire date is required",
    }),
    usageLimit: z.number().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.discountType === "amount" && !data.discountAmount) {
        return false;
      }
      if (data.discountType === "percent" && !data.discountPercent) {
        return false;
      }
      return true;
    },
    {
      message: "Discount value is required based on selected type",
      path: ["discountAmount", "discountPercent"],
    }
  )
  .refine(
    (data) => {
      return data.startAt < data.expireAt;
    },
    {
      message: "Start date must be before expire date",
      path: ["expireAt"],
    }
  );

type VoucherFormData = z.infer<typeof voucherSchema>;

export default function EditVoucherPage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    mode: "onChange",
  });

  const discountType = watch("discountType");

  // Fetch voucher data
  useEffect(() => {
    if (voucherId) {
      fetchVoucher();
    }
  }, [voucherId]);

  const fetchVoucher = async () => {
    try {
      setFetching(true);
      const response = await adminVoucherApi.getVoucher(voucherId);
      const voucherData = response.data;
      setVoucher(voucherData); // Populate form with voucher data
      reset({
        code: voucherData.code,
        description: voucherData.description,
        discountType:
          voucherData.discountType === "FIXED_AMOUNT" ? "amount" : "percent",
        discountAmount:
          voucherData.discountType === "FIXED_AMOUNT"
            ? voucherData.discountValue
            : undefined,
        discountPercent:
          voucherData.discountType === "PERCENTAGE"
            ? voucherData.discountValue
            : undefined,
        minOrderAmount: voucherData.minOrderAmount,
        maxDiscountAmount: voucherData.maxDiscountAmount,
        startAt: new Date(voucherData.startDate),
        expireAt: new Date(voucherData.endDate),
        usageLimit: voucherData.usageLimit,
        isActive: voucherData.isActive,
      });
    } catch (error: any) {
      console.error("Error fetching voucher:", error);
      toast.error("Không thể tải thông tin voucher");
      router.push("/admin/promotions");
    } finally {
      setFetching(false);
    }
  };

  const handleDiscountTypeChange = (value: string) => {
    setValue("discountType", value as "amount" | "percent");
    // Clear the opposite field
    if (value === "amount") {
      setValue("discountPercent", undefined);
    } else {
      setValue("discountAmount", undefined);
    }
  };
  const onSubmit = async (data: VoucherFormData) => {
    console.log("Form submitted with data:", data);

    try {
      setLoading(true);

      const updateData: UpdateVoucherData = {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountAmount:
          data.discountType === "amount" ? data.discountAmount : undefined,
        discountPercent:
          data.discountType === "percent" ? data.discountPercent : undefined,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startAt: data.startAt.toISOString(),
        expireAt: data.expireAt.toISOString(),
        usageLimit: data.usageLimit,
        isActive: data.isActive,
      };

      console.log("Sending update data to API:", updateData);

      const result = await adminVoucherApi.updateVoucher(voucherId, updateData);
      console.log("API response:", result);

      toast.success("Cập nhật voucher thành công!");
      router.push("/admin/promotions");
    } catch (error: any) {
      console.error("Error updating voucher:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
      });

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update voucher";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải thông tin voucher...</p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy voucher</p>
          <Link href="/admin/promotions">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/promotions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa Voucher
          </h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin voucher {voucher.code}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã Voucher *</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER2024"
                  {...register("code")}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả *</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về voucher"
                  {...register("description")}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                  />
                  <Label>{watch("isActive") ? "Kích hoạt" : "Tạm dừng"}</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình giảm giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loại giảm giá *</Label>
                <Select
                  value={discountType}
                  onValueChange={handleDiscountTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giảm giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="amount">
                      Số tiền cố định (VNĐ)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountType === "percent" && (
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">
                    Phần trăm giảm giá (%) *
                  </Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 20"
                    {...register("discountPercent", { valueAsNumber: true })}
                    className={errors.discountPercent ? "border-red-500" : ""}
                  />
                  {errors.discountPercent && (
                    <p className="text-sm text-red-500">
                      {errors.discountPercent.message}
                    </p>
                  )}
                </div>
              )}

              {discountType === "amount" && (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">
                    Số tiền giảm giá (VNĐ) *
                  </Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="e.g., 50000"
                    {...register("discountAmount", { valueAsNumber: true })}
                    className={errors.discountAmount ? "border-red-500" : ""}
                  />
                  {errors.discountAmount && (
                    <p className="text-sm text-red-500">
                      {errors.discountAmount.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g., 100000"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g., 500000"
                  {...register("maxDiscountAmount", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Usage Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Thời gian & Sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("startAt") && "text-muted-foreground",
                          errors.startAt && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("startAt") ? (
                          format(watch("startAt"), "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("startAt")}
                        onSelect={(date) =>
                          setValue("startAt", date || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startAt && (
                    <p className="text-sm text-red-500">
                      {errors.startAt.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ngày kết thúc *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("expireAt") && "text-muted-foreground",
                          errors.expireAt && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("expireAt") ? (
                          format(watch("expireAt"), "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("expireAt")}
                        onSelect={(date) =>
                          setValue("expireAt", date || new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expireAt && (
                    <p className="text-sm text-red-500">
                      {errors.expireAt.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="e.g., 100 (để trống = không giới hạn)"
                  {...register("usageLimit", { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Để trống nếu không muốn giới hạn số lần sử dụng
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Đã sử dụng:</strong> {voucher.usageCount} lần
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/admin/promotions">
            <Button variant="outline" type="button" disabled={loading}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật Voucher"}
          </Button>
        </div>
      </form>
    </div>
  );
}
