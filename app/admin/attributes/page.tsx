"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Palette,
  Ruler,
  Layers,
  Tag,
  Shirt,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";

// Form schemas
const colorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  isActive: z.boolean().default(true),
});

const sizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
});

const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const styleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ColorFormData = z.infer<typeof colorSchema>;
type SizeFormData = z.infer<typeof sizeSchema>;
type MaterialFormData = z.infer<typeof materialSchema>;
type TagFormData = z.infer<typeof tagSchema>;
type StyleFormData = z.infer<typeof styleSchema>;

// Attribute Item component
function AttributeItem({
  item,
  onEdit,
  onDelete,
  type,
}: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  type: string;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          {type === "colors" && item.hexCode && (
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: item.hexCode }}
            />
          )}
          <span className="font-medium">{item.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {type === "colors" && item.code && (
          <Badge variant="outline">{item.code}</Badge>
        )}
        {type === "colors" && item.hexCode && (
          <Badge variant="outline">{item.hexCode}</Badge>
        )}
        {item.description && (
          <span className="text-sm text-gray-500">{item.description}</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={item.isActive ? "success" : "secondary"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Form components
function ColorForm({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: any;
  onSubmit: (data: ColorFormData) => void;
  onClose: () => void;
}) {
  const form = useForm<ColorFormData>({
    resolver: zodResolver(colorSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      hexCode: "#000000",
      isActive: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Color name (e.g., Red)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="Color code (e.g., RED)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hexCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hex Code</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input placeholder="#FF0000" {...field} />
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-12 h-10 border rounded"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this color available for selection
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
          <Button type="submit">{initialData ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}

function GenericAttributeForm({
  initialData,
  onSubmit,
  onClose,
  type,
  schema,
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  type: string;
  schema: any;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      description: "",
      isActive: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder={`${type} name`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder={`${type} description`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this {type.toLowerCase()} available for selection
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
          <Button type="submit">{initialData ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function AttributesPage() {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const loadData = async () => {
    setLoading(true);
    try {
      const [colorsData, sizesData, materialsData, tagsData, stylesData] =
        await Promise.all([
          adminApi.attributes.getColors(),
          adminApi.attributes.getSizes(),
          adminApi.attributes.getMaterials(),
          adminApi.attributes.getTags(),
          adminApi.attributes.getStyles(),
        ]);

      setColors(colorsData.data || colorsData || []);
      setSizes(sizesData.data || sizesData || []);
      setMaterials(materialsData.data || materialsData || []);
      setTags(tagsData.data || tagsData || []);
      setStyles(stylesData.data || stylesData || []);
    } catch (error) {
      console.error("Failed to load attributes:", error);
      toast.error("Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (data: any) => {
    try {
      await adminApi.attributes.create(activeTab, data);
      toast.success(`${activeTab.slice(0, -1)} created successfully`);
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error(`Failed to create ${activeTab.slice(0, -1)}:`, error);
      toast.error(`Failed to create ${activeTab.slice(0, -1)}`);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedItem) return;
    try {
      await adminApi.attributes.update(activeTab, selectedItem.id, data);
      toast.success(`${activeTab.slice(0, -1)} updated successfully`);
      setShowEditDialog(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error(`Failed to update ${activeTab.slice(0, -1)}:`, error);
      toast.error(`Failed to update ${activeTab.slice(0, -1)}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.attributes.delete(activeTab, id);
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      loadData();
    } catch (error) {
      console.error(`Failed to delete ${activeTab.slice(0, -1)}:`, error);
      toast.error(`Failed to delete ${activeTab.slice(0, -1)}`);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "colors":
        return colors;
      case "sizes":
        return sizes;
      case "materials":
        return materials;
      case "tags":
        return tags;
      case "styles":
        return styles;
      default:
        return [];
    }
  };

  const getFilteredData = () => {
    const data = getCurrentData();
    if (!searchQuery) return data;
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "colors":
        return <Palette className="w-4 h-4" />;
      case "sizes":
        return <Ruler className="w-4 h-4" />;
      case "materials":
        return <Layers className="w-4 h-4" />;
      case "tags":
        return <Tag className="w-4 h-4" />;
      case "styles":
        return <Shirt className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSchema = () => {
    switch (activeTab) {
      case "colors":
        return colorSchema;
      case "sizes":
        return sizeSchema;
      case "materials":
        return materialSchema;
      case "tags":
        return tagSchema;
      case "styles":
        return styleSchema;
      default:
        return materialSchema;
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Attributes
          </h1>
          <p className="text-muted-foreground">
            Manage colors, sizes, materials, tags, and styles for products
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors" className="flex items-center space-x-2">
            {getTabIcon("colors")}
            <span>Colors</span>
          </TabsTrigger>
          <TabsTrigger value="sizes" className="flex items-center space-x-2">
            {getTabIcon("sizes")}
            <span>Sizes</span>
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            className="flex items-center space-x-2"
          >
            {getTabIcon("materials")}
            <span>Materials</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center space-x-2">
            {getTabIcon("tags")}
            <span>Tags</span>
          </TabsTrigger>
          <TabsTrigger value="styles" className="flex items-center space-x-2">
            {getTabIcon("styles")}
            <span>Styles</span>
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content for each tab */}
        {["colors", "sizes", "materials", "tags", "styles"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize flex items-center">
                  {getTabIcon(tab)}
                  <span className="ml-2">
                    {tab} ({getFilteredData().length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData().map((item) => (
                      <AttributeItem
                        key={item.id}
                        item={item}
                        type={tab}
                        onEdit={(item) => {
                          setSelectedItem(item);
                          setShowEditDialog(true);
                        }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create {activeTab.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          {activeTab === "colors" ? (
            <ColorForm
              onSubmit={handleCreate}
              onClose={() => setShowCreateDialog(false)}
            />
          ) : (
            <GenericAttributeForm
              type={activeTab.slice(0, -1)}
              schema={getSchema()}
              onSubmit={handleCreate}
              onClose={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {activeTab.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          {selectedItem &&
            (activeTab === "colors" ? (
              <ColorForm
                initialData={selectedItem}
                onSubmit={handleUpdate}
                onClose={() => setShowEditDialog(false)}
              />
            ) : (
              <GenericAttributeForm
                initialData={selectedItem}
                type={activeTab.slice(0, -1)}
                schema={getSchema()}
                onSubmit={handleUpdate}
                onClose={() => setShowEditDialog(false)}
              />
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
