"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Calendar,
  Tag,
  Image as ImageIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCollections } from "@/hooks/useCollections";
import { CollectionFormDialog } from "@/components/collections/CollectionFormDialog";
import { Collection } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i + 5
);

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    collection: Collection | null;
  }>({ open: false, collection: null });

  // Build filters
  const filters = {
    search: searchTerm || undefined,
    season: seasonFilter || undefined,
    year: yearFilter ? parseInt(yearFilter) : undefined,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
        ? false
        : undefined,
    page,
    limit,
  };

  const {
    collections,
    pagination,
    loading,
    error,
    refetch,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useAdminCollections(filters);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Handle filters
  const handleSeasonChange = (value: string) => {
    setSeasonFilter(value);
    setPage(1);
  };

  const handleYearChange = (value: string) => {
    setYearFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSeasonFilter("");
    setYearFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // Handle create collection
  const handleCreate = () => {
    setEditingCollection(null);
    setIsFormOpen(true);
  };

  // Handle edit collection
  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsFormOpen(true);
  };

  // Handle view collection details
  const handleView = (collection: Collection) => {
    router.push(`/admin/products/collections/${collection.id}`);
  };

  // Handle manage products
  const handleManageProducts = (collection: Collection) => {
    router.push(`/admin/products/collections/${collection.id}/products`);
  };

  // Handle delete confirmation
  const handleDeleteClick = (collection: Collection) => {
    setDeleteDialog({ open: true, collection });
  };
  // Handle delete collection
  const handleDelete = async () => {
    if (!deleteDialog.collection) return;

    try {
      await deleteCollection(parseInt(deleteDialog.collection.id));
      toast.success("Collection deleted successfully");
      setDeleteDialog({ open: false, collection: null });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete collection");
    }
  };
  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCollection) {
        await updateCollection(parseInt(editingCollection.id), data);
        toast.success("Collection updated successfully");
      } else {
        await createCollection(data);
        toast.success("Collection created successfully");
      }
      setIsFormOpen(false);
      setEditingCollection(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save collection");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <AdminBreadcrumb
        items={[
          { label: "Products", href: "/admin/products" },
          { label: "Collections", current: true },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Manage your product collections and seasonal releases
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Season Filter */}
            <Select value={seasonFilter} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {SEASONS.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={yearFilter} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>
            {pagination.total} total collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No collections found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || seasonFilter || yearFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "Start by creating your first collection"}
              </p>
              {!(searchTerm || seasonFilter || yearFilter || statusFilter) && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Collection
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {collection.images && collection.images.length > 0 ? (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {" "}
                              <img
                                src={collection.images[0].imageUrl}
                                alt={collection.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{collection.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {collection.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {collection.season}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {collection.year}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {collection.products?.length || 0} products
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            collection.isActive ? "default" : "secondary"
                          }
                        >
                          {collection.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>{" "}
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(
                          typeof collection.createdAt === "string"
                            ? collection.createdAt
                            : collection.createdAt.toISOString()
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleView(collection)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(collection)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleManageProducts(collection)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Manage Products
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(collection)}
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
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
                collections
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(pagination.totalPages - 4, page - 2)
                        ) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>{" "}
      {/* Collection Form Dialog */}
      <CollectionFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCollection(null);
          }
        }}
        collection={editingCollection}
        onSubmit={handleFormSubmit}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, collection: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.collection?.name}"?
              This action cannot be undone and will remove all associated
              products from the collection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, collection: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
