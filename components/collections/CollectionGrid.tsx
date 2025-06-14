"use client";

import { Collection } from "@/types";
import { CollectionCard } from "./CollectionCard";
import { cn } from "@/lib/utils";

interface CollectionGridProps {
  collections: Collection[];
  viewMode?: "grid" | "list";
  className?: string;
}

export function CollectionGrid({
  collections,
  viewMode = "grid",
  className,
}: CollectionGridProps) {
  if (viewMode === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        // Responsive grid columns
        "grid-cols-1", // Mobile: 1 column
        "sm:grid-cols-2", // Small tablets: 2 columns
        "lg:grid-cols-3", // Large tablets/small desktop: 3 columns
        "xl:grid-cols-4", // Desktop: 4 columns
        "2xl:grid-cols-5", // Large desktop: 5 columns
        className
      )}
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          viewMode="grid"
        />
      ))}
    </div>
  );
}
