"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/common/ProductCard";
import {
  ArrowLeft,
  Calendar,
  ShoppingBag,
  Grid,
  List,
  Filter,
  Share2,
  Heart,
} from "lucide-react";
import { collectionApi } from "@/lib/api";
import { Collection, Product } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "createdAt" | "rating"
  >("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchCollection();
      fetchProducts();
    }
  }, [slug, currentPage, sortBy]);
  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      const response = await collectionApi.getCollection(slug);
      setCollection(response);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await collectionApi.getCollectionProducts(slug, {
        page: currentPage,
        limit: 12,
        sortBy: sortBy,
      });
      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const getCollectionImage = () => {
    if (collection?.imageUrl) {
      return collection.imageUrl;
    }

    const seasonImages = {
      spring: "/images/collections/spring-collection.jpg",
      summer: "/images/collections/summer-collection.jpg",
      fall: "/images/collections/fall-collection.jpg",
      winter: "/images/collections/winter-collection.jpg",
    };

    return (
      seasonImages[
        collection?.season?.toLowerCase() as keyof typeof seasonImages
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 md:h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Collection Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The collection you're looking for doesn't exist.
          </p>
          <Link href="/collections">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/collections"
              className="text-gray-500 hover:text-gray-700"
            >
              Collections
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{collection.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
        <Image
          src={getCollectionImage()}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                {collection.season && (
                  <Badge
                    className={cn("text-sm", getSeasonColor(collection.season))}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {collection.season}
                  </Badge>
                )}{" "}
                <Badge variant="secondary" className="text-sm">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {products?.length || 0} Products
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {collection.name}
              </h1>

              {collection.description && (
                <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-lg">
                  {collection.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Collection
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Wishlist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Products in {collection.name}
                </h2>
                <p className="text-gray-600">
                  Showing {products.length} products
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "name"
                        | "price"
                        | "createdAt"
                        | "rating"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="createdAt">Newest</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>{" "}
        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                This collection doesn't have any products yet.
              </p>
              <Link href="/collections">
                <Button variant="outline">Browse Other Collections</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                : "space-y-4"
            )}
          >
            {" "}
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={viewMode === "grid" ? "card" : "list"}
              />
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
