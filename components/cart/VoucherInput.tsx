"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Tag, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { VoucherValidationResult } from "@/types";
import { voucherApi } from "@/lib/api/vouchers";
import { formatPrice } from "@/lib/utils";

interface VoucherInputProps {
  cartTotal: number;
  onVoucherApplied: (voucher: VoucherValidationResult) => void;
  onVoucherRemoved: () => void;
  appliedVoucher: VoucherValidationResult | null;
  disabled?: boolean;
}

export default function VoucherInput({
  cartTotal,
  onVoucherApplied,
  onVoucherRemoved,
  appliedVoucher,
  disabled = false,
}: VoucherInputProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (cartTotal <= 0) {
      toast.error("Giỏ hàng trống, không thể áp dụng voucher");
      return;
    }

    setIsValidating(true);
    try {
      const response = await voucherApi.validateVoucher(
        voucherCode.trim(),
        cartTotal
      );

      console.log("VoucherInput - Validation response:", response);
      const validationResult = response;

      if (validationResult.isValid) {
        const voucherResult: VoucherValidationResult = {
          isValid: true,
          voucher: validationResult.voucher!,
          discountAmount:
            typeof validationResult.discountAmount === "string"
              ? parseFloat(validationResult.discountAmount)
              : validationResult.discountAmount || 0,
          message: "Voucher áp dụng thành công!",
        };

        console.log("VoucherInput - Created voucher result:", voucherResult);

        onVoucherApplied(voucherResult);
        toast.success("Áp dụng voucher thành công!");
        setVoucherCode("");
      } else {
        toast.error(validationResult.error || "Mã voucher không hợp lệ");
      }
    } catch (error: any) {
      console.error("Error validating voucher:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể kiểm tra voucher. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  }, [voucherCode, cartTotal, onVoucherApplied]);

  const removeVoucher = useCallback(() => {
    onVoucherRemoved();
    toast.success("Đã xóa voucher");
  }, [onVoucherRemoved]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating && voucherCode.trim()) {
      validateVoucher();
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Mã giảm giá</span>
        </div>

        {!appliedVoucher ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={disabled || isValidating}
                className="flex-1"
                maxLength={50}
              />
              <Button
                onClick={validateVoucher}
                disabled={disabled || isValidating || !voucherCode.trim()}
                size="sm"
                className="px-4"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Áp dụng"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nhập mã voucher để nhận ưu đãi đặc biệt
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {appliedVoucher.voucher?.code}
                    </Badge>
                    <span className="text-sm font-medium text-green-700">
                      -{formatPrice(appliedVoucher.discountAmount)}
                    </span>
                  </div>
                  {appliedVoucher.voucher?.description && (
                    <p className="text-xs text-green-600 mt-1">
                      {appliedVoucher.voucher.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={removeVoucher}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiết kiệm:</span>
              <span className="font-medium text-green-600">
                -{formatPrice(appliedVoucher.discountAmount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
