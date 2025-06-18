"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { updateProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const updatedUser = await updateProfile(editForm);

      // Update the user context with the new data
      updateUser(updatedUser);

      setMessage("Cập nhật thông tin thành công!");
      setIsEditing(false);

      // Update the form with the latest data from the server
      setEditForm({
        fullName: updatedUser.fullName || "",
        phoneNumber: updatedUser.phoneNumber || "",
      });
    } catch (error: any) {
      setMessage(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Quản lý thông tin tài khoản và cài đặt cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        Họ và tên
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {user.fullName}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {user.email}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4" />
                        Số điện thoại
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {user.phoneNumber}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        Vai trò
                      </Label>{" "}
                      <div className="p-3 bg-gray-50 rounded-md">
                        {user.role?.toUpperCase() === "ADMIN"
                          ? "Quản trị viên"
                          : "Khách hàng"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Ngày tạo tài khoản
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Cập nhật lần cuối
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        {formatDate(user.updatedAt)}
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setIsEditing(true)}>
                    Chỉnh sửa thông tin
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={editForm.fullName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <Input
                        id="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
              <CardDescription>
                Quản lý mật khẩu và cài đặt bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full md:w-auto">
                  Đổi mật khẩu
                </Button>
                <div className="text-sm text-gray-600">
                  Tài khoản của bạn được bảo vệ bằng mật khẩu mạnh. Hãy đổi mật
                  khẩu thường xuyên để bảo vệ tài khoản.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>{" "}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>
                Xem chi tiết tất cả đơn hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Để xem chi tiết lịch sử đơn hàng, vui lòng truy cập trang đơn
                  hàng chuyên dụng.
                </p>
                <Button asChild>
                  <Link href="/orders">Xem tất cả đơn hàng</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
