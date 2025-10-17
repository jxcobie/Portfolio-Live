'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  MessageSquare,
  Activity,
  Calendar,
  ArrowUpRight,
  Clock,
  Users,
  Eye,
} from 'lucide-react';

interface Project {
  id: number;
  attributes: {
    title: string;
    status: string;
    createdAt: string;
  };
}

interface Message {
  id: number;
  attributes: {
    name: string;
    email: string;
    subject: string;
    createdAt: string;
  };
}

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: 'up' | 'down';
  icon: any;
  color: string;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
        <p className="mb-2 text-3xl font-bold text-gray-900">{value}</p>
        <div
          className={`flex items-center text-sm ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {changeType === 'up' ? (
            <TrendingUp className="mr-1 h-4 w-4" />
          ) : (
            <TrendingDown className="mr-1 h-4 w-4" />
          )}
          {change}
        </div>
      </div>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const ActivityItem = ({
  title,
  subtitle,
  time,
  type,
}: {
  title: string;
  subtitle: string;
  time: string;
  type: 'project' | 'message';
}) => (
  <div className="flex items-center space-x-4 rounded-xl p-4 transition-colors hover:bg-gray-50">
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        type === 'project' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
      }`}
    >
      {type === 'project' ? (
        <FileText className="h-5 w-5" />
      ) : (
        <MessageSquare className="h-5 w-5" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-gray-900">{title}</p>
      <p className="truncate text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="flex items-center text-xs text-gray-400">
      <Clock className="mr-1 h-3 w-3" />
      {time}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, messagesRes] = await Promise.all([
          fetch('http://localhost:1337/api/projects'),
          fetch('http://localhost:1337/api/messages'),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.data || []);
        }

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const recentActivity = [
    ...projects.slice(0, 3).map((project) => ({
      title: project.attributes.title,
      subtitle: `Status: ${project.attributes.status}`,
      time: getTimeAgo(project.attributes.createdAt),
      type: 'project' as const,
    })),
    ...messages.slice(0, 2).map((message) => ({
      title: message.attributes.subject,
      subtitle: `From: ${message.attributes.name}`,
      time: getTimeAgo(message.attributes.createdAt),
      type: 'message' as const,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 p-8 text-white">
        <h1 className="mb-2 text-3xl font-bold">Welcome back, Admin!</h1>
        <p className="mb-6 text-indigo-100">Here's what's happening with your content today.</p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-indigo-100">Active Projects</span>
              <FileText className="h-5 w-5 text-indigo-200" />
            </div>
            <span className="text-2xl font-bold">{projects.length}</span>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-indigo-100">New Messages</span>
              <MessageSquare className="h-5 w-5 text-indigo-200" />
            </div>
            <span className="text-2xl font-bold">{messages.length}</span>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-indigo-100">This Month</span>
              <Calendar className="h-5 w-5 text-indigo-200" />
            </div>
            <span className="text-2xl font-bold">+28%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          change="+12.5% from last month"
          changeType="up"
          icon={FileText}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Messages"
          value={messages.length}
          change="+8.2% from last month"
          changeType="up"
          icon={MessageSquare}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Page Views"
          value="12.4K"
          change="+4.1% from last month"
          changeType="up"
          icon={Eye}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Active Users"
          value="1,247"
          change="-2.3% from last month"
          changeType="down"
          icon={Users}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500">Latest updates and changes</p>
              </div>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => <ActivityItem key={index} {...activity} />)
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Activity className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
          </div>
          <div className="space-y-4 p-6">
            <a
              href="/admin/projects/new"
              className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 transition-colors group-hover:bg-indigo-200">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Project</p>
                  <p className="text-sm text-gray-500">Add a portfolio item</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
            </a>

            <a
              href="/admin/messages"
              className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 transition-colors group-hover:bg-green-200">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check Messages</p>
                  <p className="text-sm text-gray-500">Review inquiries</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
            </a>

            <a
              href="/admin/analytics"
              className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-purple-300 hover:bg-purple-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 transition-colors group-hover:bg-purple-200">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-500">Performance insights</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
