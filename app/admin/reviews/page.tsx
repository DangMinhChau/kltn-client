"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  MessageSquare,
  Check,
  X,
  Flag,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Award,
  Users,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReviews } from "@/lib/hooks/useAdminData";
import {
  useApproveReview,
  useRejectReview,
  useBulkReviewAction,
  useRespondToReview,
} from "@/lib/hooks/useAdminMutations";
import {
  DataTable,
  Column,
  ActionItem,
  BulkAction,
} from "@/components/admin/DataTable";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
    images?: Array<{ imageUrl: string }>;
  };
  response?: string;
  createdAt: string;
  updatedAt: string;
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  isVerifiedPurchase?: boolean;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [response, setResponse] = useState("");

  // Data fetching
  const {
    data: reviews = [],
    total,
    page,
    pageSize,
    loading,
    search,
    filters,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setSorting,
    refresh,
  } = useReviews();

  // Mutations
  const approveReview = useApproveReview();
  const rejectReview = useRejectReview();
  const bulkAction = useBulkReviewAction();
  const respondToReview = useRespondToReview();

  // Table columns configuration
  const columns: Column<Review>[] = [
    {
      id: "product",
      header: "Product",
      sortable: true,
      filterable: true,
      cell: (review) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            {review.product.images?.[0] ? (
              <img
                src={review.product.images[0].imageUrl}
                alt={review.product.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <MessageSquare className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm">{review.product.name}</div>
            <div className="text-xs text-muted-foreground">
              ID: {review.product.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      sortable: true,
      filterable: true,
      cell: (review) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.user.avatar} alt={review.user.name} />
            <AvatarFallback>
              {review.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{review.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {review.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "5 Stars", value: "5" },
        { label: "4 Stars", value: "4" },
        { label: "3 Stars", value: "3" },
        { label: "2 Stars", value: "2" },
        { label: "1 Star", value: "1" },
      ],
      cell: (review) => (
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
        </div>
      ),
    },
    {
      id: "comment",
      header: "Review",
      cell: (review) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={review.comment}>
            {review.comment}
          </p>
          {review.isVerifiedPurchase && (
            <Badge variant="outline" className="mt-1">
              <Check className="h-3 w-3 mr-1" />
              Verified Purchase
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      cell: (review) => (
        <Badge
          variant={
            review.status === "approved"
              ? "default"
              : review.status === "pending"
              ? "secondary"
              : "destructive"
          }
        >
          {review.status}
        </Badge>
      ),
    },
    {
      id: "helpfulness",
      header: "Helpfulness",
      cell: (review) => (
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-3 w-3 text-green-600" />
            <span>{review.helpfulVotes || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsDown className="h-3 w-3 text-red-600" />
            <span>{review.unhelpfulVotes || 0}</span>
          </div>
        </div>
      ),
    },
    {
      id: "response",
      header: "Response",
      cell: (review) => (
        <div className="text-center">
          {review.response ? (
            <Badge variant="outline">
              <MessageSquare className="h-3 w-3 mr-1" />
              Replied
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">No response</span>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (review) => (
        <div className="text-sm text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<Review>[] = [
    {
      label: "View Details",
      onClick: (review) => setSelectedReview(review),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Respond",
      onClick: (review) => {
        setSelectedReview(review);
        setResponse(review.response || "");
        setResponseDialog(true);
      },
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Approve",
      onClick: async (review) => {
        await approveReview.mutateAsync(review.id);
        refresh();
      },
      icon: <Check className="h-4 w-4" />,
      disabled: (review) => review.status === "approved",
    },
    {
      label: "Reject",
      onClick: async (review) => {
        await rejectReview.mutateAsync({ id: review.id });
        refresh();
      },
      icon: <X className="h-4 w-4" />,
      variant: "destructive",
      disabled: (review) => review.status === "rejected",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Review>[] = [
    {
      label: "Approve",
      onClick: async (reviews) => {
        await bulkAction.mutateAsync({
          action: "approve",
          reviewIds: reviews.map((r) => r.id),
        });
        refresh();
      },
      icon: <Check className="h-4 w-4" />,
    },
    {
      label: "Reject",
      onClick: async (reviews) => {
        await bulkAction.mutateAsync({
          action: "reject",
          reviewIds: reviews.map((r) => r.id),
        });
        refresh();
      },
      icon: <X className="h-4 w-4" />,
      variant: "destructive",
    },
  ];

  const handleRespond = async () => {
    if (!selectedReview || !response.trim()) return;

    try {
      await respondToReview.mutateAsync({
        reviewId: selectedReview.id,
        response: response.trim(),
      });
      setResponseDialog(false);
      setSelectedReview(null);
      setResponse("");
      refresh();
      toast.success("Response added successfully");
    } catch (error) {
      toast.error("Failed to add response");
    }
  };

  // Calculate stats from current data
  const stats = {
    total: total,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    averageRating:
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reviews Management
          </h1>
          <p className="text-muted-foreground">
            Moderate and manage customer product reviews
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">Published reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Rejected reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
          <CardDescription>
            Manage customer reviews, responses, and moderation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reviews}
            columns={columns}
            total={total}
            page={page}
            pageSize={pageSize}
            loading={loading}
            search={search}
            filters={filters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
            onFiltersChange={setFilters}
            onSortChange={setSorting}
            onRefresh={refresh}
            actions={actions}
            bulkActions={bulkActions}
            selectable={true}
            getRowId={(review) => review.id}
            searchPlaceholder="Search reviews, products, or customers..."
          />
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog
        open={!!selectedReview && !responseDialog}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                  {selectedReview.product.images?.[0] ? (
                    <img
                      src={selectedReview.product.images[0].imageUrl}
                      alt={selectedReview.product.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {selectedReview.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    by {selectedReview.user.name} ({selectedReview.user.email})
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    selectedReview.status === "approved"
                      ? "default"
                      : selectedReview.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedReview.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Review Comment</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedReview.comment}</p>
                </div>
              </div>

              {selectedReview.response && (
                <div className="space-y-2">
                  <Label>Admin Response</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm">{selectedReview.response}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Helpful Votes</Label>
                  <p className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span>{selectedReview.helpfulVotes || 0}</span>
                  </p>
                </div>
                <div>
                  <Label>Unhelpful Votes</Label>
                  <p className="flex items-center space-x-1">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span>{selectedReview.unhelpfulVotes || 0}</span>
                  </p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Updated</Label>
                  <p>{new Date(selectedReview.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setResponse(selectedReview?.response || "");
                setResponseDialog(true);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Response</DialogTitle>
            <DialogDescription>
              Respond to this review as an admin. This response will be visible
              to all customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Response</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!response.trim() || respondToReview.loading}
            >
              {respondToReview.loading ? "Adding..." : "Add Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
