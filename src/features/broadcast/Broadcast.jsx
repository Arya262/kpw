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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const location = useLocation();
  const { user } = useAuth();
  const permissions = getPermissions(user);

  const canDeleteBroadcast = (broadcast) => {
    if (!permissions.canDelete) return false;
    if (user?.role?.toLowerCase?.() === "user") {
      return broadcast.created_by === user?.id;
    }
    return true;
  };

  useEffect(() => {
    if (location.state?.formData) {
      broadcastDashboardRef.current?.fetchBroadcasts();
      window.history.replaceState({}, document.title);
    }

    if (location.state?.openForm) {
      if (!permissions.canAddBroadcast) {
        toast.error("You do not have permission to add Campaign.");
        window.history.replaceState({}, document.title);
        return;
      }
      setShowPopup(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    const newSelected = {};
    if (checked) {
      broadcasts.forEach((_, idx) => {
        newSelected[idx] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleCheckboxChange = (idx, event) => {
    setSelectedRows((prev) => ({
      ...prev,
      [idx]: event.target.checked,
    }));
  };

  useEffect(() => {
    const total = broadcasts.length;
    const selected = Object.values(selectedRows).filter(Boolean).length;
    setSelectAll(selected === total && total > 0);
  }, [selectedRows, broadcasts.length]);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      broadcastDashboardRef.current?.handleDelete(deleteIndex);
    }
    setShowConfirmModal(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDeleteIndex(null);
  };

  const handleBroadcastCreated = () => {
    broadcastDashboardRef.current?.fetchBroadcasts();
    toast.success("Campaign added successfully!");
    setShowPopup(false);
  };

  const handleBroadcastsUpdate = (newBroadcasts) => {
    setBroadcasts(newBroadcasts);
  };

  const handleAddBroadcast = () => {
    if (!permissions.canAddBroadcast) {
      toast.error("You do not have permission to add Campaigns.");
      return;
    }
    setShowPopup(true);
  };

  return (
    <div className="p-0 bg-white min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl pt-0 font-semibold">Campaigns</h2>
        <button
          className="bg-[#0AA89E] hover:bg-teal-600 text-white flex items-center gap-2 px-4 py-2 rounded"
          onClick={handleAddBroadcast}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Campaigns
        </button>
      </div>

      <BroadcastStats data={broadcasts} />

      <BroadcastDashboard
        ref={broadcastDashboardRef}
        onBroadcastsUpdate={handleBroadcastsUpdate}
        selectAll={selectAll}
        handleSelectAllChange={handleSelectAllChange}
        selectedRows={selectedRows}
        handleCheckboxChange={handleCheckboxChange}
      />

      {showPopup && (
        <div
          className="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setHighlightCancel(true);
              setTimeout(() => setHighlightCancel(false), 2000);
            }
          }}
        >
          <div
            className={`bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative sm:animate-slideUp border ${
              highlightCancel ? "border-teal-500" : "border-gray-300"
            } transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopup(false)}
              className={`absolute top-2 right-4 text-gray-600 hover:text-black text-3xl font-bold w-8 h-8 flex items-center justify-center pb-2 rounded-full transition-colors cursor-pointer ${
                highlightCancel ? "bg-red-500 text-white hover:text-white" : "bg-gray-100"
              }`}
              aria-label="Close"
            >
              ×
            </button>
            <BroadcastPages
              onClose={() => setShowPopup(false)}
              onBroadcastCreated={handleBroadcastCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;
