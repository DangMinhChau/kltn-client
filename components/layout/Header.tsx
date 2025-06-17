"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CartIcon } from "@/components/cart/CartIcon";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserMenuHoverCard } from "@/components/auth/UserMenuHoverCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { useCategories } from "@/hooks/useCategories";
import CategoryDropdown from "@/components/layout/CategoryDropdown";

// Add custom CSS for dropdown animation
const dropdownStyles = `
  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-15px);
      visibility: hidden;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }
  }
  
  .animate-dropdown-enter {
    animation: dropdown-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .dropdown-shadow {
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1), 
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }
`;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { categoryTree, isLoading } = useCategories();

  // Debug logging for categories
  useEffect(() => {
    console.log("Header - categoryTree:", categoryTree);
    console.log("Header - isLoading:", isLoading);
  }, [categoryTree, isLoading]);

  // Check if mobile and measure header height
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    const measureHeader = () => {
      const header = document.querySelector("header");
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    checkMobile();
    measureHeader();

    window.addEventListener("resize", () => {
      checkMobile();
      measureHeader();
    });

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const handleMouseEnter = () => {
    if (isMobile) return;

    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;

    const timer = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // Tăng delay lên 300ms để UX tốt hơn
    setDropdownTimer(timer);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (dropdownTimer) {
        clearTimeout(dropdownTimer);
      }
    };
  }, [dropdownTimer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Desktop Navigation Links
  const DesktopNav = () => (
    <nav className="hidden lg:flex items-center space-x-1">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors mr-4"
        aria-label="Men's Fashion - Trang chủ"
      >
        <div className="h-9 w-auto relative">
          <Image
            src="/logo.svg"
            alt="Men's Fashion Logo"
            width={150}
            height={45}
            priority
            className="w-auto h-full"
          />
        </div>
      </Link>
      {/* Navigation Links */}
      <Link
        href="/collections"
        className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
      >
        Bộ sưu tập
      </Link>{" "}
      {/* Products with Dropdown */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
        >
          Sản phẩm
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              isDropdownOpen && "rotate-180"
            )}
          />
        </Link>{" "}
        {/* Dropdown Menu - Fixed positioning */}
        {isDropdownOpen && !isMobile && (
          <div
            className="fixed left-0 w-full bg-background/98 backdrop-blur-md border-t border-border z-[200] opacity-0 translate-y-[-15px] animate-dropdown-enter dropdown-shadow"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              top: `${headerHeight}px`,
            }}
          >
            <CategoryDropdown categories={categoryTree} isLoading={isLoading} />
          </div>
        )}
      </div>{" "}
      <Link
        href="/products/sale"
        className="relative px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-accent rounded-md transition-colors group"
      >
        <span className="relative z-10">Sale</span>
        {/* Animated fire effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Hot badge */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </Link>
      <Link
        href="/orders"
        className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
      >
        Đơn hàng
      </Link>
    </nav>
  );

  // Mobile Navigation
  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          aria-label="Mở menu"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Men's Fashion Logo"
                width={120}
                height={36}
                priority
                className="w-auto h-8"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-4">
              {/* Bộ sưu tập */}
              <Link
                href="/collections"
                className="block py-3 px-4 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Bộ sưu tập
              </Link>
              {/* Sản phẩm với dropdown - Mobile */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block py-3 px-4 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sản phẩm
                </Link>

                {/* Categories in mobile */}
                <div className="pl-4 space-y-1">
                  {!isLoading &&
                    categoryTree
                      .filter((cat) => !cat.parent && !cat.parentId)
                      .slice(0, 8)
                      .map((parentCategory) => (
                        <div key={parentCategory.id} className="space-y-1">
                          <Link
                            href={`/products?category=${parentCategory.slug}`}
                            className="block py-2 px-3 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {parentCategory.name}
                          </Link>
                          {parentCategory.children &&
                            parentCategory.children.length > 0 && (
                              <div className="pl-3 space-y-1">
                                {parentCategory.children
                                  .slice(0, 3)
                                  .map((subCategory) => (
                                    <Link
                                      key={subCategory.id}
                                      href={`/products?category=${subCategory.slug}`}
                                      className="block py-1.5 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {subCategory.name}
                                    </Link>
                                  ))}
                              </div>
                            )}
                        </div>
                      ))}
                </div>
              </div>{" "}
              {/* Sale */}
              <Link
                href="/products/sale"
                className="block py-3 px-4 text-base font-medium text-red-600 hover:bg-accent hover:text-red-700 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sale
              </Link>{" "}
              {/* Đơn hàng */}
              <Link
                href="/orders"
                className="block py-3 px-4 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đơn hàng
              </Link>
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              © 2024 Men's Fashion. All rights reserved.
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  return (
    <>
      <style jsx>{dropdownStyles}</style>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
          isScrolled && "shadow-sm"
        )}
        style={{ isolation: "isolate" }}
      >
        {/* Main header */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Logo - Only visible on mobile devices */}
            <div className="lg:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link
                href="/"
                className="block"
                aria-label="Men's Fashion - Trang chủ"
              >
                <Image
                  src="/logo.svg"
                  alt="Men's Fashion Logo"
                  width={150}
                  height={45}
                  priority
                  className="w-auto h-6 sm:h-8"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <DesktopNav />

            {/* Mobile Navigation Menu */}
            <MobileNav />

            {/* Search Bar - Responsive */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:max-w-lg xl:max-w-xl">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearch}
                className="w-full"
              />
            </div>

            {/* Actions - Responsive spacing */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Mobile search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                aria-label="Mở tìm kiếm"
                onClick={() => {
                  setTimeout(() => {
                    const mobileSearchInput =
                      document.getElementById("mobile-search");
                    if (mobileSearchInput) mobileSearchInput.focus();
                  }, 100);
                }}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>{" "}
              {/* User account */}
              <UserMenuHoverCard />
              {/* Shopping cart */}
              <CartIcon
                variant="ghost"
                size="default"
                className="h-9 w-9 lg:h-10 lg:w-10"
              />
            </div>
          </div>

          {/* Mobile search bar - Responsive */}
          <div className="md:hidden pb-3 sm:pb-4">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmit={handleSearch}
              id="mobile-search"
            />
          </div>
        </div>{" "}
        <CartSheet />
      </header>
    </>
  );
};

export default Header;
