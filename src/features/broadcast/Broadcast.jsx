import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import BroadcastStats from "./BroadcastStats";
import vendor from "../../assets/Vector.png";
import BroadcastDashboard from "./BroadcastDashboard";
import BroadcastPages from "./BroadcastPages";
import { useAuth } from "../../context/AuthContext";
import { ROLE_PERMISSIONS } from "../../context/permissions";

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
  // Map backend role values to ROLE_PERMISSIONS keys
  const roleMap = {
    main: "Owner",
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    user: "User",
    viewer: "Viewer",
  };
  const role = roleMap[user?.role?.toLowerCase?.()] || "Viewer";
  const permissions = ROLE_PERMISSIONS[role];

  // Helper for delete permission (for 'User' role, only own broadcasts)
  const canDeleteBroadcast = (broadcast) => {
    if (!permissions.canDelete) return false;
    if (role === "User") {
      return broadcast.created_by === user?.id;
    }
    return true;
  };

  useEffect(() => {
    if (location.state?.formData) {

      if (broadcastDashboardRef.current) {
        broadcastDashboardRef.current.fetchBroadcasts();
      }
      window.history.replaceState({}, document.title);
    }
    

    if (location.state?.openForm) {
      if (!permissions.canAddBroadcast) {
        toast.error("You do not have permission to add broadcasts.");
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
      if (broadcastDashboardRef.current) {
        broadcastDashboardRef.current.handleDelete(deleteIndex);
      }
    }
    setShowConfirmModal(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDeleteIndex(null);
  };

  const handleBroadcastCreated = () => {
    if (broadcastDashboardRef.current) {
      broadcastDashboardRef.current.fetchBroadcasts();
    }
  };

  const handleBroadcastsUpdate = (newBroadcasts) => {
    setBroadcasts(newBroadcasts);
  };

  const handleAddBroadcast = () => {
    if (!permissions.canAddBroadcast) {
      toast.error("You do not have permission to add broadcasts.");
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
        <h2 className="text-xl pt-0 font-semibold">Broadcast WhatsApp Campaigns</h2>
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2 px-4 py-2 rounded"
          onClick={handleAddBroadcast}
        >
          <img src={vendor} alt="plus sign" className="w-5 h-5" />
          Add Broadcast
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

      {/* Add Broadcast Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 transition-all duration-300"
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
                highlightCancel
                  ? "bg-red-500 text-white hover:text-white"
                  : "bg-gray-100"
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

      {/* Delete Confirmation Modal */}
      {showConfirmModal && permissions.canDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this broadcast?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                disabled={deleteIndex !== null && !canDeleteBroadcast(broadcasts[deleteIndex])}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;
