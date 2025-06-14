"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
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
import { adminApi } from "@/lib/api/admin";
import { Material } from "@/types";
import { toast } from "sonner";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    careInstructions: "",
  });

  useEffect(() => {
    loadMaterials();
  }, []);
  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await adminApi.materials.getAll();
      setMaterials(response.data);
    } catch (error) {
      console.error("Error loading materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const newMaterial = await adminApi.materials.create({
        name: formData.name,
        description: formData.description,
      });
      setMaterials([...materials, newMaterial]);
      setShowCreateDialog(false);
      setFormData({ name: "", description: "", careInstructions: "" });
      toast.success("Material created successfully");
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Failed to create material");
    }
  };
  const handleUpdate = async () => {
    if (!selectedMaterial) return;

    try {
      const updatedMaterial = await adminApi.materials.update(
        selectedMaterial.id,
        {
          name: formData.name,
          description: formData.description,
        }
      );
      setMaterials(
        materials.map((material) =>
          material.id === selectedMaterial.id ? updatedMaterial : material
        )
      );
      setShowEditDialog(false);
      setSelectedMaterial(null);
      setFormData({ name: "", description: "", careInstructions: "" });
      toast.success("Material updated successfully");
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error("Failed to update material");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      await adminApi.materials.delete(id);
      setMaterials(materials.filter((material) => material.id !== id));
      toast.success("Material deleted successfully");
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    }
  };
  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || "",
      careInstructions: material.careInstructions || "",
    });
    setShowEditDialog(true);
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="text-muted-foreground">
            Manage material attributes for products
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
          <CardDescription>
            A list of all material attributes in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
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
            <div className="text-center py-4">Loading materials...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Care Instructions</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{material.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {material.description || "-"}
                    </TableCell>{" "}
                    <TableCell className="max-w-[200px] truncate">
                      {material.careInstructions || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">0</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={material.isActive ? "default" : "secondary"}
                      >
                        {material.isActive ? "Active" : "Inactive"}
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
                            onClick={() => openEditDialog(material)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(material.id)}
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

      {/* Create Material Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Material</DialogTitle>
            <DialogDescription>
              Add a new material attribute for products.
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
                placeholder="Material name (e.g., Cotton, Polyester)"
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
                placeholder="Material description"
              />
            </div>
            <div className="grid gap-2">
              {" "}
              <Label htmlFor="careInstructions">Care Instructions</Label>
              <Textarea
                id="careInstructions"
                value={formData.careInstructions}
                onChange={(e) =>
                  setFormData({ ...formData, careInstructions: e.target.value })
                }
                placeholder="Care instructions for this material"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name}>
              Create Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the material information.
            </DialogDescription>
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
                placeholder="Material name (e.g., Cotton, Polyester)"
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
                placeholder="Material description"
              />
            </div>
            <div className="grid gap-2">
              {" "}
              <Label htmlFor="edit-careInstructions">Care Instructions</Label>
              <Textarea
                id="edit-careInstructions"
                value={formData.careInstructions}
                onChange={(e) =>
                  setFormData({ ...formData, careInstructions: e.target.value })
                }
                placeholder="Care instructions for this material"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.name}>
              Update Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
