"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return {
          label: "Chờ thanh toán",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case "PROCESSING":
        return {
          label: "Đang xử lý",
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };
      case "COMPLETED":
      case "PAID":
        return {
          label: "Đã thanh toán",
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case "FAILED":
        return {
          label: "Thất bại",
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
      case "REFUNDED":
        return {
          label: "Đã hoàn tiền",
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
