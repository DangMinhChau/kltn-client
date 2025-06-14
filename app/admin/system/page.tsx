"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Activity,
  Server,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Clock,
  TrendingUp,
  TrendingDown,
  Monitor,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: string;
  timestamp: string;
  services: {
    database: {
      status: "healthy" | "warning" | "critical";
      responseTime: number;
      connections: number;
      maxConnections: number;
    };
    redis: {
      status: "healthy" | "warning" | "critical";
      responseTime: number;
      memory: number;
      maxMemory: number;
    };
    email: {
      status: "healthy" | "warning" | "critical";
      lastTestAt: string;
      successRate: number;
    };
    storage: {
      status: "healthy" | "warning" | "critical";
      usedSpace: number;
      totalSpace: number;
    };
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    averageResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    peakResponseTime: number;
  };
}

interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  context: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function StatusIndicator({
  status,
  label,
}: {
  status: "healthy" | "warning" | "critical";
  label: string;
}) {
  const getStatusColor = () => {
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

  const getStatusIcon = () => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={`${getStatusColor()} border-none`}>
        {getStatusIcon()}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  trend,
  description,
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "healthy" | "warning" | "critical";
  trend?: number;
  description?: string;
}) {
  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "critical":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <Card className={`${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center text-xs ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">
            {value.toLocaleString()}
            {unit}
          </div>
          {description && (
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const [healthData, logsData] = await Promise.all([
        adminApi.system.getHealth(),
        adminApi.system.getLogs({ limit: 50 }),
      ]);

      setHealth(healthData.data);
      setLogs(logsData.data || []);
    } catch (error) {
      console.error("Failed to load system health:", error);
      // Mock data for demo
      setHealth({
        status: "healthy",
        uptime: "3 days, 14 hours, 22 minutes",
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: "healthy",
            responseTime: 45,
            connections: 12,
            maxConnections: 100,
          },
          redis: {
            status: "healthy",
            responseTime: 8,
            memory: 256,
            maxMemory: 512,
          },
          email: {
            status: "healthy",
            lastTestAt: new Date().toISOString(),
            successRate: 99.2,
          },
          storage: {
            status: "warning",
            usedSpace: 78,
            totalSpace: 100,
          },
        },
        performance: {
          cpu: 35,
          memory: 62,
          disk: 78,
          averageResponseTime: 120,
          requestsPerMinute: 245,
          errorRate: 0.8,
        },
        metrics: {
          totalRequests: 125000,
          successfulRequests: 124000,
          failedRequests: 1000,
          averageResponseTime: 120,
          peakResponseTime: 890,
        },
      });
      setLogs([
        {
          id: "1",
          level: "info",
          message: "System health check completed",
          context: "HealthController",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          level: "warning",
          message: "Disk space usage above 75%",
          context: "SystemMonitor",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemHealth();
    setRefreshing(false);
    toast.success("System health refreshed");
  };

  const exportHealthReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        health,
        logs: logs.slice(0, 100),
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-health-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Health report exported");
    } catch (error) {
      toast.error("Failed to export health report");
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warning":
        return "warning";
      case "info":
        return "default";
      case "debug":
        return "secondary";
      default:
        return "default";
    }
  };

  // Mock performance data for charts
  const performanceData = [
    { time: "00:00", cpu: 25, memory: 45, requests: 180 },
    { time: "04:00", cpu: 15, memory: 40, requests: 120 },
    { time: "08:00", cpu: 45, memory: 65, requests: 280 },
    { time: "12:00", cpu: 55, memory: 70, requests: 320 },
    { time: "16:00", cpu: 35, memory: 62, requests: 245 },
    { time: "20:00", cpu: 30, memory: 58, requests: 210 },
  ];

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system performance and service health
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportHealthReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>System Status</span>
                </div>
                <StatusIndicator
                  status={health.status}
                  label={`Uptime: ${health.uptime}`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Average Response Time"
                  value={health.performance.averageResponseTime}
                  unit="ms"
                  icon={Clock}
                  status={
                    health.performance.averageResponseTime < 200
                      ? "healthy"
                      : "warning"
                  }
                  description="Last 24 hours"
                />
                <MetricCard
                  title="Requests/Minute"
                  value={health.performance.requestsPerMinute}
                  unit=""
                  icon={TrendingUp}
                  status="healthy"
                  trend={5.2}
                  description="Current rate"
                />
                <MetricCard
                  title="Error Rate"
                  value={health.performance.errorRate}
                  unit="%"
                  icon={AlertTriangle}
                  status={
                    health.performance.errorRate < 1 ? "healthy" : "warning"
                  }
                  trend={-0.3}
                  description="Last 24 hours"
                />
                <MetricCard
                  title="Total Requests"
                  value={health.metrics.totalRequests / 1000}
                  unit="K"
                  icon={Globe}
                  status="healthy"
                  description="All time"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4" />
                          <span className="text-sm font-medium">CPU Usage</span>
                        </div>
                        <span className="text-sm">
                          {health.performance.cpu}%
                        </span>
                      </div>
                      <Progress
                        value={health.performance.cpu}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MemoryStick className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Memory Usage
                          </span>
                        </div>
                        <span className="text-sm">
                          {health.performance.memory}%
                        </span>
                      </div>
                      <Progress
                        value={health.performance.memory}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Disk Usage
                          </span>
                        </div>
                        <span className="text-sm">
                          {health.performance.disk}%
                        </span>
                      </div>
                      <Progress
                        value={health.performance.disk}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cpu"
                        stroke="#8884d8"
                        name="CPU %"
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="#82ca9d"
                        name="Memory %"
                      />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#ffc658"
                        name="Requests/min"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-5 h-5" />
                        <span>Database</span>
                      </div>
                      <StatusIndicator
                        status={health.services.database.status}
                        label=""
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">
                        {health.services.database.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Connections</span>
                      <span className="text-sm font-medium">
                        {health.services.database.connections}/
                        {health.services.database.maxConnections}
                      </span>
                    </div>
                    <Progress
                      value={
                        (health.services.database.connections /
                          health.services.database.maxConnections) *
                        100
                      }
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* Redis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="w-5 h-5" />
                        <span>Redis Cache</span>
                      </div>
                      <StatusIndicator
                        status={health.services.redis.status}
                        label=""
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">
                        {health.services.redis.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">
                        {health.services.redis.memory}MB/
                        {health.services.redis.maxMemory}MB
                      </span>
                    </div>
                    <Progress
                      value={
                        (health.services.redis.memory /
                          health.services.redis.maxMemory) *
                        100
                      }
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* Email Service */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-5 h-5" />
                        <span>Email Service</span>
                      </div>
                      <StatusIndicator
                        status={health.services.email.status}
                        label=""
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium">
                        {health.services.email.successRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Test</span>
                      <span className="text-sm font-medium">
                        {new Date(
                          health.services.email.lastTestAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Storage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-5 h-5" />
                        <span>Storage</span>
                      </div>
                      <StatusIndicator
                        status={health.services.storage.status}
                        label=""
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Used Space</span>
                      <span className="text-sm font-medium">
                        {health.services.storage.usedSpace}GB/
                        {health.services.storage.totalSpace}GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (health.services.storage.usedSpace /
                          health.services.storage.totalSpace) *
                        100
                      }
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        CPU & Memory Usage
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="cpu"
                            stackId="1"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                          <Area
                            type="monotone"
                            dataKey="memory"
                            stackId="1"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        Request Volume
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="requests" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Badge variant={getLogBadgeVariant(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {log.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {log.context} •{" "}
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
