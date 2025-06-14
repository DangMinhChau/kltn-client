"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isPublic: boolean;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  productName: string;
  productId: string;
  productImage?: string;
  orderNumber?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    rating: "",
    isApproved: "",
    isVerifiedPurchase: "",
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC",
    page: 1,
    limit: 20,
  });

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual admin API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockReviews: Review[] = [
        {
          id: "1",
          rating: 5,
          comment:
            "Sản phẩm rất chất lượng, tôi rất hài lòng với chiếc áo này. Chất liệu thoáng mát, form dáng đẹp.",
          isApproved: true,
          isPublic: true,
          customerName: "Nguyễn Văn A",
          customerEmail: "nguyenvana@email.com",
          productName: "Áo Thun Basic Cotton",
          productId: "prod-1",
          orderNumber: "ORD-2024-001",
          isVerifiedPurchase: true,
          helpfulCount: 12,
          createdAt: "2024-06-14T10:30:00Z",
          updatedAt: "2024-06-14T11:00:00Z",
        },
        {
          id: "2",
          rating: 4,
          comment: "Áo đẹp nhưng size hơi nhỏ so với mô tả. Chất lượng OK.",
          isApproved: false,
          isPublic: false,
          customerName: "Trần Thị B",
          customerEmail: "tranthib@email.com",
          productName: "Áo Polo Nam Cao Cấp",
          productId: "prod-2",
          orderNumber: "ORD-2024-002",
          isVerifiedPurchase: true,
          helpfulCount: 3,
          createdAt: "2024-06-14T09:15:00Z",
          updatedAt: "2024-06-14T09:15:00Z",
        },
        {
          id: "3",
          rating: 1,
          comment: "Chất lượng kém, không như mô tả. Tôi không hài lòng.",
          isApproved: false,
          isPublic: false,
          customerName: "Lê Văn C",
          customerEmail: "levanc@email.com",
          productName: "Quần Jeans Slim Fit",
          productId: "prod-3",
          isVerifiedPurchase: false,
          helpfulCount: 0,
          createdAt: "2024-06-13T14:20:00Z",
          updatedAt: "2024-06-14T08:45:00Z",
        },
      ];

      setReviews(mockReviews);
      setPagination({
        page: 1,
        limit: 20,
        total: mockReviews.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleApprove = async (reviewId: string) => {
    try {
      // Mock API call - replace with actual admin API
      toast.success("Review approved successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      toast.error("Failed to approve review");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      // Mock API call - replace with actual admin API
      toast.success("Review rejected successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast.error("Failed to reject review");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  const StatusBadge = ({
    isApproved,
    isPublic,
  }: {
    isApproved: boolean;
    isPublic: boolean;
  }) => {
    if (!isApproved) {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    return isPublic ? (
      <Badge variant="default">Published</Badge>
    ) : (
      <Badge variant="outline">Approved (Private)</Badge>
    );
  };

  const VerifiedBadge = ({ isVerified }: { isVerified: boolean }) =>
    isVerified ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified Purchase
      </Badge>
    ) : (
      <Badge variant="secondary">Unverified</Badge>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            Moderate customer reviews and feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r) => !r.isApproved).length}
            </div>
            <p className="text-xs text-muted-foreground">Requires moderation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0
                ? (
                    reviews.reduce((sum, r) => sum + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Purchases
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter((r) => r.isVerifiedPurchase).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {reviews.length > 0
                ? Math.round(
                    (reviews.filter((r) => r.isVerifiedPurchase).length /
                      reviews.length) *
                      100
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.rating}
              onValueChange={(value) => handleFilterChange("rating", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isApproved}
              onValueChange={(value) => handleFilterChange("isApproved", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All status</SelectItem>
                <SelectItem value="true">Approved</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isVerifiedPurchase}
              onValueChange={(value) =>
                handleFilterChange("isVerifiedPurchase", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All purchases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All purchases</SelectItem>
                <SelectItem value="true">Verified only</SelectItem>
                <SelectItem value="false">Unverified only</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as "ASC" | "DESC",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-DESC">Newest first</SelectItem>
                <SelectItem value="createdAt-ASC">Oldest first</SelectItem>
                <SelectItem value="rating-DESC">Highest rating</SelectItem>
                <SelectItem value="rating-ASC">Lowest rating</SelectItem>
                <SelectItem value="helpfulCount-DESC">Most helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Helpful</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.customerAvatar} />
                          <AvatarFallback>
                            {review.customerName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {review.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {review.customerEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.productName}</div>
                        {review.orderNumber && (
                          <div className="text-sm text-muted-foreground">
                            Order: {review.orderNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={review.comment}>
                        {review.comment}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        isApproved={review.isApproved}
                        isPublic={review.isPublic}
                      />
                    </TableCell>
                    <TableCell>
                      <VerifiedBadge isVerified={review.isVerifiedPurchase} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span>{review.helpfulCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/reviews/${review.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {!review.isApproved && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(review.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(review.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
