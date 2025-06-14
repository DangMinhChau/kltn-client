import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Đã có lỗi xảy ra</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={onRetry}>Thử lại</Button>
      </div>
    </div>
  );
}
