"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

export const SimpleUserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();

  console.log("SimpleUserMenu render:", {
    isAuthenticated,
    user: user?.fullName,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2 bg-red-100 p-2 rounded">
        <span className="text-red-600 text-sm">NOT LOGGED IN</span>
        <Link href="/auth/login">
          <Button variant="outline" size="sm">
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-green-100 p-2 rounded">
      <span className="text-green-600 text-sm">LOGGED IN: {user.fullName}</span>
      <Button onClick={logout} size="sm" variant="destructive">
        Đăng xuất
      </Button>
    </div>
  );
};
