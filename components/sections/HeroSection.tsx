"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const heroSlides = [
    {
      id: 1,
      title: "Bộ Sưu Tập Thu Đông 2024",
      subtitle: "Phong cách nam tính, hiện đại",
      description:
        "Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và thiết kế độc quyền dành riêng cho phái mạnh.",
      image:
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&h=800&fit=crop&q=80",
      buttonText: "Khám phá ngay",
      buttonLink: "/collections",
      badge: "Mới ra mắt",
      badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-600",
    },
    {
      id: 2,
      title: "Sale Cuối Năm",
      subtitle: "Giảm giá đến 50%",
      description:
        "Ưu đãi lớn nhất trong năm! Cơ hội vàng để sở hữu những item thời trang cao cấp với giá ưu đãi.",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80",
      buttonText: "Mua ngay",
      buttonLink: "/products",
      badge: "Sale 50%",
      badgeColor: "bg-gradient-to-r from-red-500 to-pink-600",
    },
    {
      id: 3,
      title: "Premium Quality",
      subtitle: "Chất lượng cao cấp",
      description:
        "Từng sản phẩm được tuyển chọn kỹ lưỡng với chất liệu cao cấp và thiết kế tinh tế, mang đến phong cách hoàn hảo.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&q=80",
      buttonText: "Xem collection",
      buttonLink: "/products",
      badge: "Premium",
      badgeColor: "bg-gradient-to-r from-amber-500 to-orange-600",
    },
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentSlide];
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPC9zdmc+')] opacity-30"></div>

      <div className="relative container mx-auto px-4 lg:px-8 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen py-12 lg:py-20">
          {/* Content */}
          <div className="space-y-6 sm:space-y-8 text-white lg:pr-8 order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2">
              <Badge
                className={`${currentHero.badgeColor} text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {currentHero.badge}
              </Badge>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {currentHero.title}
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-slate-300 font-medium">
                {currentHero.subtitle}
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-xl">
              {currentHero.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 py-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  1000+
                </div>
                <div className="text-sm text-slate-400">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  50K+
                </div>
                <div className="text-sm text-slate-400">Khách hàng</div>
              </div>{" "}
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  99%
                </div>
                <div className="text-sm text-slate-400">Hài lòng</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 py-3 rounded-lg group"
              >
                <Link href={currentHero.buttonLink}>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {currentHero.buttonText}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/20 text-white hover:bg-white/10 font-semibold text-base px-8 py-3 rounded-lg"
              >
                <Link href="/products">Xem tất cả</Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            {/* Main Image */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-transparent">
              <Image
                src={currentHero.image}
                alt={currentHero.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Bestseller</p>
                    <p className="text-sm text-slate-600">
                      Áo polo nam cao cấp
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">599K</p>
                    <p className="text-sm text-slate-500 line-through">799K</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl" />
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 pb-8">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-primary scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}{" "}
        </div>
      </div>
    </section>
  );
}
