import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, Clock, Bell, ArrowRight } from "lucide-react";

export function SaleEmptyState() {
  return (
    <div className="text-center py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Hiện tại chưa có sản phẩm sale
            </h3>
            <p className="text-muted-foreground mb-6">
              Chúng tôi sẽ thường xuyên cập nhật những ưu đãi hấp dẫn cho bạn.
              Hãy theo dõi để không bỏ lỡ!
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link
                href="/products"
                className="flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Khám phá sản phẩm khác
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // TODO: Implement newsletter subscription
                alert("Tính năng đăng ký nhận thông báo sẽ sớm được cập nhật!");
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Nhận thông báo khi có sale
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Mẹo hay</span>
            </div>
            <p className="text-xs text-blue-700">
              Theo dõi fanpage và website để cập nhật những đợt sale sớm nhất!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
