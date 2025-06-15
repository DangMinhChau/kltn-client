import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Download,
  Edit,
  Package,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

interface ProductsBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkStatusUpdate?: (isActive: boolean) => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export function ProductsBulkActions({
  selectedCount,
  onBulkDelete,
  onBulkExport,
  onBulkStatusUpdate,
  onClearSelection,
  loading = false,
}: ProductsBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Đã chọn {selectedCount} sản phẩm</p>
              <p className="text-xs text-muted-foreground">
                Chọn thao tác để áp dụng cho tất cả sản phẩm đã chọn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
              disabled={loading}
              className="h-8"
            >
              <Download className="mr-2 h-3 w-3" />
              Xuất Excel
            </Button>

            {/* Status Update Actions */}
            {onBulkStatusUpdate && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkStatusUpdate(true)}
                  disabled={loading}
                  className="h-8"
                >
                  <CheckCircle className="mr-2 h-3 w-3" />
                  Kích hoạt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkStatusUpdate(false)}
                  disabled={loading}
                  className="h-8"
                >
                  <XCircle className="mr-2 h-3 w-3" />
                  Vô hiệu hóa
                </Button>
              </>
            )}

            {/* More Actions */}
            <Select>
              <SelectTrigger className="h-8 w-[120px]">
                <MoreHorizontal className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Thêm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duplicate">
                  <Package className="mr-2 h-3 w-3" />
                  Nhân bản
                </SelectItem>
                <SelectItem value="category">
                  <Edit className="mr-2 h-3 w-3" />
                  Đổi danh mục
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Delete Action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                  className="h-8"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Xóa ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa hàng loạt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa {selectedCount} sản phẩm đã chọn?
                    <br />
                    <strong className="text-red-600">
                      Hành động này không thể hoàn tác và sẽ xóa tất cả
                      variants, hình ảnh và dữ liệu liên quan.
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onBulkDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa {selectedCount} sản phẩm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={loading}
              className="h-8 text-muted-foreground"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
