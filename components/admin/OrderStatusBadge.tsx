"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          label: "Chờ xử lý",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case OrderStatus.PROCESSING:
        return {
          label: "Đang xử lý",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };
      case OrderStatus.SHIPPED:
        return {
          label: "Đã gửi hàng",
          variant: "default" as const,
          className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        };
      case OrderStatus.DELIVERED:
        return {
          label: "Đã giao hàng",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      case OrderStatus.COMPLETED:
        return {
          label: "Hoàn thành",
          variant: "default" as const,
          className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        };
      case OrderStatus.CANCELLED:
        return {
          label: "Đã hủy",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
        };
      case OrderStatus.RETURNED:
        return {
          label: "Đã trả hàng",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
