"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Shield,
  Clock,
  Heart,
  Star,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const FeaturesSection = () => {
  const features = [
    {
      icon: <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-primary" />,
      title: "Giỏ hàng thông minh",
      description:
        "Quản lý đơn hàng dễ dàng với hệ thống giỏ hàng hiện đại và tự động lưu trữ",
      color: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      icon: <Package className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />,
      title: "Theo dõi đơn hàng",
      description:
        "Cập nhật trạng thái đơn hàng realtime từ khi đặt đến khi nhận hàng",
      color: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
    },
    {
      icon: <Truck className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />,
      title: "Giao hàng nhanh",
      description:
        "Miễn phí ship toàn quốc cho đơn hàng từ 500K. Giao hàng trong 1-3 ngày",
      color: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
    },
    {
      icon: <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />,
      title: "Thanh toán an toàn",
      description: "Hỗ trợ COD, Banking, MoMo, VNPay với bảo mật SSL 256-bit",
      color: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
    },
    {
      icon: <Shield className="h-6 w-6 md:h-8 md:w-8 text-red-600" />,
      title: "Bảo hành chính hãng",
      description:
        "Cam kết 100% hàng chính hãng với chính sách đổi trả linh hoạt",
      color: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
    },
    {
      icon: <Clock className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />,
      title: "Hỗ trợ 24/7",
      description:
        "Đội ngũ CSKH chuyên nghiệp sẵn sàng hỗ trợ bạn mọi lúc mọi nơi",
      color: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      iconBg: "bg-indigo-100",
    },
  ];

  const stats = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      value: "10K+",
      label: "Khách hàng tin tưởng",
    },
    {
      icon: <Package className="h-6 w-6 text-green-600" />,
      value: "50K+",
      label: "Đơn hàng hoàn thành",
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      value: "4.9/5",
      label: "Đánh giá từ khách hàng",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      value: "99%",
      label: "Tỷ lệ hài lòng",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <Badge className="mb-4" variant="outline">
            <Zap className="h-3 w-3 mr-1" />
            Tính năng nổi bật
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
            Trải nghiệm mua sắm <span className="text-primary">hoàn hảo</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống mua sắm online hiện đại với đầy đủ tính năng từ giỏ hàng
            thông minh đến theo dõi đơn hàng realtime
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden bg-gradient-to-br ${feature.color} border ${feature.borderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`p-3 rounded-xl ${feature.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Stats Section */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg bg-gray-50">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Sẵn sàng trải nghiệm?
              </h3>
              <p className="text-lg opacity-90 mb-6">
                Khám phá hàng nghìn sản phẩm chất lượng với hệ thống mua sắm
                tiện lợi nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50"
                >
                  <Link href="/products">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Mua sắm ngay
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  <Link href="/orders">
                    <Package className="mr-2 h-5 w-5" />
                    Theo dõi đơn hàng
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
