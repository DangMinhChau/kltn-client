"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/admin/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Plus,
  Search,
  Send,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useNotifications,
  useNotificationStats,
} from "@/lib/hooks/useAdminData";
import { adminApi } from "@/lib/api/admin";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "warning", "error", "success"]).default("info"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  targetType: z.enum(["all", "role", "specific"]).default("all"),
  targetValue: z.string().optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high" | "urgent";
  targetType: "all" | "role" | "specific";
  targetValue?: string;
  isActive: boolean;
  isRead: boolean;
  readCount: number;
  totalRecipients: number;
  scheduledAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

function NotificationForm({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: Notification;
  onSubmit: (data: NotificationFormData) => void;
  onClose: () => void;
}) {
  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: initialData || {
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetType: "all",
      targetValue: "",
      isActive: true,
    },
  });

  const targetType = form.watch("targetType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Notification title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notification message content"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-blue-500" />
                        Info
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                        Error
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Success
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="role">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      By Role
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Specific Users
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {targetType === "role" && (
          <FormField
            control={form.control}
            name="targetValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {targetType === "specific" && (
          <FormField
            control={form.control}
            name="targetValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User IDs</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user IDs separated by commas"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Send Time (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires At (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this notification to be sent to users
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            {initialData ? "Update" : "Send"} Notification
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function NotificationsPage() {
  const {
    data: notifications = [],
    loading,
    refresh: refreshNotifications,
    setSearch,
    setFilters,
  } = useNotifications();

  const { data: stats } = useNotificationStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Update search and filters when they change
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery, setSearch]);

  useEffect(() => {
    const filters: Record<string, any> = {};
    if (typeFilter !== "all") filters.type = typeFilter;
    if (priorityFilter !== "all") filters.priority = priorityFilter;
    setFilters(filters);
  }, [typeFilter, priorityFilter, setFilters]);

  const handleCreateNotification = async (data: NotificationFormData) => {
    try {
      const notificationData = {
        ...data,
        targetAudience: data.targetType,
        userIds:
          data.targetType === "specific"
            ? data.targetValue?.split(",")
            : undefined,
      };
      await adminApi.notifications.create(notificationData);
      toast.success("Notification created successfully");
      setShowCreateDialog(false);
      refreshNotifications();
    } catch (error) {
      console.error("Failed to create notification:", error);
      toast.error("Failed to create notification");
    }
  };

  const handleUpdateNotification = async (data: NotificationFormData) => {
    if (!selectedNotification) return;
    try {
      await adminApi.notifications.update(selectedNotification.id, data);
      toast.success("Notification updated successfully");
      setShowEditDialog(false);
      setSelectedNotification(null);
      refreshNotifications();
    } catch (error) {
      console.error("Failed to update notification:", error);
      toast.error("Failed to update notification");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await adminApi.notifications.delete(id);
      toast.success("Notification deleted successfully");
      refreshNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const columns = [
    {
      header: "Notification",
      accessorKey: "title",
      cell: ({ row }: { row: { original: Notification } }) => {
        const notification = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {getTypeIcon(notification.type)}
              <span className="font-medium">{notification.title}</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {notification.message}
            </p>
          </div>
        );
      },
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: ({ row }: { row: { original: Notification } }) => {
        const priority = row.original.priority;
        return (
          <Badge className={getPriorityColor(priority)}>
            {priority.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Target",
      accessorKey: "target",
      cell: ({ row }: { row: { original: Notification } }) => {
        const notification = row.original;
        return (
          <div className="space-y-1">
            <Badge variant="outline">
              {notification.targetType === "all" && "All Users"}
              {notification.targetType === "role" &&
                `Role: ${notification.targetValue}`}
              {notification.targetType === "specific" && "Specific Users"}
            </Badge>
            <div className="text-xs text-gray-500">
              {notification.readCount}/{notification.totalRecipients} read
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Notification } }) => {
        const notification = row.original;
        const isExpired =
          notification.expiresAt &&
          new Date(notification.expiresAt) < new Date();
        const isScheduled =
          notification.scheduledAt &&
          new Date(notification.scheduledAt) > new Date();

        return (
          <div className="space-y-1">
            <Badge variant={notification.isActive ? "success" : "secondary"}>
              {notification.isActive ? "Active" : "Inactive"}
            </Badge>
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {isScheduled && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Scheduled
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }: { row: { original: Notification } }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-sm">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {date.toLocaleDateString()}
            </div>
            <div className="text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row: { original: Notification } }) => {
        const notification = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // View details
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedNotification(notification);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteNotification(notification.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Send and manage system notifications to users
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Notification
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredNotifications}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          <NotificationForm
            onSubmit={handleCreateNotification}
            onClose={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Notification Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <NotificationForm
              initialData={selectedNotification}
              onSubmit={handleUpdateNotification}
              onClose={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
