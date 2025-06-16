"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { adminCollectionApi } from "@/lib/api";
import { toast } from "sonner";

interface BulkProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: number;
  onSuccess: () => void;
}

export function BulkProductsDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: BulkProductsDialogProps) {
  const [mode, setMode] = useState<"import" | "export">("import");
  const [importMethod, setImportMethod] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [productSkus, setProductSkus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Please select a CSV file");
      }
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);

      let skuList: string[] = [];

      if (importMethod === "file" && file) {
        // Read CSV file
        const text = await file.text();
        const lines = text.split("\\n").filter((line) => line.trim());

        // Assume first column is SKU, skip header if present
        skuList = lines
          .slice(lines[0].toLowerCase().includes("sku") ? 1 : 0)
          .map((line) => line.split(",")[0].trim())
          .filter((sku) => sku);
      } else if (importMethod === "text" && productSkus) {
        // Parse text input
        skuList = productSkus
          .split(/[\\n,;]/)
          .map((sku) => sku.trim())
          .filter((sku) => sku);
      }

      if (skuList.length === 0) {
        toast.error("No valid SKUs found");
        return;
      }

      // Import products by SKUs
      await adminCollectionApi.importProductsBySku(collectionId, {
        skus: skuList,
      });

      toast.success(`Successfully imported ${skuList.length} product(s)`);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to import products");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const response = await adminCollectionApi.exportProducts(collectionId);

      // Create and download CSV file
      const blob = new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collection-${collectionId}-products.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Products exported successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to export products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProductSkus("");
    setImportMethod("file");
  };

  const handleModeChange = (newMode: "import" | "export") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Products Management</DialogTitle>
          <DialogDescription>
            Import or export products in bulk for this collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "import" ? "default" : "outline"}
              onClick={() => handleModeChange("import")}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant={mode === "export" ? "default" : "outline"}
              onClick={() => handleModeChange("export")}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {mode === "import" ? (
            <div className="space-y-4">
              {/* Import Method */}
              <div>
                <Label>Import Method</Label>
                <Select
                  value={importMethod}
                  onValueChange={(value: "file" | "text") =>
                    setImportMethod(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">CSV File</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importMethod === "file" ? (
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                  {file && (
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      {file.name} selected
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV file with SKU column (first column)
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="product-skus">Product SKUs</Label>
                  <Textarea
                    id="product-skus"
                    placeholder="Enter SKUs separated by new lines, commas, or semicolons"
                    value={productSkus}
                    onChange={(e) => setProductSkus(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One SKU per line, or separated by commas/semicolons
                  </p>
                </div>
              )}

              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Import Notes:</p>
                  <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                    <li>Products will be added to the collection</li>
                    <li>Invalid SKUs will be skipped</li>
                    <li>Duplicate products will be ignored</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <FileText className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Export Features:</p>
                  <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                    <li>All products in this collection</li>
                    <li>CSV format with product details</li>
                    <li>Ready for editing and re-import</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === "import" ? (
            <Button
              onClick={handleImport}
              disabled={
                loading ||
                (importMethod === "file" && !file) ||
                (importMethod === "text" && !productSkus.trim())
              }
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import Products
            </Button>
          ) : (
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Products
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
