"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { Style } from "@/types";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateStyleData {
  name: string;
  description?: string;
}

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [formData, setFormData] = useState<CreateStyleData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchStyles();
  }, [search, pagination.page]);
  const fetchStyles = async () => {
    try {
      setLoading(true);
      const response = await adminApi.attributes.getStyles();
      setStyles(response);
      setPagination({
        total: response.length,
        page: 1,
        limit: 20,
        totalPages: Math.ceil(response.length / 20),
      });
    } catch (error) {
      console.error("Error fetching styles:", error);
      toast.error("Failed to fetch styles");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Style name is required");
      return;
    }

    try {
      await adminApi.attributes.createStyle(formData);
      toast.success("Style created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      fetchStyles();
    } catch (error) {
      console.error("Error creating style:", error);
      toast.error("Failed to create style");
    }
  };
  const handleEdit = async () => {
    if (!selectedStyle || !formData.name.trim()) {
      toast.error("Style name is required");
      return;
    }

    try {
      await adminApi.attributes.updateStyle(selectedStyle.id, formData);
      toast.success("Style updated successfully");
      setIsEditDialogOpen(false);
      setSelectedStyle(null);
      setFormData({ name: "", description: "" });
      fetchStyles();
    } catch (error) {
      console.error("Error updating style:", error);
      toast.error("Failed to update style");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this style?")) return;

    try {
      await adminApi.attributes.deleteStyle(id);
      toast.success("Style deleted successfully");
      fetchStyles();
    } catch (error) {
      console.error("Error deleting style:", error);
      toast.error("Failed to delete style");
    }
  };

  const openEditDialog = (style: Style) => {
    setSelectedStyle(style);
    setFormData({
      name: style.name,
      description: style.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Styles</h1>
          <p className="text-muted-foreground">
            Manage product styles and fashion categories
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Style
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Style</DialogTitle>
              <DialogDescription>
                Add a new style to categorize your products.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter style name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter style description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Style</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>      </div>

      {/* Styles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Styles</CardTitle>
          <CardDescription>
            A list of all style attributes in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search styles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : styles.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto max-w-sm">
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-full w-full"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">No styles found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating your first style.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Style
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {styles.map((style) => (
                    <TableRow key={style.id}>
                      <TableCell className="font-medium">
                        {style.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {style.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        {style.description || (
                          <span className="text-muted-foreground">—</span>
                        )}{" "}
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={style.isActive} />
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
                              onClick={() => openEditDialog(style)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(style.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} styles
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev: PaginationMeta) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev: PaginationMeta) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Style</DialogTitle>
            <DialogDescription>Update the style information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter style name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                placeholder="Enter style description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Style</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
