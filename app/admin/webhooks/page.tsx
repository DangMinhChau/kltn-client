"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
  Bell,
  Settings,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  adminApi,
  type WebhookDashboardOverview,
  type WebhookEvent,
} from "@/lib/api/admin";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function WebhookDashboardPage() {
  const [overview, setOverview] = useState<WebhookDashboardOverview | null>(
    null
  );
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24");
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, eventsData] = await Promise.all([
        adminApi.webhooks.getOverview(Number(timeRange)),
        adminApi.webhooks.getEvents({ limit: 50 }),
      ]);

      setOverview(overviewData.data);
      setEvents(eventsData.data || []);
    } catch (error) {
      console.error("Failed to load webhook dashboard data:", error);
      toast.error("Failed to load webhook data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const handleTestAlert = async (type: "error" | "warning" | "critical") => {
    try {
      await adminApi.webhooks.testAlert({
        type,
        title: `Test ${type} Alert`,
        message: "This is a test alert from the webhook dashboard.",
      });
      toast.success("Test alert sent successfully!");
    } catch (error) {
      toast.error("Failed to send test alert");
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      const data = await adminApi.webhooks.exportData(format, "7d");

      if (format === "csv") {
        const blob = new Blob([data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `webhook-data-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `webhook-data-${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleCleanup = async () => {
    try {
      await adminApi.webhooks.triggerCleanup({ retentionDays: 30 });
      toast.success("Cleanup triggered successfully");
      await handleRefresh();
    } catch (error) {
      toast.error("Failed to trigger cleanup");
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Mock data for charts when no real data is available
  const mockPerformanceData = [
    { time: "00:00", requests: 45, errors: 1, avgTime: 120 },
    { time: "04:00", requests: 23, errors: 0, avgTime: 95 },
    { time: "08:00", requests: 89, errors: 3, avgTime: 145 },
    { time: "12:00", requests: 134, errors: 2, avgTime: 110 },
    { time: "16:00", requests: 112, errors: 1, avgTime: 98 },
    { time: "20:00", requests: 67, errors: 0, avgTime: 87 },
  ];

  const mockStatusData = [
    { name: "Success", value: 94, color: "#00C49F" },
    { name: "Failed", value: 4, color: "#FF8042" },
    { name: "Timeout", value: 2, color: "#FFBB28" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Webhook Monitoring
          </h1>
          <p className="text-muted-foreground">
            Monitor VNPay webhook performance and system health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Clock className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 hours</SelectItem>
              <SelectItem value="12">Last 12 hours</SelectItem>
              <SelectItem value="24">Last 24 hours</SelectItem>
              <SelectItem value="72">Last 3 days</SelectItem>
              <SelectItem value="168">Last week</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Alert */}
      {overview?.status && overview.status !== "healthy" && (
        <Alert
          variant={overview.status === "critical" ? "destructive" : "default"}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System status: {overview.status}.
            {overview.issues.length > 0 &&
              ` Issues: ${overview.issues.join(", ")}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(overview?.status || "unknown")}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(overview?.status || "unknown")}>
                {overview?.status || "Unknown"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {overview?.uptime || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.metrics.totalRequests?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {overview?.trends.requestsChange !== undefined && (
                <>
                  {overview.trends.requestsChange > 0 ? (
                    <span className="text-green-600">
                      +{overview.trends.requestsChange}%
                    </span>
                  ) : (
                    <span className="text-red-600">
                      {overview.trends.requestsChange}%
                    </span>
                  )}
                  <span>vs previous period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.metrics.errorRate?.toFixed(2) || "0.00"}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {overview?.trends.errorRateChange !== undefined && (
                <>
                  {overview.trends.errorRateChange > 0 ? (
                    <span className="text-red-600">
                      +{overview.trends.errorRateChange}%
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {overview.trends.errorRateChange}%
                    </span>
                  )}
                  <span>vs previous period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(overview?.metrics.averageProcessingTime || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {overview?.trends.performanceChange !== undefined && (
                <>
                  {overview.trends.performanceChange > 0 ? (
                    <span className="text-red-600">
                      +{overview.trends.performanceChange}%
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {overview.trends.performanceChange}%
                    </span>
                  )}
                  <span>vs previous period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="requests"
                      stroke="#0088FE"
                      strokeWidth={2}
                      name="Requests"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#00C49F"
                      strokeWidth={2}
                      name="Avg Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Response Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(events.length > 0 ? events : overview?.recentEvents || [])
                  .slice(0, 10)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {event.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            Order {event.orderId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={event.success ? "default" : "destructive"}
                        >
                          {event.responseCode}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(event.processingTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                {events.length === 0 && !overview?.recentEvents?.length && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent webhook events found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Webhook Events Log</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Order ID</th>
                      <th className="text-left p-2">Response Code</th>
                      <th className="text-left p-2">Processing Time</th>
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b">
                        <td className="p-2">
                          {event.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </td>
                        <td className="p-2 font-mono text-sm">
                          {event.orderId}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={event.success ? "default" : "destructive"}
                          >
                            {event.responseCode}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {formatDuration(event.processingTime)}
                        </td>
                        <td className="p-2 text-sm">
                          {formatDateTime(event.timestamp)}
                        </td>
                        <td className="p-2 text-sm text-red-600">
                          {event.error || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No webhook events found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="1"
                      stroke="#FF8042"
                      fill="#FF8042"
                      fillOpacity={0.3}
                      name="Errors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="avgTime"
                      fill="#00C49F"
                      name="Avg Response Time (ms)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Alerts</span>
                    <Badge
                      variant={
                        overview?.alertsConfigured ? "default" : "outline"
                      }
                    >
                      {overview?.alertsConfigured ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate Threshold</span>
                    <span className="text-sm font-mono">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time Threshold</span>
                    <span className="text-sm font-mono">3000ms</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestAlert("warning")}
                  >
                    Test Warning
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestAlert("error")}
                  >
                    Test Error
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestAlert("critical")}
                  >
                    Test Critical
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Cleanup</span>
                    <span className="text-sm text-muted-foreground">
                      2 days ago
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Retention</span>
                    <span className="text-sm font-mono">30 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm">245 MB</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={handleCleanup}>
                    Trigger Cleanup
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adminApi.webhooks.resetMetrics()}
                  >
                    Reset Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
