"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Eye, Calendar, Palette } from "lucide-react";
import { Collection } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  viewMode?: "grid" | "list";
  className?: string;
}

export function CollectionCard({
  collection,
  viewMode = "grid",
  className,
}: CollectionCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const getCollectionImage = () => {
    if (collection.imageUrl) {
      return collection.imageUrl;
    }

    // Fallback images based on season
    const seasonImages = {
      spring: "/images/collections/spring-collection.jpg",
      summer: "/images/collections/summer-collection.jpg",
      fall: "/images/collections/fall-collection.jpg",
      winter: "/images/collections/winter-collection.jpg",
    };

    return (
      seasonImages[
        collection.season?.toLowerCase() as keyof typeof seasonImages
      ] || "/images/collections/default-collection.jpg"
    );
  };

  const getSeasonColor = (season?: string) => {
    const colors = {
      spring: "bg-green-100 text-green-800",
      summer: "bg-yellow-100 text-yellow-800",
      fall: "bg-orange-100 text-orange-800",
      winter: "bg-blue-100 text-blue-800",
    };
    return (
      colors[season?.toLowerCase() as keyof typeof colors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "group hover:shadow-lg transition-all duration-300 overflow-hidden",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative w-full sm:w-48 h-48 sm:h-32 overflow-hidden">
            <Image
              src={getCollectionImage()}
              alt={collection.name}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                isHovered && "scale-110",
                isImageLoading && "opacity-0"
              )}
              onLoad={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {collection.name}
                  </h3>
                  {collection.season && (
                    <Badge
                      className={cn(
                        "text-xs",
                        getSeasonColor(collection.season)
                      )}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {collection.season}
                    </Badge>
                  )}
                </div>

                {collection.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    {collection.products?.length || 0} Products
                  </span>
                  <span className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    {collection.slug}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Link href={`/collections/${collection.slug}`}>
                  <Button size="sm">View Collection</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getCollectionImage()}
          alt={collection.name}
          fill
          className={cn(
            "object-cover transition-all duration-500",
            isHovered && "scale-110",
            isImageLoading && "opacity-0"
          )}
          onLoad={() => setIsImageLoading(false)}
        />
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Season Badge */}
        {collection.season && (
          <Badge
            className={cn(
              "absolute top-3 left-3 text-xs",
              getSeasonColor(collection.season)
            )}
          >
            <Calendar className="h-3 w-3 mr-1" />
            {collection.season}
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <Link href={`/collections/${collection.slug}`} className="block">
            <Button className="w-full bg-white text-black hover:bg-gray-100">
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {collection.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-4 w-4" />
            {collection.products?.length || 0} Products
          </span>
          <span className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            {collection.slug}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
