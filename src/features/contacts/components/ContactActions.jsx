import React from "react";
import { Send, Download } from "lucide-react";
import ClickToUpgrade from "../../../components/ClickToUpgrade";

const ContactActions = ({
  hasSelectedContacts,
  selectedCount,
  totalCount,
  selectionMode,
  onSendBroadcast,
  onExport,
  onDelete,
  onSelectAllAcrossPages,
  displayedContactsLength,
  isDeleting,
}) => {
  if (!hasSelectedContacts) {
    return null;
  }

  return (
    <th colSpan="8" className="px-2 py-3 sm:px-6">
      <div className="flex justify-end gap-6">
        <div className="flex items-center text-sm text-gray-700">
          {selectionMode === 'all' ? (
            <span>Selected All ({totalCount - Object.keys(selectionMode === 'all' ? {} : {}).length})</span>
          ) : (
            <span>Selected ({selectedCount})</span>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <ClickToUpgrade permission="canScheduleBroadcast">
              <button
                onClick={() => onSendBroadcast(false)}
                className="flex items-center gap-2 bg-[#0AA89E] text-white rounded-md hover:bg-[#089A8B] px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={!hasSelectedContacts}
                title="Send broadcast to selected contacts directly"
              >
                <Send className="w-4 h-4 text-white" />
                Send Broadcast
              </button>
            </ClickToUpgrade>
          </div>
          <ClickToUpgrade permission="canUseAPIs">
            <button
              onClick={onExport}
              disabled={isDeleting || !hasSelectedContacts}
              className="flex items-center gap-2 bg-[#0AA89E] text-white rounded-md hover:bg-[#089A8B] px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer"
              title="Export selected contacts"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </ClickToUpgrade>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </th>
  );
};

export default ContactActions;
