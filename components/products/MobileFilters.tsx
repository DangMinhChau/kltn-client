import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import ProductFilters from "@/components/common/ProductFilters";
import { ProductFilters as ProductFiltersType } from "@/types";

interface MobileFiltersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  categoryFromUrl?: string;
}

export function MobileFilters({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  categoryFromUrl,
}: MobileFiltersProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-6">
          {" "}
          <ProductFilters
            filters={filters}
            onFiltersChange={(newFilters: ProductFiltersType) => {
              onFiltersChange(newFilters);
              onOpenChange(false);
            }}
            categoryFromUrl={categoryFromUrl}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
