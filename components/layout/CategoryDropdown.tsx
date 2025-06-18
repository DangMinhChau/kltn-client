"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryDropdownProps {
  categories: Category[];
  isLoading?: boolean;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  isLoading = false,
}) => {
  // Debug logging
  console.log("CategoryDropdown - isLoading:", isLoading);
  console.log("CategoryDropdown - categories:", categories);
  console.log("CategoryDropdown - categories length:", categories?.length);

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Đang tải danh mục...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-sm text-muted-foreground">
              Không có danh mục nào
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Organize categories into columns - group parent categories
  const parentCategories = categories.filter(
    (cat) => !cat.parent && !cat.parentId
  );
  console.log("CategoryDropdown - parentCategories:", parentCategories);

  return (
    <div className="w-full bg-background/98 backdrop-blur-sm border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header with link to all products */}{" "}
        {/* Categories Grid - Desktop optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 lg:gap-8">
          {parentCategories.map((parentCategory) => (
            <div key={parentCategory.id} className="space-y-3 min-h-[200px]">
              {" "}
              {/* Parent Category */}
              <div className="border-b border-border/50 pb-2">
                {/* All parent categories are non-clickable */}
                <div
                  className={cn(
                    "font-bold text-foreground cursor-default transition-all duration-200",
                    "block py-2 lg:py-3 text-sm lg:text-base uppercase tracking-wide text-center",
                    "hover:bg-accent/30 rounded-lg px-2 lg:px-3 -mx-2 lg:-mx-3",
                    "opacity-80 select-none" // Make it look non-clickable
                  )}
                >
                  <span className="inline-block">{parentCategory.name}</span>
                </div>
              </div>{" "}
              {/* Subcategories */}
              {parentCategory.children &&
                parentCategory.children.length > 0 && (
                  <div className="space-y-1 lg:space-y-2">
                    {parentCategory.children
                      .slice(0, 8) // Tăng lên 8 cho desktop để hiển thị nhiều hơn
                      .map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={`/products?category=${subCategory.slug}`}
                          className={cn(
                            "block text-xs lg:text-sm text-muted-foreground hover:text-foreground text-center",
                            "transition-all duration-200 py-1.5 lg:py-2 px-2 lg:px-3 -mx-2 lg:-mx-3 rounded-lg",
                            "hover:bg-accent/60 hover:scale-105 transform group"
                          )}
                        >
                          <span className="group-hover:font-medium transition-all duration-200">
                            {subCategory.name}
                          </span>
                        </Link>
                      ))}

                    {parentCategory.children.length > 8 && (
                      <Link
                        href={`/products?category=${parentCategory.slug}`}
                        className={cn(
                          "block text-xs text-primary hover:text-primary/80 text-center",
                          "transition-colors duration-200 py-1.5 lg:py-2 px-2 lg:px-3 -mx-2 lg:-mx-3 font-medium",
                          "hover:bg-primary/10 rounded-lg"
                        )}
                      >
                        + {parentCategory.children.length - 8} danh mục khác
                      </Link>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
        {/* Footer note */}
        <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-border/50 text-center">
          <p className="text-xs lg:text-sm text-muted-foreground font-medium">
            Khám phá bộ sưu tập thời trang nam đa dạng và chất lượng
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
