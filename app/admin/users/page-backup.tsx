"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { adminUsersApi } from "@/lib/api/admin";
import { User } from "@/types";
import { toast } from "sonner";

// Utility function to format dates consistently between server and client
const formatDate = (dateString: string | undefined | null): string => {
  try {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    // Use a fixed format that's consistent across server/client
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  } catch (error) {
    return "Invalid Date";
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CUSTOMER",
    isActive: true,
    isEmailVerified: false,
  });
  const roles = [
    { value: "CUSTOMER", label: "Customer" },
    { value: "customer", label: "Customer (lowercase)" },
    { value: "ADMIN", label: "Admin" },
    { value: "admin", label: "Admin (lowercase)" },
  ];
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadUsers();
    }
  }, [mounted]);
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Attempting to load users...");

      console.log("Loading users...");
      const response = await adminUsersApi.getUsers();
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      console.log("First user if exists:", response.data?.[0]);
      console.log(
        "Users loaded successfully:",
        response.data?.length || 0,
        "users"
      );
      setUsers(response.data || []);
      console.log("Users state after setting:", response.data || []);
    } catch (error: any) {
      console.error("Error loading users:", error);

      // More specific error handling
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout - backend may be slow or unavailable");
      } else if (error?.response?.status === 401) {
        toast.error("Unauthorized - please login again");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } else if (error?.response?.status === 403) {
        toast.error("Forbidden - admin access required");
      } else if (error?.response?.status === 500) {
        toast.error("Server error - please try again later");
      } else if (!error?.response) {
        toast.error("Network error - cannot connect to server");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async () => {
    try {
      const newUser = await adminUsersApi.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role as "CUSTOMER" | "ADMIN",
      });
      setUsers([...users, newUser]);
      setShowCreateDialog(false);
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "CUSTOMER",
        isActive: true,
        isEmailVerified: false,
      });
      toast.success("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const updatedUser = await adminUsersApi.updateUser(selectedUser.id, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role as "CUSTOMER" | "ADMIN",
        isActive: formData.isActive,
      });
      setUsers(
        users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
      );
      setShowEditDialog(false);
      setSelectedUser(null);
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "CUSTOMER",
        isActive: true,
        isEmailVerified: false,
      });
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminUsersApi.deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const updatedUser = await adminUsersApi.updateUser(id, {
        isActive: !isActive,
      });
      setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
      toast.success(
        `User ${!isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const updatedUser = await adminUsersApi.updateUser(id, {
        role: newRole,
      });
      setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error changing user role:", error);
      toast.error("Failed to change user role");
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: "",
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    });
    setShowEditDialog(true);
  };
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((user) => {
      // Add safety checks for user properties
      if (!user || typeof user !== "object") return false;

      const fullName = user.fullName || "";
      const email = user.email || "";
      const phoneNumber = user.phoneNumber || "";
      const role = user.role || "";

      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNumber.includes(searchTerm);
      const matchesRole =
        !roleFilter ||
        roleFilter === "all" ||
        role?.toUpperCase() === roleFilter?.toUpperCase();
      const matchesStatus =
        !statusFilter ||
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  console.log("Users array:", users);
  console.log("Filtered users:", filteredUsers);
  console.log("Search term:", searchTerm);
  console.log("Role filter:", roleFilter);
  console.log("Status filter:", statusFilter);

  const getUserStatusBadge = (user: User) => {
    if (!user.isActive)
      return { label: "Inactive", variant: "secondary" as const };
    if (!user.isEmailVerified)
      return { label: "Unverified", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Admin", variant: "destructive" as const, icon: Crown };
      case "CUSTOMER":
        return {
          label: "Customer",
          variant: "default" as const,
          icon: UserCheck,
        };
      default:
        return { label: role, variant: "secondary" as const, icon: UserCheck };
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all user accounts in your system.
          </CardDescription>        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const statusBadge = getUserStatusBadge(user);
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;

                  return (
                    <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <RoleIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {user.isEmailVerified
                                    ? "Verified"
                                    : "Unverified"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="truncate">
                            {user.email}
                          </TableCell>
                          <TableCell className="truncate">
                            {user.phoneNumber}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={roleBadge.variant}
                              className="whitespace-nowrap"
                            >
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {roleBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusBadge.variant}
                              className="whitespace-nowrap"
                            >
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell
                            suppressHydrationWarning
                            className="whitespace-nowrap"
                          >
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleActive(user.id, user.isActive)
                                  }
                                >
                                  {user.isActive ? (
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
                                </DropdownMenuItem>
                                {user.role?.toUpperCase() !== "ADMIN" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeRole(user.id, "ADMIN")
                                    }
                                  >
                                    <Crown className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                {user.role?.toUpperCase() === "ADMIN" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleChangeRole(user.id, "CUSTOMER")
                                    }
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Make Customer
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>                        </TableRow>
                      );
                    })}
                </TableBody>
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="User's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="User password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !formData.fullName ||
                !formData.email ||
                !formData.phoneNumber ||
                !formData.password
              }
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Full Name</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="User's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="edit-isActive">Active Account</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isEmailVerified"
                checked={formData.isEmailVerified}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isEmailVerified: checked as boolean,
                  })
                }
              />
              <Label htmlFor="edit-isEmailVerified">Email Verified</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                !formData.fullName || !formData.email || !formData.phoneNumber
              }
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
