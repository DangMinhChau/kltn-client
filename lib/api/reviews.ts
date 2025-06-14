import { api } from "../api";

// Review interfaces
export interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ModerateReviewRequest {
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedReviews {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingTrends: {
    period: string;
    averageRating: number;
    totalReviews: number;
  }[];
  topRatedProducts: {
    productId: string;
    productName: string;
    averageRating: number;
    totalReviews: number;
  }[];
  reviewDistribution: {
    verified: number;
    unverified: number;
    active: number;
    inactive: number;
  };
}

export interface ModerationSummary {
  pendingReviews: number;
  flaggedReviews: number;
  recentReviews: number;
}

export interface ProductReviewSummary {
  stats: ReviewStats;
  recentReviews: Review[];
  topReviews: Review[];
  productInfo: {
    id: string;
    name: string;
    slug: string;
  };
}

// Public Reviews API (for customers)
export const reviewsApi = {
  // Create a new review
  create: (reviewData: CreateReviewRequest): Promise<Review> =>
    api.post("/reviews", reviewData),

  // Get all reviews with filters
  getAll: (filters?: ReviewFilters): Promise<PaginatedReviews> =>
    api.get("/reviews", { params: filters }),

  // Get single review by ID
  getById: (id: string): Promise<Review> => api.get(`/reviews/${id}`),

  // Update review (user can only update their own)
  update: (id: string, reviewData: UpdateReviewRequest): Promise<Review> =>
    api.patch(`/reviews/${id}`, reviewData),

  // Delete review (user can only delete their own)
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/reviews/${id}`),

  // Get product review statistics
  getProductStats: (productId: string): Promise<ReviewStats> =>
    api.get(`/reviews/product/${productId}/stats`),

  // Get product review summary (stats + recent + top reviews)
  getProductSummary: (productId: string): Promise<ProductReviewSummary> =>
    api.get(`/reviews/product/${productId}/summary`),

  // Check if current user can review a product
  canReviewProduct: (productId: string): Promise<{ canReview: boolean }> =>
    api.get(`/reviews/can-review/${productId}`),

  // Get user's own reviews
  getUserReviews: (
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedReviews> =>
    api.get(`/reviews/user/${userId}`, {
      params: { page, limit },
    }),
};

// Admin Reviews API (for admin management)
export const adminReviewsApi = {
  // Get all reviews with admin filters
  getAll: (filters?: ReviewFilters): Promise<PaginatedReviews> =>
    api.get("/reviews", { params: filters }),
  // Get single review by ID
  getById: (id: string): Promise<Review> => api.get(`/reviews/${id}`),

  // ✅ NEW: Consolidated moderation endpoint (replaces separate verify/status endpoints)
  moderateReview: (
    id: string,
    changes: ModerateReviewRequest
  ): Promise<Review> => api.patch(`/reviews/${id}/moderate`, changes),

  // Legacy endpoints (deprecated but still available)
  toggleVerification: (id: string): Promise<Review> =>
    api.patch(`/reviews/${id}/verify`),

  toggleStatus: (id: string): Promise<Review> =>
    api.patch(`/reviews/${id}/status`),

  // Delete review (admin can delete any)
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/reviews/${id}`),

  // Get review analytics
  getAnalytics: (): Promise<ReviewAnalytics> => api.get("/reviews/analytics"),

  // Get moderation summary
  getModerationSummary: (): Promise<ModerationSummary> =>
    api.get("/reviews/moderation/summary"),

  // Bulk verify reviews
  bulkVerify: (reviewIds: string[]): Promise<{ updated: number }> =>
    api.patch("/reviews/bulk/verify", { reviewIds }),

  // Bulk delete reviews
  bulkDelete: (reviewIds: string[]): Promise<{ deleted: number }> =>
    api.delete("/reviews/bulk", { data: { reviewIds } }),
};

export default reviewsApi;
