"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

const Footer = () => {
  const [email, setEmail] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implement newsletter subscription
      console.log("Subscribe email:", email);
      setEmail("");
      // Show success message
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      {" "}
      {/* Newsletter Section */}
      <div className="bg-slate-800 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              Đăng ký nhận tin tức mới nhất
            </h3>
            <p className="text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg px-4 sm:px-0">
              Cập nhật xu hướng thời trang, khuyến mãi độc quyền và bộ sưu tập
              mới
            </p>{" "}
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto px-4 sm:px-0"
            >
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-10 sm:h-11"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 h-10 sm:h-11 px-4 sm:px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Đăng ký</span>
              </Button>
            </form>
          </div>
        </div>
      </div>{" "}
      {/* Main Footer Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <div>
              <Link
                href="/"
                className="flex items-center space-x-2 mb-3 sm:mb-4"
              >
                <div className="bg-primary text-primary-foreground rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-lg sm:text-xl">
                  MF
                </div>
                <span className="font-bold text-lg sm:text-xl">
                  Men's Fashion
                </span>
              </Link>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Thương hiệu thời trang nam hàng đầu Việt Nam, mang đến phong
                cách hiện đại và chất lượng cao cấp.
              </p>
            </div>{" "}
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-slate-300 text-sm sm:text-base">
                  123 Nguyễn Huệ, Q1, TP.HCM
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-slate-300 text-sm sm:text-base">
                  1900 1234
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-slate-300 text-sm sm:text-base">
                  info@mensfashion.vn
                </span>
              </div>
            </div>
            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Kết nối với chúng tôi
              </h4>
              <div className="flex space-x-2 sm:space-x-3">
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-slate-700 hover:bg-slate-600 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-slate-700 hover:bg-slate-600 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-slate-700 hover:bg-slate-600 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-slate-700 hover:bg-slate-600 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Giới thiệu", href: "/about" },
                { label: "Sản phẩm", href: "/products" },
                { label: "Bộ sưu tập", href: "/collections" },
                { label: "Sale", href: "/sale" },
                { label: "Blog", href: "/blog" },
                { label: "Liên hệ", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "Hướng dẫn mua hàng", href: "/guide" },
                { label: "Chính sách đổi trả", href: "/return-policy" },
                { label: "Chính sách bảo hành", href: "/warranty" },
                { label: "Phương thức thanh toán", href: "/payment" },
                { label: "Vận chuyển", href: "/shipping" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-primary transition-colors text-sm sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Store Features */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6">
              Cam kết chất lượng
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-medium text-sm sm:text-base">
                    Miễn phí vận chuyển
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Đơn hàng từ 500K
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-medium text-sm sm:text-base">
                    Đổi trả trong 30 ngày
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Miễn phí đổi trả
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-medium text-sm sm:text-base">
                    Bảo hành chính hãng
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Cam kết 100%
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-medium text-sm sm:text-base">
                    Thanh toán an toàn
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Bảo mật SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Payment Methods */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Phương thức thanh toán
              </h4>
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
                <div className="bg-white rounded p-1.5 sm:p-2 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-xs sm:text-sm">
                    VISA
                  </span>
                </div>
                <div className="bg-white rounded p-1.5 sm:p-2 flex-shrink-0">
                  <span className="text-red-600 font-bold text-xs sm:text-sm">
                    MC
                  </span>
                </div>
                <div className="bg-white rounded p-1.5 sm:p-2 flex-shrink-0">
                  <span className="text-blue-800 font-bold text-xs sm:text-sm">
                    MOMO
                  </span>
                </div>
                <div className="bg-white rounded p-1.5 sm:p-2 flex-shrink-0">
                  <span className="text-green-600 font-bold text-xs sm:text-sm">
                    GRAB
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:text-right">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                Giấy phép kinh doanh
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm">
                Số ĐKKD: 0123456789 - Ngày cấp: 01/01/2020
              </p>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Bottom Footer */}
      <div className="bg-slate-950 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <Separator className="mb-4 sm:mb-6 bg-slate-700" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <p className="text-slate-400 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} Men's Fashion. All rights reserved.
            </p>

            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs sm:text-sm">
              <span>Made with</span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-current" />
              <span>in Vietnam</span>
            </div>

            <div className="flex justify-center md:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
