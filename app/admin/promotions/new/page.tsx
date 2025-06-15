"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { adminVoucherApi, CreateVoucherData } from "@/lib/api/admin-vouchers";

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
    discountType: z.enum(["amount", "percent"], {
      required_error: "Please select a discount type",
    }),
    discountAmount: z
      .number()
      .min(0.01, "Discount amount must be greater than 0")
      .optional(),
    discountPercent: z
      .number()
      .min(0.01, "Discount percent must be greater than 0")
      .max(100, "Discount percent cannot exceed 100")
      .optional(),
    minOrderAmount: z
      .number()
      .min(0, "Minimum order amount cannot be negative")
      .optional(),
    maxDiscountAmount: z
      .number()
      .min(0, "Maximum discount amount cannot be negative")
      .optional(),
    startAt: z.date({
      required_error: "Start date is required",
    }),
    expireAt: z.date({
      required_error: "Expire date is required",
    }),
    usageLimit: z.number().min(1, "Usage limit must be at least 1").optional(),
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

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      isActive: true,
      discountType: "percent",
    },
    mode: "onChange",
  });

  const discountType = watch("discountType");
  const startAt = watch("startAt");
  const expireAt = watch("expireAt");

  const onSubmit = async (data: VoucherFormData) => {
    try {
      setLoading(true);

      const createData: CreateVoucherData = {
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

      await adminVoucherApi.createVoucher(createData);
      toast.success("Voucher created successfully!");
      router.push("/admin/promotions");
    } catch (error: any) {
      console.error("Error creating voucher:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create voucher";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            Create New Promotion
          </h1>
          <p className="text-muted-foreground">
            Create a new discount code or voucher for your customers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Voucher Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER2024"
                  {...register("code")}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setValue("code", value);
                  }}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your promotion..."
                  rows={3}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Active immediately</Label>
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={discountType}
                  onValueChange={(value: "amount" | "percent") =>
                    setValue("discountType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount (VND)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-sm text-destructive">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              {discountType === "percent" && (
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Discount Percentage *</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 20"
                    {...register("discountPercent", { valueAsNumber: true })}
                  />
                  {errors.discountPercent && (
                    <p className="text-sm text-destructive">
                      {errors.discountPercent.message}
                    </p>
                  )}
                </div>
              )}

              {discountType === "amount" && (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">
                    Discount Amount (VND) *
                  </Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min="1"
                    step="1000"
                    placeholder="e.g., 50000"
                    {...register("discountAmount", { valueAsNumber: true })}
                  />
                  {errors.discountAmount && (
                    <p className="text-sm text-destructive">
                      {errors.discountAmount.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">
                  Minimum Order Amount (VND)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g., 100000"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                />
                {errors.minOrderAmount && (
                  <p className="text-sm text-destructive">
                    {errors.minOrderAmount.message}
                  </p>
                )}
              </div>

              {discountType === "percent" && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">
                    Maximum Discount Amount (VND)
                  </Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g., 200000"
                    {...register("maxDiscountAmount", { valueAsNumber: true })}
                  />
                  {errors.maxDiscountAmount && (
                    <p className="text-sm text-destructive">
                      {errors.maxDiscountAmount.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage & Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Validity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="e.g., 100 (leave empty for unlimited)"
                  {...register("usageLimit", { valueAsNumber: true })}
                />
                {errors.usageLimit && (
                  <p className="text-sm text-destructive">
                    {errors.usageLimit.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Date Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startAt ? format(startAt, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startAt}
                      onSelect={(date) => setValue("startAt", date!)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startAt && (
                  <p className="text-sm text-destructive">
                    {errors.startAt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Expire Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expireAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expireAt
                        ? format(expireAt, "PPP")
                        : "Pick an expire date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expireAt}
                      onSelect={(date) => setValue("expireAt", date!)}
                      initialFocus
                      disabled={(date) => (startAt ? date <= startAt : false)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.expireAt && (
                  <p className="text-sm text-destructive">
                    {errors.expireAt.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/admin/promotions">
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Voucher"}
          </Button>
        </div>
      </form>
    </div>
  );
}
