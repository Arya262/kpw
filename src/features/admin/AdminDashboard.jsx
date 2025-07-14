import React, { useState, useEffect } from "react";
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  Download,
  Settings,
  Shield,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Globe,
  Zap,
  UserPlus,
  MessageCircle,
  HelpCircle,
  FileText,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalMessages: 0,
    messagesToday: 0,
    totalRevenue: 0,
    revenueToday: 0,
    activeBroadcasts: 0,
    pendingTemplates: 0,
    systemHealth: 'healthy',
    activeSessions: 0,
    serverLoad: '45%',
    totalContacts: 0,
    activeChats: 0,
    totalTemplates: 0,
    helpTickets: 0,
    systemSettings: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await axios.get(API_ENDPOINTS.ADMIN_SYSTEM.STATS, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setStats(response.data.stats);
          return;
        }
      } catch (error) {
        console.log("Backend stats endpoint not available, using mock data");
      }

      // Fallback to mock data if backend endpoint doesn't exist
      const mockStats = {
        totalUsers: 1247,
        newUsersToday: 23,
        totalMessages: 45678,
        messagesToday: 1234,
        totalRevenue: 125000,
        revenueToday: 4500,
        activeBroadcasts: 12,
        pendingTemplates: 5,
        systemHealth: 'healthy',
        activeSessions: 89,
        serverLoad: '45%',
        totalContacts: 3456,
        activeChats: 234,
        totalTemplates: 89,
        helpTickets: 12,
        systemSettings: 3
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
      
      // Set default mock data on error
      setStats({
        totalUsers: 1247,
        newUsersToday: 23,
        totalMessages: 45678,
        messagesToday: 1234,
        totalRevenue: 125000,
        revenueToday: 4500,
        activeBroadcasts: 12,
        pendingTemplates: 5,
        systemHealth: 'healthy',
        activeSessions: 89,
        serverLoad: '45%',
        totalContacts: 3456,
        activeChats: 234,
        totalTemplates: 89,
        helpTickets: 12,
        systemSettings: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
      subtitle: `${stats.newUsersToday} new today`
    },
    {
      title: "Messages Sent",
      value: stats.totalMessages.toLocaleString(),
      icon: <MessageSquare className="w-6 h-6" />,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
      subtitle: `${stats.messagesToday} today`
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive",
      subtitle: `₹${stats.revenueToday.toLocaleString()} today`
    },
    {
      title: "Active Broadcasts",
      value: stats.activeBroadcasts,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-orange-500",
      change: "+5%",
      changeType: "positive",
      subtitle: "23 running"
    },
    {
      title: "Total Contacts",
      value: stats.totalContacts.toLocaleString(),
      icon: <UserPlus className="w-6 h-6" />,
      color: "bg-indigo-500",
      change: "+18%",
      changeType: "positive",
      subtitle: "1,234 imported today"
    },
    {
      title: "Active Chats",
      value: stats.activeChats,
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-teal-500",
      change: "+22%",
      changeType: "positive",
      subtitle: "45 new conversations"
    },
    {
      title: "Templates",
      value: stats.totalTemplates,
      icon: <FileText className="w-6 h-6" />,
      color: "bg-pink-500",
      change: "+3%",
      changeType: "positive",
      subtitle: `${stats.pendingTemplates} pending approval`
    },
    {
      title: "Help Tickets",
      value: stats.helpTickets,
      icon: <HelpCircle className="w-6 h-6" />,
      color: "bg-red-500",
      change: "-5%",
      changeType: "negative",
      subtitle: "8 resolved today"
    }
  ];

  const quickActions = [
    {
      title: "Review Templates",
      description: `${stats.pendingTemplates} templates pending approval`,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-800",
      action: () => console.log("Review templates")
    },
    {
      title: "System Health",
      description: `Status: ${stats.systemHealth}`,
      icon: stats.systemHealth === "healthy" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />,
      color: stats.systemHealth === "healthy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      action: () => console.log("System health")
    },
    {
      title: "Active Sessions",
      description: `${stats.activeSessions} users online`,
      icon: <Eye className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800",
      action: () => console.log("Active sessions")
    },
    {
      title: "Server Load",
      description: `Current: ${stats.serverLoad}`,
      icon: <Zap className="w-5 h-5" />,
      color: "bg-green-100 text-green-800",
      action: () => console.log("Server load")
    }
  ];

  // WhatsApp Platform Specific Actions
  const platformActions = [
    {
      title: "WhatsApp Connections",
      description: "Monitor active WhatsApp numbers",
      icon: <Phone className="w-5 h-5" />,
      color: "bg-green-100 text-green-800",
      action: () => console.log("WhatsApp connections")
    },
    {
      title: "Credit Management",
      description: "Manage user credits and payments",
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-800",
      action: () => console.log("Credit management")
    },
    {
      title: "Broadcast Queue",
      description: "Review scheduled broadcasts",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-800",
      action: () => console.log("Broadcast queue")
    },
    {
      title: "Support Tickets",
      description: "Handle user support requests",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800",
      action: () => console.log("Support tickets")
    }
  ];

  // Feature Management Actions
  const featureActions = [
    {
      title: "Contact Management",
      description: `${stats.totalContacts} total contacts`,
      icon: <UserPlus className="w-5 h-5" />,
      color: "bg-indigo-100 text-indigo-800",
      action: () => console.log("Contact management")
    },
    {
      title: "Chat Management",
      description: `${stats.activeChats} active conversations`,
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-teal-100 text-teal-800",
      action: () => console.log("Chat management")
    },
    {
      title: "Template Management",
      description: `${stats.totalTemplates} total templates`,
      icon: <FileText className="w-5 h-5" />,
      color: "bg-pink-100 text-pink-800",
      action: () => console.log("Template management")
    },
    {
      title: "Help Center",
      description: `${stats.helpTickets} open tickets`,
      icon: <HelpCircle className="w-5 h-5" />,
      color: "bg-red-100 text-red-800",
      action: () => console.log("Help center")
    },
    {
      title: "System Settings",
      description: `${stats.systemSettings} pending updates`,
      icon: <Settings className="w-5 h-5" />,
      color: "bg-gray-100 text-gray-800",
      action: () => console.log("System settings")
    },
    {
      title: "Dashboard Analytics",
      description: "View detailed reports",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-800",
      action: () => console.log("Dashboard analytics")
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and key metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
              <button
                onClick={action.action}
                className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* System Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">System Status</span>
                </div>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Server Load</span>
                </div>
                <span className="text-sm font-medium text-blue-600">{stats.serverLoad}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Uptime</span>
                </div>
                <span className="text-sm font-medium text-purple-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">Active Sessions</span>
                </div>
                <span className="text-sm font-medium text-orange-600">{stats.activeSessions}</span>
              </div>
            </div>
                  </div>
      </div>

      {/* WhatsApp Platform Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Platform Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformActions.map((action, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureActions.map((action, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New user registered: john@example.com</span>
                <span className="text-xs text-gray-400">2 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Broadcast completed: "Summer Sale"</span>
                <span className="text-xs text-gray-400">5 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Template pending approval: "Welcome Message"</span>
                <span className="text-xs text-gray-400">10 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Payment received: ₹5000 from user@example.com</span>
                <span className="text-xs text-gray-400">15 minutes ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System backup completed successfully</span>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="text-sm font-medium text-green-600">+{stats.newUsersToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages Sent</span>
                <span className="text-sm font-medium text-blue-600">{stats.messagesToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-purple-600">₹{stats.revenueToday.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Broadcasts</span>
                <span className="text-sm font-medium text-orange-600">{stats.activeBroadcasts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Contacts</span>
                <span className="text-sm font-medium text-indigo-600">+1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Chats</span>
                <span className="text-sm font-medium text-teal-600">{stats.activeChats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Templates Created</span>
                <span className="text-sm font-medium text-pink-600">+3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Templates to Review</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingTemplates}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Support Tickets</span>
                </div>
                <span className="text-sm font-medium text-blue-600">{stats.helpTickets}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">System Updates</span>
                </div>
                <span className="text-sm font-medium text-purple-600">{stats.systemSettings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600">Security Alerts</span>
                </div>
                <span className="text-sm font-medium text-red-600">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-600">Contact Imports</span>
                </div>
                <span className="text-sm font-medium text-indigo-600">15</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-600">Chat Moderation</span>
                </div>
                <span className="text-sm font-medium text-teal-600">8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Manage Users</span>
                </div>
                <span className="text-xs text-blue-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-700">Manage Contacts</span>
                </div>
                <span className="text-xs text-indigo-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-gray-700">Manage Chats</span>
                </div>
                <span className="text-xs text-teal-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-pink-600" />
                  <span className="text-sm text-gray-700">Manage Templates</span>
                </div>
                <span className="text-xs text-pink-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Help Center</span>
                </div>
                <span className="text-xs text-red-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Export Reports</span>
                </div>
                <span className="text-xs text-green-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">System Settings</span>
                </div>
                <span className="text-xs text-purple-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">View Analytics</span>
                </div>
                <span className="text-xs text-orange-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;