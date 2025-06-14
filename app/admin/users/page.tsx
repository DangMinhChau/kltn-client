"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  UserPlus,
  Download,
  Upload,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
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
import { useUsers } from "@/lib/hooks/useAdminData";
import {
  useDeleteUser,
  useBulkUserAction,
} from "@/lib/hooks/useAdminMutations";
import {
  DataTable,
  Column,
  ActionItem,
  BulkAction,
} from "@/components/admin/DataTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "inactive" | "banned";
  avatar?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

const roleConfig = {
  user: { label: "Customer", variant: "secondary" as const },
  moderator: { label: "Moderator", variant: "default" as const },
  admin: { label: "Admin", variant: "destructive" as const },
};

const statusConfig = {
  active: { label: "Active", variant: "default" as const },
  inactive: { label: "Inactive", variant: "secondary" as const },
  banned: { label: "Banned", variant: "destructive" as const },
};

export default function UsersPage() {
  const router = useRouter();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Data fetching
  const {
    data: users = [],
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
  } = useUsers();

  // Mutations
  const deleteUser = useDeleteUser();
  const bulkUserAction = useBulkUserAction();

  // Table columns configuration
  const columns: Column<User>[] = [
    {
      id: "user",
      header: "User",
      sortable: true,
      filterable: true,
      cell: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground flex items-center">
              {user.email}
              {user.emailVerified && (
                <Shield className="h-3 w-3 ml-1 text-green-600" />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Object.entries(roleConfig).map(([value, config]) => ({
        label: config.label,
        value,
      })),
      cell: (user) => {
        const config = roleConfig[user.role];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Object.entries(statusConfig).map(([value, config]) => ({
        label: config.label,
        value,
      })),
      cell: (user) => {
        const config = statusConfig[user.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "orders",
      header: "Orders",
      accessorKey: "totalOrders",
      sortable: true,
      align: "center",
      cell: (user) => (
        <div className="text-center">
          <div className="font-medium">{user.totalOrders}</div>
          <div className="text-sm text-muted-foreground">
            ${user.totalSpent.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      id: "lastLogin",
      header: "Last Login",
      sortable: true,
      cell: (user) => (
        <div className="text-sm">
          {user.lastLoginAt ? (
            <div>
              <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
              <div className="text-muted-foreground">
                {new Date(user.lastLoginAt).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Never</span>
          )}
        </div>
      ),
    },
    {
      id: "joinDate",
      header: "Join Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (user) => (
        <div className="text-sm text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Action items for each row
  const actions: ActionItem<User>[] = [
    {
      label: "View Profile",
      onClick: (user) => router.push(`/admin/users/${user.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: "Edit User",
      onClick: (user) => router.push(`/admin/users/${user.id}/edit`),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: "Send Email",
      onClick: (user) => {
        window.open(`mailto:${user.email}`);
      },
      icon: <Mail className="h-4 w-4" />,
    },
    {
      label: "Delete User",
      onClick: (user) => setDeleteUserId(user.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      disabled: (user) => user.role?.toLowerCase() === "admin",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<User>[] = [
    {
      label: "Activate Users",
      onClick: async (users) => {
        await bulkUserAction.mutate({
          action: "activate",
          userIds: users.map((u) => u.id),
        });
        refresh();
      },
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      label: "Deactivate Users",
      onClick: async (users) => {
        await bulkUserAction.mutate({
          action: "deactivate",
          userIds: users.map((u) => u.id),
        });
        refresh();
      },
      icon: <UserX className="h-4 w-4" />,
    },
    {
      label: "Delete Users",
      onClick: async (users) => {
        if (confirm(`Are you sure you want to delete ${users.length} users?`)) {
          await bulkUserAction.mutate({
            action: "delete",
            userIds: users.map((u) => u.id),
          });
          refresh();
        }
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      disabled: (users) => users.some((u) => u.role === "admin"),
    },
  ];

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser.mutate(deleteUserId);
      setDeleteUserId(null);
      refresh();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleExport = () => {
    // Implementation for exporting users
    console.log("Export users functionality");
  };

  // Calculate stats
  const stats = {
    total,
    active: users.filter((u) => u.status === "active").length,
    verified: users.filter((u) => u.emailVerified).length,
    admins: users.filter((u) => u.role?.toLowerCase() === "admin").length,
    customers: users.filter((u) => u.role?.toLowerCase() === "customer").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/admin/users/create")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Email verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Regular users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Comprehensive list of all users with their roles and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
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
            onExport={handleExport}
            actions={actions}
            bulkActions={bulkActions}
            selectable={true}
            getRowId={(user) => user.id}
          />
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone. All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
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
