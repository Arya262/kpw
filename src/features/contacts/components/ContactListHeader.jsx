import React from "react";
import vendor from "../../../assets/Vector.png";
import { getPermissions } from "../../../utils/getPermissions";
import TagFilter from "../../tags/components/TagFilter";
import Tooltip from "../../../components/Tooltip";

const ContactListHeader = ({
  user,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  filterButtons,
  filterCounts,
  onAddContact,
  onOpenFilterDialog,
  onSyncContacts,
  isSyncing,
  permissions,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold">Contacts</h2>
        </div>
        {permissions.canSeeFilters && (
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={`px-3 sm:px-4 py-2 min-h-[38px] rounded-md text-sm font-medium transition cursor-pointer ${
                  filter === btn
                    ? "bg-[#0AA89E] text-white"
                    : "text-gray-700 hover:text-[#0AA89E]"
                }`}
              >
                {btn} ({filterCounts[btn]})
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {permissions.canSeeFilters && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or number..."
              aria-label="Search"
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
        )}
        {onSyncContacts && (
          <Tooltip text="Sync from Foodchow POS" position="bottom">
            <button
              type="button"
              onClick={onSyncContacts}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-[#0AA89E] hover:to-cyan-500 hover:text-white hover:border-transparent transition-all cursor-pointer text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sync contacts from Foodchow POS"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
            </button>
          </Tooltip>
        )}
        {permissions.canSeeFilters && onOpenFilterDialog && (
          <Tooltip text="Advanced Filters" position="bottom">
            <button
              onClick={onOpenFilterDialog}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-gray-700 font-medium"
              aria-label="Open advanced filters"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="hidden sm:inline">Filters</span>
            </button>
          </Tooltip>
        )}
        <Tooltip text="Add a new contact" position="bottom">
          <button
            className="bg-gradient-to-r from-[#0AA89E] to-cyan-500 text-white flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={onAddContact}
          >
            <img src={vendor} alt="plus sign" className="w-5 h-5" />
            Add Contact
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ContactListHeader;
