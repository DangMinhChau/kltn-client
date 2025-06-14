"use client";

import { useWishlist } from "@/lib/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ProductCard from "@/components/common/ProductCard";
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

export default function WishlistPage() {
  const { state, clearWishlist } = useWishlist();

  const wishlistItems = state.items.map((item) => item.product);

  const handleClearWishlist = () => {
    clearWishlist();
    toast.success("Đã xóa toàn bộ danh sách yêu thích");
  };

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Danh sách yêu thích</h1>

          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách yêu thích trống
              </h2>
              <p className="text-gray-600 max-w-md">
                Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá
                và thêm những sản phẩm bạn thích!
              </p>
              <Button asChild className="mt-4">
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Danh sách yêu thích</h1>
            <p className="text-gray-600">
              {wishlistItems?.length || 0} sản phẩm
            </p>
          </div>{" "}
          {wishlistItems && wishlistItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-4 sm:mt-0 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Xóa toàn bộ danh sách yêu thích?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Thao tác này sẽ xóa tất cả {wishlistItems.length} sản phẩm
                    khỏi danh sách yêu thích của bạn và không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearWishlist}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa tất cả
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>{" "}
        {/* Wishlist Grid với ProductCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems?.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              showQuickView={true}
              className="h-full"
            />
          ))}
        </div>
        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
