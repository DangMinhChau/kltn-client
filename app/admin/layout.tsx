"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import AdminGuard from "@/components/auth/AdminGuard";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Package,
  Users,
  ShoppingCart,
  Star,
  Tag,
  Settings,
  BarChart3,
  Menu,
  Package2,
  Home,
  Palette,
  Ruler,
  Archive,
  Layers,
  Shirt,
  LogOut,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage products and inventory",
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Add Product", href: "/admin/products/new" },
      { name: "Variants", href: "/admin/products/variants" },
      { name: "Categories", href: "/admin/products/categories" },
      { name: "Collections", href: "/admin/products/collections" },
    ],
  },
  {
    name: "Attributes",
    href: "/admin/attributes",
    icon: Settings,
    description: "Product attributes",
    children: [
      { name: "Colors", href: "/admin/attributes/colors" },
      { name: "Sizes", href: "/admin/attributes/sizes" },
      { name: "Materials", href: "/admin/attributes/materials" },
      { name: "Styles", href: "/admin/attributes/styles" },
      { name: "Tags", href: "/admin/attributes/tags" },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Order management",
    children: [
      { name: "All Orders", href: "/admin/orders" },
      { name: "Payments", href: "/admin/orders/payments" },
      { name: "Shipping", href: "/admin/orders/shipping" },
    ],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Customer management",
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    description: "Review moderation",
  },
  {
    name: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
    description: "Vouchers and discounts",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Sales and performance",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span>Fashion Admin</span>
        </Link>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
      {/* Navigation */}
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navigation.map((item) => {
            const isItemActive = isActive(item.href);
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isItemActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.name === "Orders" && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      6
                    </Badge>
                  )}
                </Link>

                {/* Sub-navigation */}
                {item.children && isItemActive && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-all hover:text-primary",
                          pathname === child.href
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>{" "}
      {/* User menu */}
      <div className="mt-auto p-4 space-y-3">
        {user && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{user.fullName}</div>
            <div className="text-xs">{user.email}</div>
            <div className="text-xs">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Admin
              </span>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
  return (
    <AdminGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Mobile Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </header>

          {/* Main Content Area */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
