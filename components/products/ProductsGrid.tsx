import React from "react";
import { Product } from "@/types";
import ProductCard from "@/components/common/ProductCard";
import { ViewMode } from "./ViewModeToggle";

interface ProductsGridProps {
  products: Product[];
  viewMode: ViewMode;
}

export function ProductsGrid({ products, viewMode }: ProductsGridProps) {
  return (
    <div
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          : "grid-cols-1"
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={viewMode === "list" ? "list" : "card"}
        />
      ))}
    </div>
  );
}
