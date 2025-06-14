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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

interface ReportData {
  id: string;
  name: string;
  type: string;
  description: string;
  lastGenerated: string;
  size: string;
  status: string;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface CustomerData {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  segment: string;
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      setReports([
        {
          id: "1",
          name: "Báo cáo doanh thu tháng 1/2024",
          type: "sales",
          description: "Tổng hợp doanh thu và đơn hàng tháng 1",
          lastGenerated: "2024-01-18 10:30",
          size: "2.3 MB",
          status: "completed",
        },
        {
          id: "2",
          name: "Báo cáo sản phẩm bán chạy Q4/2023",
          type: "products",
          description: "Top sản phẩm bán chạy nhất quý 4",
          lastGenerated: "2024-01-15 14:20",
          size: "1.8 MB",
          status: "completed",
        },
        {
          id: "3",
          name: "Báo cáo khách hàng VIP",
          type: "customers",
          description: "Danh sách khách hàng VIP và phân tích hành vi",
          lastGenerated: "2024-01-10 09:15",
          size: "3.1 MB",
          status: "completed",
        },
        {
          id: "4",
          name: "Báo cáo tài chính tháng 12/2023",
          type: "financial",
          description: "Báo cáo tài chính chi tiết tháng 12",
          lastGenerated: "2024-01-05 16:45",
          size: "4.2 MB",
          status: "generating",
        },
      ]);

      setSalesData([
        { date: "01/01", revenue: 15000000, orders: 45, customers: 32 },
        { date: "02/01", revenue: 18000000, orders: 52, customers: 38 },
        { date: "03/01", revenue: 22000000, orders: 61, customers: 45 },
        { date: "04/01", revenue: 19000000, orders: 48, customers: 35 },
        { date: "05/01", revenue: 25000000, orders: 68, customers: 52 },
        { date: "06/01", revenue: 28000000, orders: 74, customers: 58 },
        { date: "07/01", revenue: 32000000, orders: 85, customers: 64 },
      ]);

      setProductData([
        {
          id: "1",
          name: "iPhone 15 Pro Max",
          category: "Điện thoại",
          sold: 156,
          revenue: 624000000,
          views: 8500,
          conversionRate: 1.8,
        },
        {
          id: "2",
          name: "Samsung Galaxy S24",
          category: "Điện thoại",
          sold: 134,
          revenue: 469000000,
          views: 7200,
          conversionRate: 1.9,
        },
        {
          id: "3",
          name: "MacBook Air M3",
          category: "Laptop",
          sold: 89,
          revenue: 267000000,
          views: 4500,
          conversionRate: 2.0,
        },
        {
          id: "4",
          name: "AirPods Pro 2",
          category: "Phụ kiện",
          sold: 245,
          revenue: 147000000,
          views: 12000,
          conversionRate: 2.0,
        },
      ]);

      setCustomerData([
        {
          id: "1",
          name: "Nguyễn Văn A",
          email: "nguyenvana@email.com",
          totalOrders: 15,
          totalSpent: 25000000,
          lastOrder: "2024-01-18",
          segment: "VIP",
        },
        {
          id: "2",
          name: "Trần Thị B",
          email: "tranthib@email.com",
          totalOrders: 8,
          totalSpent: 12000000,
          lastOrder: "2024-01-15",
          segment: "Premium",
        },
        {
          id: "3",
          name: "Lê Văn C",
          email: "levanc@email.com",
          totalOrders: 12,
          totalSpent: 18000000,
          lastOrder: "2024-01-10",
          segment: "VIP",
        },
      ]);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Hoàn thành", variant: "success" as const },
      generating: { label: "Đang tạo", variant: "default" as const },
      failed: { label: "Thất bại", variant: "destructive" as const },
      scheduled: { label: "Đã lên lịch", variant: "secondary" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSegmentBadge = (segment: string) => {
    const segmentConfig = {
      VIP: { label: "VIP", variant: "destructive" as const },
      Premium: { label: "Premium", variant: "default" as const },
      Regular: { label: "Thường", variant: "secondary" as const },
    };
    const config = segmentConfig[segment as keyof typeof segmentConfig] || {
      label: segment,
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportReport = (reportId: string, format: string) => {
    // Mock export functionality
    console.log(`Exporting report ${reportId} in ${format} format`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Đang tải dữ liệu báo cáo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Báo cáo & Thống kê
        </h2>
        <div className="flex items-center space-x-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-60 justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDateRange.from && selectedDateRange.to
                  ? `${format(selectedDateRange.from, "dd/MM/yyyy", {
                      locale: vi,
                    })} - ${format(selectedDateRange.to, "dd/MM/yyyy", {
                      locale: vi,
                    })}`
                  : "Chọn khoảng thời gian"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <Calendar
                  mode="single"
                  selected={selectedDateRange.from}
                  onSelect={(date) =>
                    date &&
                    setSelectedDateRange((prev) => ({ ...prev, from: date }))
                  }
                  locale={vi}
                />
                <Calendar
                  mode="single"
                  selected={selectedDateRange.to}
                  onSelect={(date) =>
                    date &&
                    setSelectedDateRange((prev) => ({ ...prev, to: date }))
                  }
                  locale={vi}
                />
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => setIsGenerateDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Tạo báo cáo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sales">Doanh thu</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo có sẵn</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng doanh thu
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">159,000,000 VNĐ</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng đơn hàng
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">433</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Khách hàng mới
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">324</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2.1%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sản phẩm bán
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15.3%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu 7 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Số đơn hàng theo ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chi tiết doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Số đơn hàng</TableHead>
                    <TableHead>Khách hàng mới</TableHead>
                    <TableHead>Doanh thu trung bình/đơn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{day.date}/2024</TableCell>
                      <TableCell>{formatCurrency(day.revenue)}</TableCell>
                      <TableCell>{day.orders}</TableCell>
                      <TableCell>{day.customers}</TableCell>
                      <TableCell>
                        {formatCurrency(day.revenue / day.orders)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top sản phẩm bán chạy</CardTitle>
              <CardDescription>
                Danh sách sản phẩm có doanh số cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Đã bán</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Lượt xem</TableHead>
                    <TableHead>Tỷ lệ chuyển đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.sold}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>{product.views.toLocaleString()}</TableCell>
                      <TableCell>{product.conversionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng VIP</CardTitle>
              <CardDescription>
                Danh sách khách hàng có giá trị cao nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khách hàng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tổng đơn hàng</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead>Đơn hàng cuối</TableHead>
                    <TableHead>Phân khúc</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>{customer.lastOrder}</TableCell>
                      <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo có sẵn</CardTitle>
              <CardDescription>
                Danh sách các báo cáo đã được tạo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên báo cáo</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.description}
                      </TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport(report.id, "pdf")}
                            disabled={report.status !== "completed"}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo báo cáo mới</DialogTitle>
            <DialogDescription>
              Chọn loại báo cáo và khoảng thời gian để tạo báo cáo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-type">Loại báo cáo</Label>
              <Select
                value={selectedReportType}
                onValueChange={setSelectedReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Báo cáo doanh thu</SelectItem>
                  <SelectItem value="products">Báo cáo sản phẩm</SelectItem>
                  <SelectItem value="customers">Báo cáo khách hàng</SelectItem>
                  <SelectItem value="financial">Báo cáo tài chính</SelectItem>
                  <SelectItem value="inventory">Báo cáo tồn kho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Định dạng xuất</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pdf" defaultChecked />
                  <Label htmlFor="pdf">PDF</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="excel" />
                  <Label htmlFor="excel">Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="csv" />
                  <Label htmlFor="csv">CSV</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={() => setIsGenerateDialogOpen(false)}>
              Tạo báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
