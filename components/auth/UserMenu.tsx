"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Settings, Package, Heart } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  console.log(
    "UserMenu render - isAuthenticated:",
    isAuthenticated,
    "user:",
    user
  );

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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
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
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {!isAuthenticated || !user ? (
          // Menu cho người chưa đăng nhập
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-muted-foreground">
                  Bạn chưa đăng nhập
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/login" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Đăng nhập</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/register" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Đăng ký</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          // Menu cho người đã đăng nhập
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              {" "}
              <Link href="/orders" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                <span>Đơn hàng</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/change-password" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Đổi mật khẩu</span>
              </Link>
            </DropdownMenuItem>
            {user.role?.toUpperCase() === "ADMIN" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin"
                    className="flex items-center text-purple-600"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
