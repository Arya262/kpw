import vendor from "../../assets/Vector.png";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreVertical,
  Loader2,
  Search,
  Edit2,
  Trash2,
  Pause,
  Play,
  Copy,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { useDrip } from "../../hooks/useDrip";
import Tooltip from "../../components/Tooltip";

// Loading Skeleton Component
const SequenceCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
          <div className="h-4 bg-gray-200 rounded w-8" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
          <div className="h-4 bg-gray-200 rounded w-8" />
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-3 mt-3 border-t border-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-6" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AutoCampaign = () => {
  const navigate = useNavigate();
  const [searchSeq, setSearchSeq] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const dropdownRef = useRef(null);
  const sortMenuRef = useRef(null);

  const {
    data: { drips: sequences, loading: isLoading },
    actions: { deleteDrip },
  } = useDrip();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateNew = () => {
    navigate("/autocampaign/new");
  };

  // Filter by status
  const statusFilteredSequences = sequences.filter((seq) => {
    if (statusFilter === "all") return true;
    return seq.status === statusFilter;
  });

  // Filter by search
  const searchFilteredSequences = statusFilteredSequences.filter(
    (seq) =>
      seq.name?.toLowerCase().includes(searchSeq.toLowerCase()) ||
      seq.description?.toLowerCase().includes(searchSeq.toLowerCase())
  );

  // Sort sequences
  const sortedSequences = [...searchFilteredSequences].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "date":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      default:
        return 0;
    }
  });

  const filteredSequences = sortedSequences;

  // Get counts for filter tabs
  const statusCounts = {
    all: sequences.length,
    active: sequences.filter((s) => s.status === "active").length,
    paused: sequences.filter((s) => s.status === "paused").length,
    draft: sequences.filter((s) => s.status === "draft").length,
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      paused: { color: "bg-yellow-100 text-yellow-800", label: "Paused" },
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDropdownToggle = (id, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDelete = async (id) => {
    const result = await deleteDrip(id);
    if (result.success) {
      setDeleteConfirm(null);
    }
    setActiveDropdown(null);
  };

  const handleEdit = (sequenceId) => {
    navigate(`/autocampaign/edit?id=${sequenceId}`);
    setActiveDropdown(null);
  };

  const handleDuplicate = () => {
    toast.info("Duplicate feature coming soon!");
    setActiveDropdown(null);
  };

  const handleToggleStatus = (sequence) => {
    toast.info(`${sequence.status === "active" ? "Pause" : "Resume"} feature coming soon!`);
    setActiveDropdown(null);
  };

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "draft", label: "Draft" },
  ];

  const sortOptions = [
    { key: "name", label: "Name" },
    { key: "date", label: "Date Created" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="flex-1 pt-2.5 overflow-x-hidden">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <h2 className="text-lg sm:text-xl font-bold">Sequences</h2>
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 sm:px-4 py-2 min-h-[38px] rounded-md text-sm font-medium transition cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#0AA89E] text-white"
                    : "text-gray-700 hover:text-[#0AA89E]"
                }`}
              >
                {tab.label} ({statusCounts[tab.key]})
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortMenuRef}>
            <Tooltip text="Sort sequences" position="bottom">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-gray-700 font-medium"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </Tooltip>
            {showSortMenu && (
              <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      sortBy === opt.key ? "text-teal-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchSeq}
              onChange={(e) => setSearchSeq(e.target.value)}
              placeholder="Search sequences..."
              className="pl-3 pr-10 py-2 border border-gray-300 text-sm rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Create Button */}
          <Tooltip text="Create a new sequence" position="bottom">
            <button
              className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={handleCreateNew}
            >
              <img src={vendor} alt="plus sign" className="w-5 h-5" />
              Add Sequence
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Loading Skeletons */}
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <SequenceCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Create New Sequence Card */}
        {!isLoading && sequences.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-dashed border-teal-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-teal-50 hover:border-teal-400 transition-all group min-h-[280px]"
            onClick={handleCreateNew}
          >
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
              <Plus className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Sequence</h3>
            <p className="text-gray-500 text-sm">Build an automated message sequence</p>
          </motion.div>
        )}
        
        {/* Sequence Cards */}
        {!isLoading &&
          filteredSequences.map((sequence) => (
              <motion.div
                key={sequence.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group cursor-pointer relative h-full"
                onClick={() => handleEdit(sequence.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 ${sequence.color || "bg-teal-500"} rounded-full flex-shrink-0`} />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                          {sequence.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {sequence.description || "No description"}
                        </p>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={activeDropdown === sequence.id ? dropdownRef : null}>
                      <button
                        onClick={(e) => handleDropdownToggle(sequence.id, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {activeDropdown === sequence.id && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(sequence.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={handleDuplicate}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleToggleStatus(sequence)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {sequence.status === "active" ? (
                              <>
                                <Pause className="w-4 h-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Resume
                              </>
                            )}
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => setDeleteConfirm(sequence.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Steps</p>
                      <p className="text-sm font-semibold text-gray-900">{sequence.stepCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contacts</p>
                      <p className="text-sm font-semibold text-gray-900">{sequence.contactCount}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {getStatusBadge(sequence.status)}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-3 mt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Enrolled</p>
                      <p className="text-sm font-semibold text-gray-900">{sequence.enrolled || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-sm font-semibold text-gray-900">{sequence.completed || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Goal</p>
                      <p className="text-sm font-semibold text-gray-900">{sequence.goal || 0}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
          ))}
      </div>

      {/* Empty State - No sequences at all */}
      {!isLoading && sequences.length === 0 && !searchSeq && statusFilter === "all" && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-12 h-12 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sequences yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first automated message sequence to engage with your contacts automatically.
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Create Your First Sequence
          </button>
        </div>
      )}

      {/* Empty State - No results from filter/search */}
      {!isLoading && filteredSequences.length === 0 && (searchSeq || statusFilter !== "all") && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sequences found</h3>
          <p className="text-gray-500">
            {searchSeq
              ? `No sequences match your search for "${searchSeq}"`
              : `No ${statusFilter} sequences found`}
          </p>
          <button
            onClick={() => {
              setSearchSeq("");
              setStatusFilter("all");
            }}
            className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Sequence?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This action cannot be undone. All enrolled contacts will be removed from this sequence.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoCampaign;
