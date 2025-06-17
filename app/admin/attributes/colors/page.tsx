"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Palette,
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
import { adminApi } from "@/lib/api/admin";
import { Color } from "@/types";
import { toast } from "sonner";

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hexCode: "#000000",
  });

  useEffect(() => {
    loadColors();
  }, []);
  const loadColors = async () => {
    try {
      setLoading(true);
      console.log("Loading colors...");
      const response = await adminApi.colors.getAll();
      console.log("Colors response:", response);
      setColors(response.data);
    } catch (error) {
      console.error("Error loading colors:", error);
      toast.error("Failed to load colors");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const newColor = await adminApi.colors.create({
        name: formData.name,
        code: formData.code,
        hexCode: formData.hexCode,
      });
      setColors([...colors, newColor]);
      setShowCreateDialog(false);
      setFormData({ name: "", code: "", hexCode: "#000000" });
      toast.success("Color created successfully");
    } catch (error) {
      console.error("Error creating color:", error);
      toast.error("Failed to create color");
    }
  };
  const handleUpdate = async () => {
    if (!selectedColor) return;

    try {
      const updatedColor = await adminApi.colors.update(selectedColor.id, {
        name: formData.name,
        code: formData.code,
        hexCode: formData.hexCode,
      });
      setColors(
        colors.map((color) =>
          color.id === selectedColor.id ? updatedColor : color
        )
      );
      setShowEditDialog(false);
      setSelectedColor(null);
      setFormData({ name: "", code: "", hexCode: "#000000" });
      toast.success("Color updated successfully");
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error("Failed to update color");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;

    try {
      await adminApi.colors.delete(id);
      setColors(colors.filter((color) => color.id !== id));
      toast.success("Color deleted successfully");
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Failed to delete color");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const color = colors.find((c) => c.id === id);
      if (!color) return;

      const updatedColor = await adminApi.colors.update(id, {
        isActive: !color.isActive,
      });

      setColors(colors.map((c) => (c.id === id ? updatedColor : c)));

      toast.success(
        `Color ${
          updatedColor.isActive ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      console.error("Error toggling color status:", error);
      toast.error("Failed to update color status");
    }
  };

  const openEditDialog = (color: Color) => {
    setSelectedColor(color);
    setFormData({
      name: color.name,
      code: color.code || "",
      hexCode: color.hexCode,
    });
    setShowEditDialog(true);
  };

  const filteredColors = colors.filter((color) =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colors</h1>
          <p className="text-muted-foreground">
            Manage color attributes for products
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Color
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Colors</CardTitle>
          <CardDescription>
            A list of all color attributes in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading colors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Hex Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <Palette className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {color.code}
                    </TableCell>{" "}
                    <TableCell className="font-mono text-sm">
                      {color.hexCode}
                    </TableCell>
                    <TableCell>
                      <Badge variant={color.isActive ? "default" : "secondary"}>
                        {color.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>{" "}
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(color)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(color.id)}
                          >
                            <div className="mr-2 h-4 w-4" />
                            {color.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(color.id)}
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

      {/* Create Color Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Color</DialogTitle>
            <DialogDescription>
              Add a new color attribute for product variants.
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
                placeholder="Color name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="color-code"
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hexCode">Hex Code</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="w-12 h-10 rounded border"
                />
                <Input
                  id="hexCode"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
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
              disabled={!formData.name || !formData.code || !formData.hexCode}
            >
              Create Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Color Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>Update the color information.</DialogDescription>
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
                placeholder="Color name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Color code"
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-hexCode">Hex Code</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  className="w-12 h-10 rounded border"
                />
                <Input
                  id="edit-hexCode"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value })
                  }
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.code || !formData.hexCode}
            >
              Update Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
