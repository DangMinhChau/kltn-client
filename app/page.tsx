import { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CollectionsSection from "@/components/sections/CollectionsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import BrandShowcase from "@/components/sections/BrandShowcase";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

export const metadata: Metadata = {
  title: "Trang chủ - Men's Fashion",
  description:
    "Khám phá bộ sưu tập thời trang nam cao cấp mới nhất. Áo sơ mi, quần jean, phụ kiện và nhiều sản phẩm thời trang nam chất lượng cao.",
  openGraph: {
    title: "Trang chủ - Men's Fashion",
    description: "Khám phá bộ sưu tập thời trang nam cao cấp mới nhất",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Features Section */}
      <FeaturesSection />

      {/* Collections Section */}
      <CollectionsSection />

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}
