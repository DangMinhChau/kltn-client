import React from "react";
import Link from "next/link";

interface PageBreadcrumbProps {
  categoryFromUrl?: string | null;
}

export function PageBreadcrumb({ categoryFromUrl }: PageBreadcrumbProps) {
  return (
    <nav className="text-sm text-muted-foreground mb-2">
      <Link href="/" className="hover:text-foreground">
        Trang chủ
      </Link>
      <span className="mx-2">/</span>
      <Link href="/products" className="hover:text-foreground">
        Sản phẩm
      </Link>
      {categoryFromUrl && (
        <>
          <span className="mx-2">/</span>
          <span className="text-foreground capitalize">{categoryFromUrl}</span>
        </>
      )}
    </nav>
  );
}
