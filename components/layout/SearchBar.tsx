"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  onSubmit,
  className,
  id,
  placeholder = "Tìm kiếm sản phẩm...",
}: SearchBarProps) => {
  return (
    <form onSubmit={onSubmit} className={`relative ${className || ""}`}>
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-10 h-9 md:h-10"
        aria-label={placeholder}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full px-3"
        aria-label="Tìm kiếm"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};
