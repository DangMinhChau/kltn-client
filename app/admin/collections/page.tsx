"use client";

import { useState } from "react";
import { Plus, Search, Filter, FileX, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { CollectionFormDialog } from "@/components/admin/collections/CollectionFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { useCollections } from "@/lib/hooks/useAdminData";
import { useDeleteCollection } from "@/lib/hooks/useAdminMutations";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null
  );

  // Hooks
  const {
    data: collections = [],
    loading,
    error,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    search: dataSearch,
    setSearch: setDataSearch,
    refresh,
  } = useCollections();

  const deleteCollection = useDeleteCollection();

  // Stats calculations  const totalCollections = collections?.length || 0;
  const activeCollections = collections?.filter((c) => c.isActive).length || 0;
  const inactiveCollections = totalCollections - activeCollections;

  // Table columns
  const columns: ColumnDef<Collection>[] = [
    {
      accessorKey: "name",
      header: "Collection Name",
      cell: ({ row }) => {
        const collection = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{collection.name}</span>
            <span className="text-sm text-muted-foreground">
              /{collection.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-md">
            <span className="text-sm text-muted-foreground">
              {description || "No description"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "productsCount",
      header: "Products",
      cell: ({ row }) => {
        const count = row.getValue("productsCount") as number;
        return (
          <Badge variant="secondary">
            {count || 0} {count === 1 ? "product" : "products"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string);
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const collection = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(collection.id)}
              >
                Copy collection ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCollection(collection);
                  setIsFormDialogOpen(true);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteCollectionId(collection.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Event handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setDataSearch(value);
  };

  const handleCreateNew = () => {
    setSelectedCollection(null);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedCollection(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteCollectionId) return;

    try {
      await deleteCollection.mutate(deleteCollectionId);
      setDeleteCollectionId(null);
      refresh();
    } catch (error) {
      console.error("Failed to delete collection:", error);
    }
  };
  const handleExport = async (format: "csv" | "xlsx" = "csv") => {
    try {
      const exportData = collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description || "",
        isActive: collection.isActive ? "Yes" : "No",
        productsCount: collection.productsCount || 0,
        createdAt: new Date(collection.createdAt).toLocaleString(),
        updatedAt: new Date(collection.updatedAt).toLocaleString(),
      }));

      if (format === "csv") {
        // Convert to CSV
        const headers = [
          "ID",
          "Name",
          "Slug",
          "Description",
          "Active",
          "Products Count",
          "Created At",
          "Updated At",
        ];
        const csvContent = [
          headers.join(","),
          ...exportData.map((row) =>
            [
              row.id,
              `"${row.name}"`,
              row.slug,
              `"${row.description}"`,
              row.isActive,
              row.productsCount,
              `"${row.createdAt}"`,
              `"${row.updatedAt}"`,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `collections-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (format === "xlsx") {
        // For Excel export, you would typically use a library like xlsx
        // For now, we'll use CSV format as fallback
        await handleExport("csv");
      }

      toast.success(`Collections exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export collections");
    }
  };

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileX className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">
              Failed to load collections
            </h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Collections"
          value={totalCollections}
          description="All collections in the system"
          icon="📚"
        />
        <StatsCard
          title="Active Collections"
          value={activeCollections}
          description="Currently active collections"
          icon="✅"
          trend={
            totalCollections > 0
              ? {
                  value: Math.round(
                    (activeCollections / totalCollections) * 100
                  ),
                  label: "of total",
                }
              : undefined
          }
        />
        <StatsCard
          title="Inactive Collections"
          value={inactiveCollections}
          description="Disabled collections"
          icon="⏸️"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search collections by name or slug..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={collections}
            loading={loading}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
            onSearchChange={handleSearch}
            onRefresh={refresh}
            emptyState={{
              title: "No collections found",
              description: "Get started by creating your first collection.",
              action: (
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Collection
                </Button>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Collection Form Dialog */}
      <CollectionFormDialog
        collection={selectedCollection}
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteCollectionId}
        onOpenChange={() => setDeleteCollectionId(null)}
        onConfirm={handleDelete}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? This action cannot be undone and will remove all associated products from the collection."
        loading={deleteCollection.loading}
      />
    </div>
  );
}
