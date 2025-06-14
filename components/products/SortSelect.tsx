import React from "react";

export type SortOption = "newest" | "price-asc" | "price-desc" | "name";

interface SortSelectProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function SortSelect({ sortBy, onSortChange }: SortSelectProps) {
  return (
    <select
      value={sortBy}
      onChange={(e) => onSortChange(e.target.value)}
      className="px-3 py-2 border rounded-md text-sm bg-background"
    >
      <option value="newest">Mới nhất</option>
      <option value="price-asc">Giá thấp đến cao</option>
      <option value="price-desc">Giá cao đến thấp</option>
      <option value="name">Tên A-Z</option>
    </select>
  );
}
