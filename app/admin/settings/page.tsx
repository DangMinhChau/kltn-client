"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Globe,
  CreditCard,
  Bell,
  Users,
  Key,
  Mail,
  Shield,
  Database,
  Upload,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
}

interface PaymentSettings {
  vnpayEnabled: boolean;
  vnpayTmnCode: string;
  vnpayHashSecret: string;
  vnpaySandbox: boolean;
  momoEnabled: boolean;
  momoPartnerCode: string;
  momoAccessKey: string;
  momoSecretKey: string;
  codEnabled: boolean;
  codFee: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  promotionNotifications: boolean;
  stockAlertNotifications: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isActive: boolean;
  lastLogin: string;
  permissions: string[];
}

export default function SettingsManagement() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "TechStore VN",
    siteDescription: "Cửa hàng công nghệ hàng đầu Việt Nam",
    siteUrl: "https://techstore.vn",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    contactEmail: "contact@techstore.vn",
    contactPhone: "1900-1234",
    address: "123 Nguyễn Văn Cừ, Quận 1, TP.HCM",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    vnpayEnabled: true,
    vnpayTmnCode: "XXXXXXXX",
    vnpayHashSecret: "********************************",
    vnpaySandbox: false,
    momoEnabled: true,
    momoPartnerCode: "XXXXXXXX",
    momoAccessKey: "********************************",
    momoSecretKey: "********************************",
    codEnabled: true,
    codFee: 25000,
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      promotionNotifications: true,
      stockAlertNotifications: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "noreply@techstore.vn",
      smtpPassword: "************************",
      smtpSecure: true,
    });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: "1",
      name: "Admin Chính",
      email: "admin@techstore.vn",
      role: "Super Admin",
      avatar: "/avatar1.png",
      isActive: true,
      lastLogin: "2024-01-18 10:30",
      permissions: ["all"],
    },
    {
      id: "2",
      name: "Nguyễn Văn A",
      email: "nvana@techstore.vn",
      role: "Admin",
      avatar: "/avatar2.png",
      isActive: true,
      lastLogin: "2024-01-17 14:20",
      permissions: ["products", "orders", "users"],
    },
    {
      id: "3",
      name: "Trần Thị B",
      email: "ttb@techstore.vn",
      role: "Editor",
      avatar: "/avatar3.png",
      isActive: false,
      lastLogin: "2024-01-15 09:15",
      permissions: ["products", "reviews"],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const handleSaveSiteSettings = async () => {
    setIsLoading(true);
    try {
      // API call to save site settings
      console.log("Saving site settings:", siteSettings);
      // Show success message
    } catch (error) {
      console.error("Error saving site settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setIsLoading(true);
    try {
      // API call to save payment settings
      console.log("Saving payment settings:", paymentSettings);
      // Show success message
    } catch (error) {
      console.error("Error saving payment settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // API call to save notification settings
      console.log("Saving notification settings:", notificationSettings);
      // Show success message
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      "Super Admin": { variant: "destructive" as const },
      Admin: { variant: "default" as const },
      Editor: { variant: "secondary" as const },
      Viewer: { variant: "outline" as const },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || {
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{role}</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Tổng quan</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="users">Quản trị viên</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="backup">Sao lưu</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Thông tin website
              </CardTitle>
              <CardDescription>
                Cấu hình thông tin cơ bản của website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Tên website</Label>
                  <Input
                    id="site-name"
                    value={siteSettings.siteName}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="site-url">URL website</Label>
                  <Input
                    id="site-url"
                    value={siteSettings.siteUrl}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        siteUrl: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site-description">Mô tả website</Label>
                <Textarea
                  id="site-description"
                  rows={3}
                  value={siteSettings.siteDescription}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      siteDescription: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Email liên hệ</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Số điện thoại</Label>
                  <Input
                    id="contact-phone"
                    value={siteSettings.contactPhone}
                    onChange={(e) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={siteSettings.address}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Chế độ bảo trì</div>
                    <div className="text-sm text-gray-500">
                      Tạm thời đóng website để bảo trì
                    </div>
                  </div>
                  <Switch
                    checked={siteSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        maintenanceMode: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cho phép đăng ký</div>
                    <div className="text-sm text-gray-500">
                      Người dùng có thể tự đăng ký tài khoản
                    </div>
                  </div>
                  <Switch
                    checked={siteSettings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        allowRegistration: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Xác thực email</div>
                    <div className="text-sm text-gray-500">
                      Yêu cầu xác thực email khi đăng ký
                    </div>
                  </div>
                  <Switch
                    checked={siteSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSiteSettings((prev) => ({
                        ...prev,
                        requireEmailVerification: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSiteSettings} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cài đặt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  VNPay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Kích hoạt VNPay</span>
                  <Switch
                    checked={paymentSettings.vnpayEnabled}
                    onCheckedChange={(checked) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        vnpayEnabled: checked,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vnpay-tmn">TMN Code</Label>
                  <Input
                    id="vnpay-tmn"
                    value={paymentSettings.vnpayTmnCode}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        vnpayTmnCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vnpay-hash">Hash Secret</Label>
                  <div className="flex">
                    <Input
                      id="vnpay-hash"
                      type={showPasswords.vnpayHash ? "text" : "password"}
                      value={paymentSettings.vnpayHashSecret}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          vnpayHashSecret: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => togglePasswordVisibility("vnpayHash")}
                    >
                      {showPasswords.vnpayHash ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chế độ Sandbox</span>
                  <Switch
                    checked={paymentSettings.vnpaySandbox}
                    onCheckedChange={(checked) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        vnpaySandbox: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  MoMo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Kích hoạt MoMo</span>
                  <Switch
                    checked={paymentSettings.momoEnabled}
                    onCheckedChange={(checked) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        momoEnabled: checked,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="momo-partner">Partner Code</Label>
                  <Input
                    id="momo-partner"
                    value={paymentSettings.momoPartnerCode}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        momoPartnerCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="momo-access">Access Key</Label>
                  <div className="flex">
                    <Input
                      id="momo-access"
                      type={showPasswords.momoAccess ? "text" : "password"}
                      value={paymentSettings.momoAccessKey}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          momoAccessKey: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => togglePasswordVisibility("momoAccess")}
                    >
                      {showPasswords.momoAccess ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="momo-secret">Secret Key</Label>
                  <div className="flex">
                    <Input
                      id="momo-secret"
                      type={showPasswords.momoSecret ? "text" : "password"}
                      value={paymentSettings.momoSecretKey}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          momoSecretKey: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => togglePasswordVisibility("momoSecret")}
                    >
                      {showPasswords.momoSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  COD (Thanh toán khi nhận hàng)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Kích hoạt COD</span>
                  <Switch
                    checked={paymentSettings.codEnabled}
                    onCheckedChange={(checked) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        codEnabled: checked,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="cod-fee">Phí COD</Label>
                  <Input
                    id="cod-fee"
                    type="number"
                    value={paymentSettings.codFee}
                    onChange={(e) =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        codFee: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePaymentSettings} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt thanh toán
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Cài đặt thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email thông báo</div>
                    <div className="text-sm text-gray-500">
                      Gửi thông báo qua email
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS thông báo</div>
                    <div className="text-sm text-gray-500">
                      Gửi thông báo qua SMS
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        smsNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Thông báo đơn hàng</div>
                    <div className="text-sm text-gray-500">
                      Thông báo khi có đơn hàng mới
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.orderNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        orderNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Thông báo khuyến mãi</div>
                    <div className="text-sm text-gray-500">
                      Thông báo về chương trình khuyến mãi
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.promotionNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        promotionNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cảnh báo tồn kho</div>
                    <div className="text-sm text-gray-500">
                      Thông báo khi sản phẩm sắp hết hàng
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.stockAlertNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        stockAlertNotifications: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Cấu hình SMTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={notificationSettings.smtpHost}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        smtpHost: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={notificationSettings.smtpPort}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        smtpPort: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-user">SMTP User</Label>
                  <Input
                    id="smtp-user"
                    value={notificationSettings.smtpUser}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        smtpUser: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <div className="flex">
                    <Input
                      id="smtp-password"
                      type={showPasswords.smtpPassword ? "text" : "password"}
                      value={notificationSettings.smtpPassword}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          smtpPassword: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => togglePasswordVisibility("smtpPassword")}
                    >
                      {showPasswords.smtpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>SMTP Secure (SSL/TLS)</span>
                  <Switch
                    checked={notificationSettings.smtpSecure}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        smtpSecure: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotificationSettings}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt thông báo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Quản trị viên</h3>
            <Button onClick={() => setIsUserDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm quản trị viên
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "secondary"}>
                        {user.isActive ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Bảo mật
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Xác thực 2 yếu tố</div>
                    <div className="text-sm text-gray-500">
                      Bật xác thực 2FA cho admin
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Giới hạn đăng nhập</div>
                    <div className="text-sm text-gray-500">
                      Khóa tài khoản sau 5 lần đăng nhập sai
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Session timeout</div>
                    <div className="text-sm text-gray-500">
                      Tự động đăng xuất sau 30 phút không hoạt động
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">API Key chính</span>
                    <Button variant="outline" size="sm">
                      Tạo mới
                    </Button>
                  </div>
                  <Input type="password" value="sk-1234567890abcdef" readOnly />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Webhook Secret</span>
                    <Button variant="outline" size="sm">
                      Tạo mới
                    </Button>
                  </div>
                  <Input
                    type="password"
                    value="whsec_abcdef1234567890"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sao lưu dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Tự động sao lưu</div>
                    <div className="text-sm text-gray-500">
                      Sao lưu dữ liệu hàng ngày
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="backup-time">Thời gian sao lưu</Label>
                  <Select defaultValue="02:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:00">00:00</SelectItem>
                      <SelectItem value="02:00">02:00</SelectItem>
                      <SelectItem value="04:00">04:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backup-retention">Lưu trữ (ngày)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Tạo sao lưu ngay
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Khôi phục dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="restore-file">Chọn file sao lưu</Label>
                  <Input type="file" accept=".sql,.zip" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Sao lưu gần đây:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">backup_2024-01-18.sql</span>
                      <Button variant="outline" size="sm">
                        Khôi phục
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">backup_2024-01-17.sql</span>
                      <Button variant="outline" size="sm">
                        Khôi phục
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
