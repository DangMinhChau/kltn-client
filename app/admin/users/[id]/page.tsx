"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  CreditCard,
  ShoppingBag,
  Star,
  MessageSquare,
  Activity,
  Globe,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/hooks/useAdminData";
import {
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
} from "@/lib/hooks/useAdminMutations";
import { toast } from "sonner";

const roleConfig = {
  user: { label: "Customer", variant: "secondary" as const, icon: UserCheck },
  moderator: { label: "Moderator", variant: "default" as const, icon: Shield },
  admin: { label: "Admin", variant: "destructive" as const, icon: ShieldCheck },
};

const statusConfig = {
  active: { label: "Active", variant: "default" as const, icon: UserCheck },
  inactive: { label: "Inactive", variant: "secondary" as const, icon: UserX },
  banned: { label: "Banned", variant: "destructive" as const, icon: UserX },
};

interface UserActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface UserOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

interface UserReview {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Data fetching
  const { data: user, loading, error, refresh } = useUser(userId);

  // Mutations
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  // Mock data for demonstration - replace with real API calls
  const mockActivityLogs: UserActivityLog[] = [
    {
      id: "1",
      action: "Login",
      description: "User logged in successfully",
      timestamp: "2024-01-15T10:30:00Z",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 120.0.0.0",
    },
    {
      id: "2",
      action: "Profile Update",
      description: "Updated profile information",
      timestamp: "2024-01-14T15:20:00Z",
      ipAddress: "192.168.1.1",
    },
    {
      id: "3",
      action: "Order Placed",
      description: "Placed order #ORD-001",
      timestamp: "2024-01-13T09:15:00Z",
      ipAddress: "192.168.1.1",
    },
  ];

  const mockOrders: UserOrder[] = [
    {
      id: "1",
      orderNumber: "ORD-001",
      total: 299.99,
      status: "delivered",
      createdAt: "2024-01-13T09:15:00Z",
      itemsCount: 3,
    },
    {
      id: "2",
      orderNumber: "ORD-002",
      total: 149.5,
      status: "processing",
      createdAt: "2024-01-10T14:30:00Z",
      itemsCount: 2,
    },
  ];

  const mockReviews: UserReview[] = [
    {
      id: "1",
      productName: "Wireless Headphones",
      rating: 5,
      comment: "Excellent sound quality and comfortable to wear.",
      createdAt: "2024-01-14T12:00:00Z",
      status: "approved",
    },
    {
      id: "2",
      productName: "Smartphone Case",
      rating: 4,
      comment: "Good protection but a bit bulky.",
      createdAt: "2024-01-12T16:45:00Z",
      status: "approved",
    },
  ];

  const handleStatusToggle = async () => {
    if (!user) return;

    try {
      if (user.status === "active") {
        await deactivateUser.mutateAsync(user.id);
        toast.success("User deactivated successfully");
      } else {
        await activateUser.mutateAsync(user.id);
        toast.success("User activated successfully");
      }
      refresh();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser.mutateAsync(user.id);
      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">
            The user you're looking for doesn't exist or has been deleted.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">
              Detailed information about {user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:${user.email}`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
          <Button
            variant={user.status === "active" ? "secondary" : "default"}
            size="sm"
            onClick={handleStatusToggle}
            disabled={activateUser.loading || deactivateUser.loading}
          >
            {user.status === "active" ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          {user.role?.toLowerCase() !== "admin" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Sidebar - User Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  {user.emailVerified && (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  )}
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Last login {formatDate(user.lastLoginAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {user.totalOrders || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${(user.totalSpent || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Spent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user.totalOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All time orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Spent
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(user.totalSpent || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lifetime value
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Reviews Given
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockReviews.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Product reviews
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest user activities and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivityLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border"
                      >
                        <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    All orders placed by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{order.orderNumber}</p>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.itemsCount} items •{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${order.total.toFixed(2)}
                          </p>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Product Reviews</CardTitle>
                  <CardDescription>
                    Reviews and ratings given by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.productName}</h4>
                          <Badge variant="outline">{review.status}</Badge>
                        </div>
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
                          <span className="ml-2 text-sm font-medium">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Detailed activity history and system interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border"
                      >
                        <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.description}
                          </p>
                          {log.ipAddress && (
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>IP: {log.ipAddress}</span>
                              {log.userAgent && (
                                <span>Device: {log.userAgent}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone. All user data, orders, and reviews will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.loading}
            >
              {deleteUser.loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
