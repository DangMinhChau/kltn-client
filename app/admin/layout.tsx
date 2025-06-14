"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Package2,
  FileText,
  Gift,
  MessageSquare,
  Truck,
  Palette,
  Bell,
  Activity,
  Monitor,
  Warehouse,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Variants",
    href: "/admin/variants",
    icon: Package2,
  },
  {
    title: "Attributes",
    href: "/admin/attributes",
    icon: Palette,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Vouchers",
    href: "/admin/vouchers",
    icon: Gift,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Shipping",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Webhooks",
    href: "/admin/webhooks",
    icon: Activity,
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Monitor,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log("Admin Layout: Checking admin access...");
      console.log("Admin Layout: isAuthenticated:", isAuthenticated);
      console.log("Admin Layout: user:", user);
      console.log("Admin Layout: user role:", user?.role);

      if (!isAuthenticated || !user) {
        console.log("Admin Layout: Not authenticated, redirecting to login");
        router.push("/auth/login");
        return;
      }
      if (user.role?.toUpperCase() !== "ADMIN") {
        console.log("Admin Layout: User is not admin, redirecting to home");
        router.push("/");
        return;
      }

      console.log("Admin Layout: User is admin, access granted");
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };
  console.log(
    "Admin Layout: Rendering, isLoading:",
    isLoading,
    "user:",
    !!user
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user || user.role?.toUpperCase() !== "ADMIN") {
    console.log("Admin Layout: Access denied, returning null");
    return null;
  }

  console.log("Admin Layout: Rendering admin layout with user:", user.fullName);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <Package2 className="h-8 w-8 text-primary" />
          <span className="ml-2 text-lg font-semibold">Admin Dashboard</span>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors",
                  "text-gray-700 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {user?.fullName
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center h-16 px-6 border-b">
                <Package2 className="h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-semibold">Admin</span>
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Admin Dashboard</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
