import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocalCartProvider } from "@/lib/context/LocalCartContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import ScrollToTop from "@/components/common/ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Men's Fashion - Thời trang nam cao cấp",
  description:
    "Cửa hàng thời trang nam hàng đầu Việt Nam. Phong cách hiện đại, chất lượng cao cấp với các bộ sưu tập độc quyền.",
  keywords: "thời trang nam, quần áo nam, áo sơ mi, quần jean, phụ kiện nam",
  authors: [{ name: "Men's Fashion Team" }],
  openGraph: {
    title: "Men's Fashion - Thời trang nam cao cấp",
    description: "Cửa hàng thời trang nam hàng đầu Việt Nam",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <LocalCartProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <ScrollToTop />
            <Toaster />
          </LocalCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
