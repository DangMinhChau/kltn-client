"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, TrendingUp, Users } from "lucide-react";
import LazyLoad from "@/components/common/LazyLoad";
import PaymentMethods from "./PaymentMethods";

const BrandShowcase = () => {
  const achievements = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      number: "50K+",
      label: "Khách hàng tin tưởng",
      description: "Phục vụ hơn 50,000 khách hàng trên toàn quốc",
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      number: "4.9/5",
      label: "Đánh giá cao",
      description: "Điểm đánh giá trung bình từ khách hàng",
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      number: "5",
      label: "Năm kinh nghiệm",
      description: "Trong lĩnh vực thời trang nam",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      number: "98%",
      label: "Tỷ lệ hài lòng",
      description: "Khách hàng quay lại mua sắm",
    },
  ];

  const brandValues = [
    {
      title: "Chất lượng cao cấp",
      description:
        "Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất với chất liệu tốt nhất.",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Phong cách hiện đại",
      description:
        "Thiết kế theo xu hướng thời trang quốc tế, phù hợp với phong cách nam giới Việt.",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "Dịch vụ tận tâm",
      description:
        "Đội ngũ tư vấn chuyên nghiệp, hỗ trợ khách hàng 24/7 với thái độ nhiệt tình.",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
  ];
  return (
    <LazyLoad fallback={<div className="h-96 bg-muted animate-pulse" />}>
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <Badge className="mb-4" variant="outline">
              <Award className="h-3 w-3 mr-1" />
              Thương hiệu uy tín
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tại sao chọn <span className="text-primary">MenFashion</span>?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi tự hào là thương hiệu thời trang nam được yêu thích và
              tin tưởng nhất tại Việt Nam
            </p>
          </div>
          {/* Achievements Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    {achievement.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    {achievement.label}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Brand Values */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {brandValues.map((value, index) => (
              <Card
                key={index}
                className={`${value.color} border-2 hover:shadow-lg transition-all duration-300`}
              >
                <CardContent className="p-6 lg:p-8">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4 ${value.iconColor}`}
                  >
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>{" "}
          {/* Payment Methods */}
          <PaymentMethods />
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 lg:p-12 text-white">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Trải nghiệm mua sắm tuyệt vời ngay hôm nay
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Tham gia cộng đồng hơn 50,000 khách hàng đã tin tưởng lựa chọn
                MenFashion
              </p>{" "}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-base">
                  ✨ Miễn phí vận chuyển toàn quốc
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-base">
                  🎁 Ưu đãi đặc biệt cho khách hàng mới
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazyLoad>
  );
};

export default BrandShowcase;
