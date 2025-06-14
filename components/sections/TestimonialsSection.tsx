"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight, Users } from "lucide-react";
import Image from "next/image";

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Anh Minh",
      role: "Nhân viên văn phòng",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment:
        "Chất lượng áo sơ mi tuyệt vời, form dáng chuẩn và vải rất mềm mại. Đã mua 3 chiếc rồi và sẽ tiếp tục ủng hộ shop.",
      product: "Áo sơ mi premium",
      verified: true,
    },
    {
      id: 2,
      name: "Chị Lan",
      role: "Marketing Manager",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b829?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment:
        "Mua cho chồng và anh ấy rất thích. Giao hàng nhanh, đóng gói cẩn thận. Sẽ giới thiệu cho bạn bè.",
      product: "Bộ suit cao cấp",
      verified: true,
    },
    {
      id: 3,
      name: "Anh Đức",
      role: "Sinh viên",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment:
        "Giá cả hợp lý, phù hợp với sinh viên. Áo polo chất lượng tốt, mặc thoải mái và không phai màu.",
      product: "Áo polo basic",
      verified: true,
    },
    {
      id: 4,
      name: "Anh Hùng",
      role: "Giám đốc kinh doanh",
      avatar:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment:
        "Dịch vụ chăm sóc khách hàng tuyệt vời. Nhân viên tư vấn nhiệt tình, sản phẩm đúng như mô tả.",
      product: "Áo khoác blazer",
      verified: true,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <Badge className="mb-4" variant="outline">
            <Users className="h-3 w-3 mr-1" />
            Khách hàng nói gì
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Đánh giá từ <span className="text-primary">khách hàng thật</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Hơn 50,000+ khách hàng đã tin tưởng và lựa chọn sản phẩm của chúng
            tôi
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-0 shadow-xl bg-white relative overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="h-16 w-16 text-primary" />
              </div>

              <div className="grid lg:grid-cols-3 gap-8 items-center">
                {/* Avatar and Info */}
                <div className="text-center lg:text-left">
                  <div className="relative inline-block mb-4">
                    <Image
                      src={currentData.avatar}
                      alt={currentData.name}
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                    {currentData.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                        <Star className="h-4 w-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {currentData.name}
                  </h4>
                  <p className="text-gray-600 mb-2">{currentData.role}</p>
                  <div className="flex justify-center lg:justify-start space-x-1 mb-2">
                    {renderStars(currentData.rating)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Đã mua: {currentData.product}
                  </Badge>
                </div>

                {/* Testimonial Content */}
                <div className="lg:col-span-2">
                  <blockquote className="text-lg lg:text-xl text-gray-700 leading-relaxed italic mb-6">
                    "{currentData.comment}"
                  </blockquote>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentTestimonial
                              ? "bg-primary scale-125"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevTestimonial}
                        className="h-10 w-10 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextTestimonial}
                        className="h-10 w-10 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              50K+
            </div>
            <div className="text-gray-600">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              4.9
            </div>
            <div className="text-gray-600">Đánh giá trung bình</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              99%
            </div>
            <div className="text-gray-600">Tỷ lệ hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              24/7
            </div>
            <div className="text-gray-600">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
