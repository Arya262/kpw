import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import CampaignCard from "./components/CampaignCard";
import EmptyState from "./components/EmptyState";
import Pagination from "../shared/Pagination";
import axios from "axios";
import { API_BASE } from "../../config/api";

const DripCampaignList = forwardRef(({ onCampaignsUpdate }, ref) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchCampaigns = async (page = 1, limit = 10, searchQuery = "") => {
    if (!user?.customer_id) return;

    try {
      setLoading(true);
      setError(null);

      // TEMPORARY: Check localStorage first for frontend-only campaigns
      const tempCampaigns = JSON.parse(localStorage.getItem('temp_drip_campaigns') || '[]');
      
      if (tempCampaigns.length > 0) {
        // Use localStorage campaigns for preview
        console.log("📦 Loading campaigns from localStorage (frontend only)");
        setCampaigns(tempCampaigns);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: tempCampaigns.length,
          itemsPerPage: tempCampaigns.length,
        });
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/drip-campaigns`, {
        params: {
          customer_id: user.customer_id,
          page,
          limit,
          ...(searchQuery ? { search: searchQuery } : {}),
        },
        withCredentials: true,
      });

      const campaignsData = response.data.data || [];
      setCampaigns(campaignsData);

      const paginationData = response.data.pagination || {};
      setPagination({
        currentPage: paginationData.page || page,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalRecords || 0,
        itemsPerPage: paginationData.limit || limit,
      });

      if (onCampaignsUpdate) {
        onCampaignsUpdate({
          campaigns: campaignsData,
          pagination: paginationData,
        });
      }
    } catch (err) {
      console.error("Error fetching drip campaigns:", err);
      setError(err.response?.data?.message || "Failed to fetch campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchCampaigns,
  }));

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCampaigns(pagination.currentPage, pagination.itemsPerPage, search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [pagination.currentPage, pagination.itemsPerPage, search, user?.customer_id]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      itemsPerPage: newItemsPerPage,
    }));
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeFilter === "All") return true;
    return campaign.status === activeFilter.toLowerCase();
  });

  const filters = [
    { label: "All", count: campaigns.length },
    { label: "Draft", count: campaigns.filter((c) => c.status === "draft").length },
    { label: "Active", count: campaigns.filter((c) => c.status === "active").length },
    { label: "Paused", count: campaigns.filter((c) => c.status === "paused").length },
    { label: "Completed", count: campaigns.filter((c) => c.status === "completed").length },
  ];

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AA89E]"></div>
      </div>
    );
  }

  if (campaigns.length === 0 && !loading) {
    return (
      <EmptyState
        onCreateClick={() => navigate("/drip-campaigns/create")}
        hasPermission={hasPermission('drip_campaigns', 'create')}
      />
    );
  }

  return (
    <div className="w-full bg-white rounded-xl mt-4 shadow-sm">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-200">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.label
                  ? "bg-[#0AA89E] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0AA89E] focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 m-4 rounded-md">
          {error}
        </div>
      )}

      {/* Campaign Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.campaign_id}
            campaign={campaign}
            onRefresh={fetchCampaigns}
          />
        ))}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalItems > 0 && (
        <div className="border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
});

export default DripCampaignList;
