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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { adminVariantsApi } from "@/lib/api/admin";
import { ProductVariant } from "@/types";
import { toast } from "sonner";

interface BulkStockUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateComplete: () => void;
}

interface StockUpdateItem {
  sku: string;
  currentStock: number;
  newStock: number;
  variantId?: string;
  status: "pending" | "success" | "error";
  errorMessage?: string;
}

export function BulkStockUpdateDialog({
  open,
  onOpenChange,
  onUpdateComplete,
}: BulkStockUpdateDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [updateItems, setUpdateItems] = useState<StockUpdateItem[]>([]);
  const [step, setStep] = useState<"input" | "preview" | "result">("input");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = () => {
    if (!csvText.trim()) {
      toast.error("Vui lòng nhập dữ liệu CSV");
      return;
    }

    try {
      const lines = csvText.trim().split("\n");
      const items: StockUpdateItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip header line if it contains "sku" or "SKU"
        if (i === 0 && line.toLowerCase().includes("sku")) continue;

        const [sku, newStockStr] = line
          .split(",")
          .map((s) => s.trim().replace(/"/g, ""));
        const newStock = parseInt(newStockStr);

        if (!sku || isNaN(newStock)) {
          toast.error(`Dòng ${i + 1}: Dữ liệu không hợp lệ - ${line}`);
          return;
        }

        items.push({
          sku,
          currentStock: 0, // Will be filled when we fetch variants
          newStock,
          status: "pending",
        });
      }

      if (items.length === 0) {
        toast.error("Không tìm thấy dữ liệu hợp lệ");
        return;
      }

      setUpdateItems(items);
      setStep("preview");
      fetchCurrentStocks(items);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Lỗi khi phân tích dữ liệu CSV");
    }
  };

  const fetchCurrentStocks = async (items: StockUpdateItem[]) => {
    try {
      // Fetch all variants to match SKUs
      const allVariants = await adminVariantsApi.getVariants({ limit: 1000 });

      const updatedItems = items.map((item) => {
        const variant = allVariants.data.find((v) => v.sku === item.sku);
        if (variant) {
          return {
            ...item,
            currentStock: variant.stockQuantity,
            variantId: variant.id,
          };
        } else {
          return {
            ...item,
            status: "error" as const,
            errorMessage: "Không tìm thấy SKU",
          };
        }
      });

      setUpdateItems(updatedItems);
    } catch (error) {
      console.error("Error fetching current stocks:", error);
      toast.error("Không thể tải thông tin kho hiện tại");
    }
  };

  const executeUpdate = async () => {
    setUpdating(true);
    setStep("result");

    const validItems = updateItems.filter(
      (item) => item.variantId && item.status !== "error"
    );
    let successCount = 0;
    let errorCount = 0;

    for (const item of validItems) {
      try {
        await adminVariantsApi.updateStock(item.variantId!, {
          stockQuantity: item.newStock,
        });

        item.status = "success";
        successCount++;
      } catch (error) {
        console.error(`Error updating ${item.sku}:`, error);
        item.status = "error";
        item.errorMessage = "Lỗi cập nhật";
        errorCount++;
      }
    }

    setUpdateItems([...updateItems]);
    setUpdating(false);

    if (successCount > 0) {
      toast.success(`Cập nhật thành công ${successCount} sản phẩm`);
      onUpdateComplete();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} sản phẩm cập nhật thất bại`);
    }
  };

  const handleClose = () => {
    setCsvText("");
    setUpdateItems([]);
    setStep("input");
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent = [
      "SKU,Số lượng mới",
      "PROD-001-XL-RED,100",
      "PROD-002-M-BLUE,50",
      "PROD-003-L-BLACK,75",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk-stock-update-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật số lượng hàng loạt</DialogTitle>
          <DialogDescription>
            Upload file CSV hoặc nhập dữ liệu để cập nhật số lượng tồn kho cho
            nhiều sản phẩm cùng lúc
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="csv-file">Upload file CSV</Label>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải template
                </Button>
              </div>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label htmlFor="csv-text">Hoặc nhập dữ liệu trực tiếp</Label>
              <Textarea
                id="csv-text"
                placeholder={`SKU,Số lượng mới
PROD-001-XL-RED,100
PROD-002-M-BLUE,50
PROD-003-L-BLACK,75`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Định dạng: SKU,Số lượng mới (mỗi dòng một sản phẩm)
              </p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-medium">Xem trước cập nhật</h3>
              <Badge variant="outline">{updateItems.length} sản phẩm</Badge>
            </div>

            <div className="rounded-md border max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Số lượng hiện tại</TableHead>
                    <TableHead>Số lượng mới</TableHead>
                    <TableHead>Thay đổi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updateItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.newStock}</TableCell>
                      <TableCell>
                        <span
                          className={
                            item.newStock > item.currentStock
                              ? "text-green-600"
                              : item.newStock < item.currentStock
                              ? "text-red-600"
                              : "text-gray-600"
                          }
                        >
                          {item.newStock > item.currentStock ? "+" : ""}
                          {item.newStock - item.currentStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.status === "error" ? (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            {item.errorMessage}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sẵn sàng
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Kết quả cập nhật</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {updateItems.filter((i) => i.status === "success").length}
                </div>
                <div className="text-sm text-muted-foreground">Thành công</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {updateItems.filter((i) => i.status === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Thất bại</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{updateItems.length}</div>
                <div className="text-sm text-muted-foreground">Tổng cộng</div>
              </div>
            </div>

            {updateItems.filter((i) => i.status === "error").length > 0 && (
              <div className="rounded-md border max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updateItems
                      .filter((i) => i.status === "error")
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {item.errorMessage}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "input" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button onClick={parseCsvData} disabled={!csvText.trim()}>
                <FileText className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("input")}>
                Quay lại
              </Button>
              <Button
                onClick={executeUpdate}
                disabled={updateItems.filter((i) => i.variantId).length === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cập nhật ({updateItems.filter((i) => i.variantId).length} sản
                phẩm)
              </Button>
            </>
          )}

          {step === "result" && <Button onClick={handleClose}>Đóng</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
