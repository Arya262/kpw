import React from "react";

const CostInformation = ({ estimatedCost, availableWCC, totalContacts = 0 }) => (
  <div className="sticky bottom-20 bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
      {/* Estimated Campaign Cost (left) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Estimated Campaign Cost</p>
      </div>

      {/* Cards (right) */}
      <div className="flex gap-4">
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm min-w-[150px]">
          <p className="text-sm font-medium text-gray-500 mb-1">Estimated Cost</p>
          <p className="text-lg font-semibold text-gray-800">₹{estimatedCost.toFixed(2)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm min-w-[150px]">
          <p className="text-sm font-medium text-gray-500 mb-1">Available WCC</p>
          <p className="text-lg font-semibold text-gray-800">₹{availableWCC.toFixed(2)}</p>
        </div>
      </div>
    </div>
    {totalContacts > 250 && (
      <p className="text-amber-600 text-xs font-medium">
        Warning: Audience size exceeds 250 contacts. Please reduce the number of contacts.
      </p>
    )}
  </div>
);

export default CostInformation;