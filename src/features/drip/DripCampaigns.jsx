import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import DripCampaignList from "./DripCampaignList";
import DripCampaignStats from "./DripCampaignStats";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

const DripCampaigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const campaignListRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (location.state?.refresh) {
      campaignListRef.current?.fetchCampaigns();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCampaignsUpdate = ({ campaigns: newCampaigns, pagination: newPagination }) => {
    setCampaigns(newCampaigns || []);
    setPagination(newPagination || null);
  };

  const handleCreateCampaign = () => {
    if (!hasPermission('drip_campaigns', 'create')) {
      toast.error("You do not have permission to create drip campaigns.");
      return;
    }
    navigate('/drip-campaigns/create');
  };

  return (
    <div className="p-0 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5">
        <div>
          <h2 className="text-xl pt-0 font-semibold">Drip Campaigns</h2>
          <p className="text-sm text-gray-500 mt-1">
            Automate your WhatsApp messaging with scheduled sequences
          </p>
        </div>
        {hasPermission('drip_campaigns', 'create') && (
          <button
            className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={handleCreateCampaign}
          >
            <Plus className="w-5 h-5" />
            Create New Sequence
          </button>
        )}
      </div>

      {/* Stats */}
      <DripCampaignStats data={campaigns} totalRecords={pagination?.totalRecords || 0} />

      {/* Campaign List */}
      <DripCampaignList
        ref={campaignListRef}
        onCampaignsUpdate={handleCampaignsUpdate}
      />
    </div>
  );
};

export default DripCampaigns;
