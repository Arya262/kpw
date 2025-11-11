import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Play, Pause, Edit, Trash2, BarChart3, Info } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import { usePermissions } from "../../../hooks/usePermissions";

const CampaignCard = ({ campaign, onRefresh }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-red-100 text-red-700",
  };

  const handleToggleStatus = async () => {
    if (!hasPermission('drip_campaigns', 'activate')) {
      toast.error("You don't have permission to change campaign status");
      return;
    }

    try {
      setLoading(true);
      const newStatus = campaign.status === "active" ? "paused" : "active";
      
      await axios.post(
        `${API_BASE}/drip-campaigns/${campaign.campaign_id}/toggle-status`,
        { status: newStatus, customer_id: user.customer_id },
        { withCredentials: true }
      );

      toast.success(`Campaign ${newStatus === "active" ? "activated" : "paused"} successfully`);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update campaign status");
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!hasPermission('drip_campaigns', 'delete')) {
      toast.error("You don't have permission to delete campaigns");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/drip-campaigns/${campaign.campaign_id}`, {
        params: { customer_id: user.customer_id },
        withCredentials: true,
      });

      toast.success("Campaign deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete campaign");
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleEdit = () => {
    if (!hasPermission('drip_campaigns', 'edit')) {
      toast.error("You don't have permission to edit campaigns");
      return;
    }
    navigate(`/drip-campaigns/edit/${campaign.campaign_id}`);
  };

  const handleViewAnalytics = () => {
    navigate(`/drip-campaigns/analytics/${campaign.campaign_id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {campaign.campaign_name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{formatDate(campaign.created_at)}</p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {hasPermission('drip_campaigns', 'edit') && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {hasPermission('drip_campaigns', 'activate') && campaign.status !== "completed" && (
                  <button
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    {campaign.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleViewAnalytics}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
                {hasPermission('drip_campaigns', 'delete') && (
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[campaign.status] || statusColors.draft
          }`}
        >
          {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
        </span>
        <span className="ml-2 text-xs text-gray-500">
          {campaign.total_steps || 0} steps
        </span>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Enrolled</p>
          <p className="text-lg font-semibold text-gray-900">{campaign.total_enrolled || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-semibold text-gray-900">{campaign.total_completed || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Goal</p>
          <p className="text-lg font-semibold text-gray-900">
            {campaign.goal || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
