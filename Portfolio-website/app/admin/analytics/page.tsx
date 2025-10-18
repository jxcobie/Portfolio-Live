'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Mail,
  Calendar,
  Users,
  Globe,
} from 'lucide-react';

// Mock analytics data
const pageViewsData = [
  { month: 'Jan', views: 1200, visitors: 800 },
  { month: 'Feb', views: 1500, visitors: 1000 },
  { month: 'Mar', views: 1800, visitors: 1200 },
  { month: 'Apr', views: 2100, visitors: 1400 },
  { month: 'May', views: 2400, visitors: 1600 },
  { month: 'Jun', views: 2800, visitors: 1900 },
];

const projectStatusData = [
  { name: 'Deployed', value: 2, color: '#22c55e' },
  { name: 'Active', value: 1, color: '#3b82f6' },
  { name: 'In Dev', value: 1, color: '#eab308' },
];

const deviceData = [
  { device: 'Desktop', percentage: 65, color: '#8b5cf6' },
  { device: 'Mobile', percentage: 30, color: '#06b6d4' },
  { device: 'Tablet', percentage: 5, color: '#f59e0b' },
];

const trafficSources = [
  { source: 'Direct', visits: 450, percentage: 35 },
  { source: 'Google Search', visits: 380, percentage: 30 },
  { source: 'LinkedIn', visits: 260, percentage: 20 },
  { source: 'GitHub', visits: 130, percentage: 10 },
  { source: 'Other', visits: 65, percentage: 5 },
];

interface Project {
  id: number;
  attributes: {
    title: string;
    status: string;
    technologies: {
      data: { attributes: { name: string } }[];
    };
  };
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch('http://localhost:1337/api/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data || []);
        }

        // Fetch messages
        const messagesResponse = await fetch('http://localhost:1337/api/messages');
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const getTechnologyStats = () => {
    const techCount: Record<string, number> = {};
    projects.forEach((project) => {
      project.attributes.technologies.data.forEach((tech) => {
        const name = tech.attributes.name;
        techCount[name] = (techCount[name] || 0) + 1;
      });
    });

    return Object.entries(techCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const technologyStats = getTechnologyStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600">Performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,849</div>
            <div className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              -2.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m 34s</div>
            <div className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +5.7% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Page Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Page Views Over Time</CardTitle>
            <CardDescription>Monthly page views and unique visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pageViewsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Page Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Unique Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technology Usage & Traffic Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Used Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Usage</CardTitle>
            <CardDescription>Most frequently used technologies in projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technologyStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-sm" />
                  <YAxis type="category" dataKey="name" className="text-sm" width={100} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{source.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">{source.visits}</div>
                      <div className="text-muted-foreground text-sm">{source.percentage}%</div>
                    </div>
                    <div className="bg-muted h-2 w-20 rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Visitor device preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{device.device}</p>
                  <p className="text-2xl font-bold">{device.percentage}%</p>
                </div>
                <div className="relative h-16 w-16">
                  <div
                    className="border-muted h-full w-full rounded-full border-4"
                    style={{
                      background: `conic-gradient(${device.color} 0% ${device.percentage}%, hsl(var(--muted)) ${device.percentage}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium">{device.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
