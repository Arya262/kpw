import { Plus, Zap } from "lucide-react";

const EmptyState = ({ onCreateClick, hasPermission }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Zap className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Drip Campaigns Yet
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Create your first automated WhatsApp sequence to engage your contacts over time with scheduled messages.
      </p>
      {hasPermission && (
        <button
          onClick={onCreateClick}
          className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Your First Sequence
        </button>
      )}
    </div>
  );
};

export default EmptyState;
