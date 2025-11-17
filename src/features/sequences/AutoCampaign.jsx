import SearchInput from "../shared/SearchInput";
import vendor from "../../assets/Vector.png";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import SeqModal from "./SeqModal";
import { Plus, Play, Users, Calendar, MoreVertical } from "lucide-react";

const AutoCampaign = () => {
  const [isSeqModalOpen, setIsSeqModalOpen] = useState(false);
  const [searchSeq, setSearchSeq] = useState("");

  const sequences = [
    {
      id: 1,
      name: "Welcome Drip",
      description: "Welcome new customers",
      stepCount: 3,
      contactCount: 245,
      status: "active",
      lastEdited: "2 days ago",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Reminder Drip",
      description: "Follow up with inactive users",
      stepCount: 5,
      contactCount: 189,
      status: "active",
      lastEdited: "1 week ago",
      color: "bg-green-500",
    },
  ];

  const filteredSequences = sequences.filter(
    (seq) =>
      seq.name.toLowerCase().includes(searchSeq.toLowerCase()) ||
      seq.description.toLowerCase().includes(searchSeq.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      paused: { color: "bg-yellow-100 text-yellow-800", label: "Paused" },
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Sequences
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage automated message sequences
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <SearchInput
                  placeholder="Search Sequences..."
                  value={searchSeq}
                  onChange={(e) => setSearchSeq(e.target.value)}
                />
              </div>

              <button
                className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl  transition-all"
                onClick={() => setIsSeqModalOpen(true)}
              >
                <img src={vendor} alt="plus sign" className="w-5 h-5" />
                Create New Sequence
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sequences Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Sequences ({filteredSequences.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {/* Create New Sequence Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-teal-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-teal-50 hover:border-teal-400 transition-all group"
              onClick={() => setIsSeqModalOpen(true)}
            >
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                <Plus className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create New Sequence
              </h3>
              <p className="text-gray-500 text-sm">
                Build an automated message sequence
              </p>
            </motion.div>

            {/* Sequence Cards */}
            {filteredSequences.map((sequence) => (
              <motion.div
                key={sequence.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 ${sequence.color} rounded-full`}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {sequence.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {sequence.description}
                        </p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Steps</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {sequence.stepCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Contacts</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {sequence.contactCount}
                      </p>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {getStatusBadge(sequence.status)}
                    {/* <span className="text-xs text-gray-500">
                      {sequence.lastEdited}
                    </span> */}
                  </div>{" "}
                  <div className="grid grid-cols-3 gap-4 pt-2 mt-3 border-t border-t-gray-400">
                    <div>
                      <p className="text-xs text-gray-500">Enrolled</p>
                      <p className="text-sm font-semibold text-gray-900">0</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-sm font-semibold text-gray-900">0</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Goal</p>
                      <p className="text-sm font-semibold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSequences.length === 0 && searchSeq && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchInput className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sequences found
              </h3>
              <p className="text-gray-500">
                No sequences match your search for"{searchSeq}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isSeqModalOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsSeqModalOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-4xl">
                <SeqModal
                  isOpen={isSeqModalOpen}
                  onClose={() => setIsSeqModalOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoCampaign;
