"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const profileMenuItems = [
  {
    title: "Hồ sơ cá nhân",
    href: "/profile",
    icon: User,
  },
  {
    title: "Quản lý địa chỉ",
    href: "/profile/addresses",
    icon: MapPin,
  },
  {
    title: "Đơn hàng của tôi",
    href: "/orders",
    icon: Package,
  },
  {
    title: "Đổi mật khẩu",
    href: "/profile/change-password",
    icon: Settings,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700">
              Trang chủ
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Tài khoản của tôi</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden mb-4">
          <Card>
            <CardContent className="p-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Menu tài khoản</span>
                  <span className="transform group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="mt-4 space-y-2">
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Button
                        key={item.href}
                        asChild
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <Link href={item.href} className="flex items-center">
                          <Icon className="mr-3 h-4 w-4" />
                          {item.title}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </details>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Tài khoản của tôi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive &&
                        "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Link href={item.href} className="flex items-center">
                      <Icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
