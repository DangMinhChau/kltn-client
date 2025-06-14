"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Ruler,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api/admin";
import { Size, Category } from "@/types";
import { toast } from "sonner";

export default function SizesPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const [sizesResponse, categoriesResponse] = await Promise.all([
        adminApi.attributes.getSizes(),
        adminApi.categories.getCategories(),
      ]);
      setSizes(sizesResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const newSize = await adminApi.attributes.createSize({
        name: formData.name,
        sortOrder: 0,
      });
      setSizes([...sizes, newSize]);
      setShowCreateDialog(false);
      setFormData({ name: "", description: "", categoryId: "" });
      toast.success("Size created successfully");
    } catch (error) {
      console.error("Error creating size:", error);
      toast.error("Failed to create size");
    }
  };

  const handleUpdate = async () => {
    if (!selectedSize) return;    try {
      const updatedSize = await adminApi.attributes.updateSize(selectedSize.id, {
        name: formData.name,
      });
      setSizes(
        sizes.map((size) => (size.id === selectedSize.id ? updatedSize : size))
      );
      setShowEditDialog(false);
      setSelectedSize(null);
      setFormData({ name: "", description: "", categoryId: "" });
      toast.success("Size updated successfully");
    } catch (error) {
      console.error("Error updating size:", error);
      toast.error("Failed to update size");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return;    try {
      await adminApi.attributes.deleteSize(id);
      setSizes(sizes.filter((size) => size.id !== id));
      toast.success("Size deleted successfully");
    } catch (error) {
      console.error("Error deleting size:", error);
      toast.error("Failed to delete size");
    }
  };
  const openEditDialog = (size: Size) => {
    setSelectedSize(size);
    setFormData({
      name: size.name,
      description: size.description || "",
      categoryId: "",
    });
    setShowEditDialog(true);
  };
  const filteredSizes = sizes.filter((size) => {
    const matchesSearch =
      size.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sizes</h1>
          <p className="text-muted-foreground">
            Manage size attributes for products
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Size
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sizes</CardTitle>
          <CardDescription>
            A list of all size attributes in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sizes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading sizes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{size.name}</span>
                      </div>
                    </TableCell>                    <TableCell className="max-w-[200px] truncate">
                      {size.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{size.type || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        0
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={size.isActive ? "default" : "secondary"}>
                        {size.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                            onClick={() => openEditDialog(size)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(size.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

      {/* Create Size Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Size</DialogTitle>
            <DialogDescription>
              Add a new size attribute for product variants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Size name (e.g., S, M, L, XL)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Size description (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
              disabled={!formData.name || !formData.categoryId}
            >
              Create Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Size Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Size</DialogTitle>
            <DialogDescription>Update the size information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Size name (e.g., S, M, L, XL)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Size description (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.categoryId}
            >
              Update Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
