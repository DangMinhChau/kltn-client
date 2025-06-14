"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { collectionApi } from "@/lib/api";
import { Collection } from "@/types";
import { ArrowRight, Sparkles, Star, Eye } from "lucide-react";

const CollectionsSection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await collectionApi.getCollections();
        console.log("📦 Collections response:", response);

        // Handle different response structures
        const data = Array.isArray(response)
          ? response
          : (response as any)?.data || [];
        console.log("📦 Collections data array:", data);

        // Filter active collections
        const activeCollections = data
          .filter((col: any) => col.isActive)
          .slice(0, 6);
        setCollections(activeCollections);
      } catch (err) {
        setError("Không thể tải bộ sưu tập");
        console.error("❌ Error fetching collections:", err);
        // Use mock data if API fails
        setCollections(mockCollections.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const CollectionSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-6 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
  // Mock collection data with better images
  const mockCollections = [
    {
      id: "1",
      name: "Bộ Sưu Tập Thu Đông 2024",
      slug: "thu-dong-2024",
      description:
        "Khám phá xu hướng thời trang mùa thu đông với những thiết kế hiện đại và sang trọng",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Essential Work Wear",
      slug: "work-wear",
      description:
        "Trang phục công sở lịch lãm cho quý ông thành đạt với chất liệu cao cấp",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "3",
      name: "Casual Weekend",
      slug: "casual-weekend",
      description:
        "Phong cách thoải mái cho những ngày cuối tuần năng động và tự do",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "4",
      name: "Summer Vibes",
      slug: "summer-vibes",
      description: "Bộ sưu tập mùa hè tươi mát với chất liệu thoáng khí",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "5",
      name: "Premium Collection",
      slug: "premium-collection",
      description:
        "Dòng sản phẩm cao cấp với thiết kế tinh tế và chất lượng vượt trội",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: "6",
      name: "Sport Active",
      slug: "sport-active",
      description: "Trang phục thể thao năng động cho lối sống khỏe mạnh",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  // Collection image mapping
  const getCollectionImage = (collectionName: string) => {
    const imageMap: { [key: string]: string } = {
      "thu đông":
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&h=400&fit=crop&q=80",
      work: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop&q=80",
      casual:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop&q=80",
      summer:
        "https://images.unsplash.com/photo-1555529902-5ab7b3d1d84d?w=600&h=400&fit=crop&q=80",
      premium:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&q=80",
      sport:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
    };

    const lowerName = collectionName.toLowerCase();
    for (const [key, image] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        return image;
      }
    }
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&q=80";
  };

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const displayCollections =
    collections.length > 0 ? collections : mockCollections;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Bộ sưu tập
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Bộ sưu tập mới nhất
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Khám phá những bộ sưu tập độc quyền với phong cách hiện đại và chất
            lượng cao cấp
          </p>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {Array.from({ length: 6 }).map((_, index) => (
              <CollectionSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              {displayCollections.slice(0, 6).map((collection) => (
                <Card
                  key={collection.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden border-0 bg-white/80 backdrop-blur-sm"
                >
                  <Link href={`/collections/${collection.slug}`}>
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {" "}
                        <Image
                          src={getCollectionImage(collection.name)}
                          alt={collection.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {collection.name.toLowerCase().includes("2024") && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Mới
                            </Badge>
                          )}
                          {collection.name.toLowerCase().includes("sale") && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">
                              Sale
                            </Badge>
                          )}
                        </div>{" "}
                        {/* View count */}
                        <div className="absolute top-3 right-3">
                          <div className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {Math.floor(Math.random() * 50) + 10}
                          </div>
                        </div>
                        {/* Quick action */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem bộ sưu tập
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {collection.name}
                          </h3>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                          {collection.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {Math.floor(Math.random() * 50) + 10} sản phẩm
                            </span>
                            {collection.name.toLowerCase().includes("2024") && (
                              <span className="text-green-600 font-medium">
                                Mới nhất
                              </span>
                            )}
                          </div>

                          {collection.name.toLowerCase().includes("sale") && (
                            <span className="text-red-600 font-semibold">
                              Giảm giá
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button asChild size="lg" className="group">
                <Link href="/collections">
                  Xem tất cả bộ sưu tập
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* Featured Collection Banner */}
        {displayCollections.length > 0 && (
          <div className="mt-12 sm:mt-16 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="relative z-10 p-6 sm:p-8 lg:p-12 text-white">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    Bộ sưu tập đặc biệt
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                    Khám phá phong cách{" "}
                    <span className="text-yellow-300">độc đáo</span> của bạn
                  </h3>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg">
                    Từ công sở đến cuối tuần, chúng tôi có đầy đủ các bộ sưu tập
                    phù hợp với mọi phong cách và dịp đặc biệt của bạn.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold group"
                    >
                      <Link href="/collections">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Khám phá ngay
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Link href="/products">Xem sản phẩm</Link>
                    </Button>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="grid grid-cols-2 gap-4">
                      {displayCollections
                        .slice(0, 4)
                        .map((collection, index) => (
                          <div
                            key={collection.id}
                            className={`relative rounded-lg overflow-hidden ${
                              index === 0
                                ? "col-span-2 aspect-[2/1]"
                                : "aspect-square"
                            }`}
                          >
                            {" "}
                            <Image
                              src={getCollectionImage(collection.name)}
                              alt={collection.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-medium truncate">
                                {collection.name}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsSection;
