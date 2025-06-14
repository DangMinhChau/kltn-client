"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send, Check, Gift, Bell, Star } from "lucide-react";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Vui lòng nhập email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail("");
      toast.success("Đăng ký thành công!", {
        description: "Cảm ơn bạn đã đăng ký nhận tin tức từ chúng tôi",
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Gift className="h-5 w-5 text-primary" />,
      title: "Ưu đãi độc quyền",
      description: "Nhận mã giảm giá đến 30% chỉ dành cho thành viên",
    },
    {
      icon: <Bell className="h-5 w-5 text-orange-500" />,
      title: "Thông báo sớm",
      description: "Cập nhật sản phẩm mới và flash sale trước mọi người",
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      title: "Nội dung độc quyền",
      description: "Tips phối đồ và xu hướng thời trang từ chuyên gia",
    },
  ];

  if (isSubscribed) {
    return (
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-blue-600">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="max-w-md mx-auto border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Đăng ký thành công!
              </h3>
              <p className="text-gray-600">
                Cảm ơn bạn đã đăng ký. Chúng tôi sẽ gửi những ưu đãi tốt nhất
                đến email của bạn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPgo8L3N2Zz4=')] opacity-20"></div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Mail className="h-4 w-4 mr-2" />
                Newsletter
              </Badge>

              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Đừng bỏ lỡ những ưu đãi{" "}
                  <span className="text-yellow-300">tuyệt vời</span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Đăng ký ngay để nhận thông tin về sản phẩm mới, flash sale và
                  những mã giảm giá độc quyền chỉ dành cho bạn.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-white/80 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Form */}
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Đăng ký ngay
                  </h3>
                  <p className="text-gray-600">
                    Nhập email để nhận ưu đãi đặc biệt
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Nhập địa chỉ email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 px-4 text-base border-2 border-gray-200 focus:border-primary"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-5 w-5 mr-2" />
                        Đăng ký nhận tin
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Bằng cách đăng ký, bạn đồng ý với{" "}
                    <button className="text-primary hover:underline">
                      Điều khoản dịch vụ
                    </button>{" "}
                    và{" "}
                    <button className="text-primary hover:underline">
                      Chính sách bảo mật
                    </button>{" "}
                    của chúng tôi.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
