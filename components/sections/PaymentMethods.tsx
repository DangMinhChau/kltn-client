/**
 * PaymentMethods Component
 *
 * Displays supported payment methods with beautiful icons and descriptions.
 * Used in checkout to show payment options.
 *
 * Features:
 * - PayPal integration (primary payment method)
 * - COD (Cash on Delivery)
 * - Responsive grid layout
 * - Hover animations and visual feedback
 * - Security features section
 */
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Smartphone,
  Building2,
  Truck,
  ShoppingBag,
  Zap,
} from "lucide-react";

export default function PaymentMethods() {
  const paymentMethods = [
    {
      name: "PayPal",
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      description: "Thanh toán quốc tế",
      color: "bg-blue-50 border-blue-200",
    },
    {
      name: "COD",
      icon: <Truck className="h-6 w-6 text-orange-600" />,
      description: "Thanh toán khi nhận hàng",
      color: "bg-orange-50 border-orange-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div className="text-center">
        <Badge className="mb-4" variant="outline">
          <CreditCard className="h-3 w-3 mr-1" />
          Phương thức thanh toán
        </Badge>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-8">
          Thanh toán an toàn & tiện lợi
        </h3>

        <div className="grid grid-cols-2 gap-4 lg:gap-6 max-w-md mx-auto">
          {paymentMethods.map((method, index) => (
            <Card
              key={index}
              className={`${method.color} hover:shadow-lg transition-all duration-300 border-2 hover:scale-105 group`}
            >
              <CardContent className="flex flex-col items-center justify-center p-4 h-24">
                <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {method.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {method.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Bảo mật tuyệt đối
          </h4>
          <p className="text-sm text-gray-600">
            Mã hóa SSL 256-bit, bảo vệ thông tin thanh toán của bạn
          </p>
        </div>

        <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">
            Xử lý nhanh chóng
          </h4>
          <p className="text-sm text-gray-600">
            Giao dịch được xử lý trong vòng 30 giây
          </p>
        </div>

        <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
            <Truck className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Linh hoạt</h4>
          <p className="text-sm text-gray-600">
            Hỗ trợ COD toàn quốc, hoàn tiền 100% nếu không hài lòng
          </p>
        </div>
      </div>
    </div>
  );
}
