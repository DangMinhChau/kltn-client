"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/DataTable";
import { ImageUpload } from "@/components/admin/ImageUpload";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  Palette,
  Ruler,
  DollarSign,
  Archive,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";

const variantSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  colorId: z.string().min(1, "Color is required"),
  sizeId: z.string().min(1, "Size is required"),
  materialId: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  compareAtPrice: z.number().optional(),
  cost: z.number().min(0, "Cost must be non-negative"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  stockQuantity: z.number().min(0, "Stock quantity must be non-negative"),
  lowStockThreshold: z.number().min(0).default(10),
  weight: z.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
  continueSellingWhenOutOfStock: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});

type VariantFormData = z.infer<typeof variantSchema>;

interface Variant {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  colorId: string;
  color: {
    id: string;
    name: string;
    hexCode: string;
  };
  sizeId: string;
  size: {
    id: string;
    name: string;
  };
  materialId?: string;
  material?: {
    id: string;
    name: string;
  };
  price: number;
  compareAtPrice?: number;
  cost: number;
  sku: string;
  barcode?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isActive: boolean;
  trackInventory: boolean;
  continueSellingWhenOutOfStock: boolean;
  images: Array<{
    id: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

function VariantForm({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: Variant;
  onSubmit: (data: VariantFormData) => void;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: initialData || {
      productId: "",
      colorId: "",
      sizeId: "",
      materialId: "",
      price: 0,
      compareAtPrice: 0,
      cost: 0,
      sku: "",
      barcode: "",
      stockQuantity: 0,
      lowStockThreshold: 10,
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      isActive: true,
      trackInventory: true,
      continueSellingWhenOutOfStock: false,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, colorsData, sizesData, materialsData] =
          await Promise.all([
            adminApi.get("/products"),
            adminApi.get("/colors"),
            adminApi.get("/sizes"),
            adminApi.get("/materials"),
          ]);

        setProducts(productsData.data || []);
        setColors(colorsData.data || []);
        setSizes(sizesData.data || []);
        setMaterials(materialsData.data || []);
      } catch (error) {
        toast.error("Failed to load form data");
      }
    };

    loadData();
  }, []);

  const handleSubmit = (data: VariantFormData) => {
    onSubmit({ ...data, images });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Product Selection */}
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variant Attributes */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="colorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (VND)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare at Price (VND)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (VND)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <div className="space-y-3">
          <FormLabel>Images</FormLabel>
          <ImageUpload value={images} onChange={setImages} multiple={true} />
        </div>

        {/* Inventory Settings */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="trackInventory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Track Inventory</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Track quantity for this variant
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

          <FormField
            control={form.control}
            name="continueSellingWhenOutOfStock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Continue Selling When Out of Stock
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow customers to buy this variant when it's out of stock
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

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Make this variant available for purchase
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
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"} Variant
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function VariantsPage() {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get("/variants");
      setVariants(response.data || []);
    } catch (error) {
      toast.error("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariant = async (data: VariantFormData) => {
    try {
      await adminApi.post("/variants", data);
      toast.success("Variant created successfully");
      setShowCreateDialog(false);
      loadVariants();
    } catch (error) {
      toast.error("Failed to create variant");
    }
  };

  const handleUpdateVariant = async (data: VariantFormData) => {
    if (!selectedVariant) return;
    try {
      await adminApi.patch(`/variants/${selectedVariant.id}`, data);
      toast.success("Variant updated successfully");
      setShowEditDialog(false);
      setSelectedVariant(null);
      loadVariants();
    } catch (error) {
      toast.error("Failed to update variant");
    }
  };

  const handleDeleteVariant = async (id: string) => {
    try {
      await adminApi.delete(`/variants/${id}`);
      toast.success("Variant deleted successfully");
      loadVariants();
    } catch (error) {
      toast.error("Failed to delete variant");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStockStatus = (variant: Variant) => {
    if (!variant.trackInventory) return "Not tracked";
    if (variant.stockQuantity === 0) return "Out of stock";
    if (variant.stockQuantity <= variant.lowStockThreshold) return "Low stock";
    return "In stock";
  };

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "Out of stock":
        return "destructive";
      case "Low stock":
        return "warning";
      case "In stock":
        return "success";
      default:
        return "secondary";
    }
  };

  const filteredVariants = variants.filter((variant) => {
    const matchesSearch =
      variant.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.size.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProduct =
      productFilter === "all" || variant.productId === productFilter;

    const stockStatus = getStockStatus(variant);
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && stockStatus === "In stock") ||
      (stockFilter === "low-stock" && stockStatus === "Low stock") ||
      (stockFilter === "out-of-stock" && stockStatus === "Out of stock");

    return matchesSearch && matchesProduct && matchesStock;
  });

  const columns = [
    {
      header: "Variant",
      accessorKey: "variant",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
              {variant.images.length > 0 ? (
                <img
                  src={variant.images[0].url}
                  alt={variant.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{variant.product.name}</div>
              <div className="text-sm text-gray-500">
                {variant.color.name} · {variant.size.name}
                {variant.material && ` · ${variant.material.name}`}
              </div>
              <div className="text-xs text-gray-400">SKU: {variant.sku}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Attributes",
      accessorKey: "attributes",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: variant.color.hexCode }}
              />
              <span className="text-sm">{variant.color.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Ruler className="w-3 h-3 text-gray-400" />
              <span className="text-sm">{variant.size.name}</span>
            </div>
            {variant.material && (
              <div className="text-xs text-gray-500">
                {variant.material.name}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Pricing",
      accessorKey: "pricing",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{formatCurrency(variant.price)}</div>
            {variant.compareAtPrice &&
              variant.compareAtPrice > variant.price && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(variant.compareAtPrice)}
                </div>
              )}
            <div className="text-xs text-gray-400">
              Cost: {formatCurrency(variant.cost)}
            </div>
          </div>
        );
      },
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
        const status = getStockStatus(variant);
        return (
          <div className="space-y-1">
            <Badge variant={getStockBadgeVariant(status)}>{status}</Badge>
            {variant.trackInventory && (
              <div className="text-sm text-gray-500">
                {variant.stockQuantity} units
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
        return (
          <Badge variant={variant.isActive ? "success" : "secondary"}>
            {variant.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: { row: { original: Variant } }) => {
        const variant = row.original;
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
                onClick={() => router.push(`/admin/variants/${variant.id}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedVariant(variant);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Duplicate variant logic
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteVariant(variant.id)}
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
    loadVariants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Variants
          </h1>
          <p className="text-muted-foreground">
            Manage product variants with different colors, sizes, and pricing
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search variants by product, SKU, color, or size..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Variants ({filteredVariants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredVariants}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Create Variant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Variant</DialogTitle>
          </DialogHeader>
          <VariantForm
            onSubmit={handleCreateVariant}
            onClose={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          {selectedVariant && (
            <VariantForm
              initialData={selectedVariant}
              onSubmit={handleUpdateVariant}
              onClose={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
