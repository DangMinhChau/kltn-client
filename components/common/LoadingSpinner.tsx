"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Đang tải..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-12">
      <LoadingSpinner size="lg" className="text-primary mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

interface SectionLoadingProps {
  rows?: number;
  className?: string;
}

export function SectionLoading({ rows = 3, className }: SectionLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="skeleton h-12 w-12 rounded-full bg-muted"></div>
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 bg-muted rounded w-3/4"></div>
            <div className="skeleton h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
