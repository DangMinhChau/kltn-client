"use client";

import { useState } from "react";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List, Package, Sparkles } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i + 5
);

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [page, setPage] = useState(1);

  const { collections, pagination, loading, error, refetch } = useCollections({
    search: searchQuery || undefined,
    season: selectedSeason || undefined,
    year: selectedYear ? parseInt(selectedYear) : undefined,
    isActive: true, // Only show active collections on public page
    page,
    limit: 12,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setPage(1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSeason("");
    setSelectedYear("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Collections
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections of premium fashion pieces, crafted
            for the modern gentleman
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Find Your Perfect Collection
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                {/* Season Filter */}
                <Select
                  value={selectedSeason}
                  onValueChange={handleSeasonChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Seasons</SelectItem>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {loading ? "Loading..." : `${pagination.total} Collections`}
            </h2>
            {(searchQuery || selectedSeason || selectedYear) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Filtered by:
                </span>
                {searchQuery && (
                  <Badge variant="secondary">Search: "{searchQuery}"</Badge>
                )}
                {selectedSeason && (
                  <Badge variant="secondary">Season: {selectedSeason}</Badge>
                )}
                {selectedYear && (
                  <Badge variant="secondary">Year: {selectedYear}</Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Error Loading Collections
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && collections.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Collections Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedSeason || selectedYear
                ? "Try adjusting your search criteria"
                : "No collections are currently available"}
            </p>
            {(searchQuery || selectedSeason || selectedYear) && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        )}

        {/* Collections Grid */}
        {!loading && !error && collections.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <CollectionGrid collections={collections} />
            ) : (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(pagination.totalPages - 4, page - 2)
                        ) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
