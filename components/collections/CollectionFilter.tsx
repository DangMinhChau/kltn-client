"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Collection } from "@/types";
import { X, RotateCcw } from "lucide-react";

interface FilterState {
  seasons: string[];
  productCountRange: [number, number];
  hasImage: boolean | null;
}

interface CollectionFilterProps {
  collections: Collection[];
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export function CollectionFilter({
  collections,
  onFilterChange,
  className,
}: CollectionFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    seasons: [],
    productCountRange: [0, 100],
    hasImage: null,
  });

  // Get unique seasons from collections
  const uniqueSeasons = Array.from(
    new Set(collections.map((c) => c.season).filter(Boolean))
  );

  // Get product count range
  const productCounts = collections.map((c) => c.products?.length || 0);
  const maxProductCount = Math.max(...productCounts, 1);

  const handleSeasonToggle = (season: string) => {
    const newSeasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];

    const newFilters = { ...filters, seasons: newSeasons };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleProductCountChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      productCountRange: [value[0], value[1]] as [number, number],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleImageFilterChange = (hasImage: boolean | null) => {
    const newFilters = { ...filters, hasImage };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      seasons: [],
      productCountRange: [0, maxProductCount] as [number, number],
      hasImage: null,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.seasons.length > 0 ||
    filters.productCountRange[0] > 0 ||
    filters.productCountRange[1] < maxProductCount ||
    filters.hasImage !== null;

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Seasons Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Season</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uniqueSeasons.map((season) => (
              <div key={season} className="flex items-center space-x-2">
                <Checkbox
                  id={`season-${season}`}
                  checked={filters.seasons.includes(season)}
                  onCheckedChange={() => handleSeasonToggle(season)}
                />
                <Label
                  htmlFor={`season-${season}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {season}
                </Label>
                <Badge variant="secondary" className="text-xs">
                  {collections.filter((c) => c.season === season).length}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Product Count Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Product Count</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-2">
              <Slider
                value={filters.productCountRange}
                onValueChange={handleProductCountChange}
                max={maxProductCount}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{filters.productCountRange[0]} products</span>
              <span>{filters.productCountRange[1]} products</span>
            </div>
          </CardContent>
        </Card>

        {/* Image Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-image"
                checked={filters.hasImage === true}
                onCheckedChange={(checked) =>
                  handleImageFilterChange(checked ? true : null)
                }
              />
              <Label
                htmlFor="has-image"
                className="text-sm font-normal cursor-pointer"
              >
                Has custom image
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-image"
                checked={filters.hasImage === false}
                onCheckedChange={(checked) =>
                  handleImageFilterChange(checked ? false : null)
                }
              />
              <Label
                htmlFor="no-image"
                className="text-sm font-normal cursor-pointer"
              >
                Default image only
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Filter Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full"
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>

            {hasActiveFilters && (
              <div className="text-xs text-gray-500">
                {filters.seasons.length > 0 && (
                  <div>Seasons: {filters.seasons.join(", ")}</div>
                )}
                {(filters.productCountRange[0] > 0 ||
                  filters.productCountRange[1] < maxProductCount) && (
                  <div>
                    Products: {filters.productCountRange[0]}-
                    {filters.productCountRange[1]}
                  </div>
                )}
                {filters.hasImage !== null && (
                  <div>
                    Image: {filters.hasImage ? "Custom only" : "Default only"}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
