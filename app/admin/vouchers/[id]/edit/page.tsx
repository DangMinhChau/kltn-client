"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVoucher } from "@/lib/hooks/useAdminData";
import { useUpdateVoucher } from "@/lib/hooks/useAdminMutations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code must be less than 20 characters")
      .regex(
        /^[A-Z0-9]+$/,
        "Code must contain only uppercase letters and numbers"
      ),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
    value: z.number().min(0, "Value must be positive"),
    maximumDiscount: z.number().optional(),
    minimumOrderAmount: z
      .number()
      .min(0, "Minimum order amount must be positive")
      .optional(),
    usageLimit: z.number().min(1, "Usage limit must be at least 1").optional(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage value cannot exceed 100%",
      path: ["value"],
    }
  );

type VoucherFormValues = z.infer<typeof voucherSchema>;

export default function EditVoucherPage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = params.id as string;

  const {
    data: voucher,
    loading: loadingVoucher,
    error,
  } = useVoucher(voucherId);
  const updateVoucher = useUpdateVoucher();

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "PERCENTAGE",
      value: 0,
      minimumOrderAmount: 0,
      isActive: true,
    },
  });

  // Update form values when voucher data is loaded
  useEffect(() => {
    if (voucher) {
      form.reset({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || "",
        type: voucher.type,
        value: voucher.value,
        maximumDiscount: voucher.maximumDiscount,
        minimumOrderAmount: voucher.minimumOrderAmount || 0,
        usageLimit: voucher.usageLimit,
        startDate: new Date(voucher.startDate),
        endDate: new Date(voucher.endDate),
        isActive: voucher.isActive,
      });
    }
  }, [voucher, form]);

  const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("code", result);
  };

  const onSubmit = async (data: VoucherFormValues) => {
    try {
      await updateVoucher.mutate({
        id: voucherId,
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      toast.success("Voucher updated successfully");
      router.push("/admin/vouchers");
    } catch (error) {
      console.error("Failed to update voucher:", error);
    }
  };

  if (loadingVoucher) {
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

  const watchedType = form.watch("type");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Voucher</h1>
          <p className="text-muted-foreground">
            Update voucher information and settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Voucher Information</CardTitle>
              <CardDescription>
                Update the settings for this discount voucher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Code and Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voucher Code</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                placeholder="SUMMER2024"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateVoucherCode}
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormDescription>
                            Unique code that customers will use to apply the
                            voucher.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voucher Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Sale 2024" {...field} />
                          </FormControl>
                          <FormDescription>
                            Display name for the voucher.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the voucher and any terms..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description shown to customers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Discount Type and Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">
                                Percentage
                              </SelectItem>
                              <SelectItem value="FIXED_AMOUNT">
                                Fixed Amount
                              </SelectItem>
                              <SelectItem value="FREE_SHIPPING">
                                Free Shipping
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchedType === "PERCENTAGE"
                              ? "Discount Percentage"
                              : watchedType === "FIXED_AMOUNT"
                              ? "Discount Amount (₫)"
                              : "Shipping Value (₫)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                watchedType === "PERCENTAGE" ? "20" : "50000"
                              }
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              disabled={watchedType === "FREE_SHIPPING"}
                            />
                          </FormControl>
                          <FormDescription>
                            {watchedType === "PERCENTAGE" &&
                              "Enter percentage (e.g., 20 for 20%)"}
                            {watchedType === "FIXED_AMOUNT" &&
                              "Enter fixed discount amount in VND"}
                            {watchedType === "FREE_SHIPPING" &&
                              "Free shipping value (optional)"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {watchedType === "PERCENTAGE" && (
                      <FormField
                        control={form.control}
                        name="maximumDiscount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Discount (₫)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100000"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number(e.target.value) || undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum discount amount for percentage vouchers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="minimumOrderAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order Amount (₫)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum order value required to use this voucher.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usageLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of times this voucher can be used.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Validity Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the voucher becomes valid.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate");
                                  return startDate && date <= startDate;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When the voucher expires.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Active Toggle */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Whether this voucher is active and can be used by
                            customers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateVoucher.loading}>
                      {updateVoucher.loading ? "Updating..." : "Update Voucher"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Voucher Preview</CardTitle>
              <CardDescription>
                Preview how your voucher will appear to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-mono font-bold">
                    {form.watch("code") || "VOUCHER_CODE"}
                  </div>
                  <div className="text-sm font-medium">
                    {form.watch("name") || "Voucher Name"}
                  </div>
                  {form.watch("description") && (
                    <div className="text-xs text-muted-foreground">
                      {form.watch("description")}
                    </div>
                  )}
                  <div className="text-sm">
                    {watchedType === "PERCENTAGE" && (
                      <span className="font-bold text-green-600">
                        {form.watch("value")}% OFF
                      </span>
                    )}
                    {watchedType === "FIXED_AMOUNT" && (
                      <span className="font-bold text-green-600">
                        {form.watch("value").toLocaleString()}₫ OFF
                      </span>
                    )}
                    {watchedType === "FREE_SHIPPING" && (
                      <span className="font-bold text-green-600">
                        FREE SHIPPING
                      </span>
                    )}
                  </div>
                  {form.watch("minimumOrderAmount") > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Min. order:{" "}
                      {form.watch("minimumOrderAmount").toLocaleString()}₫
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Current usage statistics for this voucher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Times Used
                  </span>
                  <span className="font-medium">
                    {voucher.usedCount}
                    {voucher.usageLimit ? `/${voucher.usageLimit}` : ""}
                  </span>
                </div>
                {voucher.usageLimit && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage Rate</span>
                      <span>
                        {(
                          (voucher.usedCount / voucher.usageLimit) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (voucher.usedCount / voucher.usageLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(voucher.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Updated
                  </span>
                  <span className="text-sm">
                    {new Date(voucher.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
