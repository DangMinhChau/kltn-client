import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function EmptyState({ searchQuery, onClearSearch }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery
          ? `Không có sản phẩm nào khớp với "${searchQuery}"`
          : "Chưa có sản phẩm nào được thêm vào."}
      </p>
      {searchQuery && onClearSearch && (
        <Button onClick={onClearSearch}>Xóa bộ lọc</Button>
      )}
    </div>
  );
}
