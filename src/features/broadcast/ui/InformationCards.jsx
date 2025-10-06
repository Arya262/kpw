import React from "react";

const InformationCards = ({ formData, wabaInfo, totalSelectedContacts = 0 }) => {
  // Get the message limit based on the user's tier
  const getMessageLimit = () => {
    if (!wabaInfo?.messagingLimit) return 250; // Default to 250 if no tier info
    
    const tierLimits = {
      'TIER_1K': 1000,
      'TIER_10K': 10000,
      'TIER_100K': 100000,
      // Add more tiers as needed
    };
    
    return tierLimits[wabaInfo.messagingLimit] || 250; // Default to 250 if tier not found
  };

  const messageLimit = getMessageLimit();
  const tierName = wabaInfo?.messagingLimit ? wabaInfo.messagingLimit.replace('TIER_', '') : '0';
  return (
  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
      {/* Template Messaging Tier */}
      <div>
        <p className="text-sm font-medium text-gray-500">Template Messaging Tier</p>
        <p className="text-base font-semibold text-gray-900">
          Tier {tierName} <span className="text-gray-500 text-sm">({messageLimit.toLocaleString()}/24 Hours)</span>
        </p>
      </div>

      {/* Remaining Quota */}
      <div>
        <p className="text-sm font-medium text-gray-500">Remaining Quota</p>
        <p className="text-base font-semibold text-gray-900">{messageLimit.toLocaleString()}</p>
      </div>

      {/* Selected Audience */}
      <div>
        <p className="text-sm font-medium text-gray-500">Selected Audience</p>
        <p className="text-base font-semibold text-gray-900">
          {totalSelectedContacts.toLocaleString()}
        </p>
      </div>
      
      {/* Final Audience */}
      <div>
        <p className="text-sm font-medium text-gray-500">Final Audience</p>
        <p className="text-base font-semibold text-gray-900">
          {totalSelectedContacts.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
  );
}

export default InformationCards;