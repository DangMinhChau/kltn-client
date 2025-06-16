"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OrderStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface UpdateOrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: OrderStatus;
  orderId: string;
  onUpdate: (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => Promise<void>;
}

export function UpdateOrderStatusDialog({
  isOpen,
  onClose,
  currentStatus,
  orderId,
  onUpdate,
}: UpdateOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus && !note.trim()) {
      onClose();
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(orderId, selectedStatus, note.trim() || undefined);
      onClose();
      setNote("");
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { value: OrderStatus.PENDING, label: "Chờ xử lý" },
    { value: OrderStatus.PROCESSING, label: "Đang xử lý" },
    { value: OrderStatus.SHIPPED, label: "Đã gửi hàng" },
    { value: OrderStatus.DELIVERED, label: "Đã giao hàng" },
    { value: OrderStatus.COMPLETED, label: "Hoàn thành" },
    { value: OrderStatus.CANCELLED, label: "Đã hủy" },
    { value: OrderStatus.RETURNED, label: "Đã trả hàng" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          <DialogDescription>
            Thay đổi trạng thái đơn hàng và thêm ghi chú nếu cần.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái mới</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Thêm ghi chú về việc thay đổi trạng thái..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
