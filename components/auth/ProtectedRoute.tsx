"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LoadingSpinner } from "@/components/common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "CUSTOMER" | "ADMIN";
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }
    if (
      user &&
      requiredRole &&
      user.role?.toUpperCase() !== requiredRole.toUpperCase()
    ) {
      router.push("/"); // Redirect to home if role doesn't match
      return;
    }
  }, [user, isLoading, requireAuth, requiredRole, redirectTo, router]);
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <LoadingSpinner />;
  }
  if (
    user &&
    requiredRole &&
    user.role?.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
