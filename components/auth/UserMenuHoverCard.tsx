"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Settings, Package, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export const UserMenuHoverCard = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Hiển thị avatar cho cả trường hợp đã đăng nhập và chưa đăng nhập
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {isAuthenticated && user ? (
                getInitials(user.fullName)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="end">
        <div className="space-y-3">
          {!isAuthenticated || !user ? (
            // Content cho người chưa đăng nhập
            <>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Chào mừng bạn!</h4>
                <p className="text-sm text-muted-foreground">
                  Đăng nhập để trải nghiệm đầy đủ tính năng
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm">
                  <Link href="/auth/login" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/register" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Đăng ký
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            // Content cho người đã đăng nhập
            <>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{user.fullName}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                  >
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                  >
                    <Link href="/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Đơn hàng{" "}
                    </Link>
                  </Button>{" "}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                  >
                    <Link
                      href="/profile/addresses"
                      className="flex items-center"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Địa chỉ
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                  >
                    <Link href="/change-password" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </Link>
                  </Button>
                </div>

                {user.role?.toUpperCase() === "ADMIN" && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mb-2 text-purple-600"
                  >
                    <Link href="/admin" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Quản trị hệ thống
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserMenuHoverCard;
