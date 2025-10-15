import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BroadcastStats from "./BroadcastStats";
import vendor from "../../assets/Vector.png";
import BroadcastDashboard from "./BroadcastDashboard";
import BroadcastPages from "./BroadcastPages";
import { useAuth } from "../../context/AuthContext";
import { getPermissions } from "../../utils/getPermissions";

const Broadcast = () => {
  const broadcastDashboardRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [highlightCancel, setHighlightCancel] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [pagination, setPagination] = useState(null);

  const location = useLocation();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  useEffect(() => {
    if (location.state?.formData) {
      broadcastDashboardRef.current?.fetchBroadcasts();
      window.history.replaceState({}, document.title);
    }

    if (location.state?.openForm) {
      if (!permissions.canAddBroadcast) {
        toast.error("You do not have permission to add Campaign.");
      } else {
        setShowPopup(true);
      }
      window.history.replaceState({}, document.title);
    }

  }, []);

  // When broadcast is created
  const handleBroadcastCreated = () => {
    broadcastDashboardRef.current?.fetchBroadcasts();
    toast.success("Campaign added successfully!");
    setShowPopup(false);
  };

  // Update broadcasts & pagination
  const handleBroadcastsUpdate = ({ broadcasts: newBroadcasts, pagination: newPagination }) => {
    setBroadcasts(newBroadcasts || []);
    setPagination(newPagination || null);
  };

  // Add Campaign button
  const handleAddBroadcast = () => {
    if (!permissions.canAddBroadcast) {
      toast.error("You do not have permission to add Campaigns.");
      return;
    }
    setShowPopup(true);
  };

  // Highlight cancel when backdrop clicked
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setHighlightCancel(true);
      setTimeout(() => setHighlightCancel(false), 2000);
    }
  };

  return (
    <div className="p-0 bg-white min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Header */}
      <div className="flex items-center justify-between p-2.5">
        <h2 className="text-xl pt-0 font-semibold">Campaigns</h2>
        <button
          className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={handleAddBroadcast}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Campaigns
        </button>
      </div>

      {/* Stats */}
      <BroadcastStats data={broadcasts} totalRecords={pagination?.totalRecords || 0} />

      {/* Dashboard */}
      <BroadcastDashboard
        ref={broadcastDashboardRef}
        onBroadcastsUpdate={handleBroadcastsUpdate}
      />

      {/* Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 transition-all duration-300"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`bg-white w-full max-w-full sm:max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-6xl h-[95vh] sm:h-auto sm:max-h-[95vh] rounded-t-2xl sm:rounded-xl overflow-hidden relative shadow-2xl border ${
              highlightCancel ? "border-red-500" : "border-gray-200"
            } transition-all duration-300 flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sm:rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={vendor} alt="campaign" className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-md xl:text-xl font-semibold text-gray-900 truncate">
                    Create New Campaign
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-xs xl:text-sm text-gray-500 hidden sm:block">
                    Set up and send your WhatsApp broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 ${
                  highlightCancel
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
                }`}
                aria-label="Close modal"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
              <BroadcastPages onClose={() => setShowPopup(false)} onBroadcastCreated={handleBroadcastCreated} />
            </div>
          </div>

          {/* Date Picker Portal */}
          <div id="datepicker-portal"></div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;
