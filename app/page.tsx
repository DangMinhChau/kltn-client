import { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { SaleProductsSection } from "@/components/sections/SaleProductsSection";
import CollectionsSection from "@/components/sections/CollectionsSection";

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

      {/* Sale Products Section */}
      <SaleProductsSection className="bg-gradient-to-b from-red-50/30 to-orange-50/30" />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Collections Section */}
      <CollectionsSection />
    </main>
  );
}
