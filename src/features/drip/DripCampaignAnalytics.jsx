import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const DripCampaignAnalytics = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchCampaignAnalytics();
  }, [campaignId]);

  const fetchCampaignAnalytics = async () => {
    try {
      setLoading(true);

      const [campaignRes, analyticsRes, enrollmentsRes] = await Promise.all([
        axios.get(`${API_BASE}/drip-campaigns/${campaignId}`, {
          params: { customer_id: user.customer_id },
          withCredentials: true,
        }),
        axios.get(`${API_BASE}/drip-campaigns/${campaignId}/analytics`, {
          params: { customer_id: user.customer_id },
          withCredentials: true,
        }),
        axios.get(`${API_BASE}/drip-campaigns/${campaignId}/enrollments`, {
          params: { customer_id: user.customer_id, limit: 10 },
          withCredentials: true,
        }),
      ]);

      setCampaign(campaignRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setEnrollments(enrollmentsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA89E]"></div>
      </div>
    );
  }

  if (!campaign || !analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Enrolled",
      value: analytics.total_enrolled || 0,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active",
      value: analytics.active || 0,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Completed",
      value: analytics.completed || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Failed",
      value: analytics.failed || 0,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
  ];

  const completionRate =
    analytics.total_enrolled > 0
      ? ((analytics.completed / analytics.total_enrolled) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/drip-campaigns")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Campaigns
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.campaign_name}</h1>
          <p className="text-gray-600 mt-1">Campaign Analytics & Performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#0AA89E]" />
            <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-[#0AA89E] h-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Step Performance */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Performance</h3>
          <div className="space-y-3">
            {analytics.step_stats?.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Step {index + 1}: {step.step_name || "Unnamed"}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {step.sent || 0} sent
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="font-semibold text-gray-900">{step.delivered || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Read</p>
                    <p className="font-semibold text-gray-900">{step.read || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="font-semibold text-red-600">{step.failed || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Enrollments
          </h3>
          {enrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No enrollments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Current Step
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Enrolled At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.enrollment_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {enrollment.contact_name || enrollment.mobile_no}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            enrollment.status === "active"
                              ? "bg-green-100 text-green-700"
                              : enrollment.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {enrollment.current_step + 1} / {campaign.steps?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DripCampaignAnalytics;
