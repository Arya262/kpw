import React from "react";
import { getMessageLimit, getTierDisplayName } from "../utils/messageLimits";

const InformationCards = ({ 
  formData, 
  wabaInfo, 
  totalSelectedContacts = 0, 
  remainingQuota = 0, 
  quotaUsage = 0,
  timeUntilReset = null,
  uniqueContactsCount = 0
}) => {
  const messageLimit = getMessageLimit(wabaInfo);
  const tierName = getTierDisplayName(wabaInfo);
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
        <p className="text-base font-semibold text-gray-900">{remainingQuota.toLocaleString()}</p>
        {quotaUsage > 0 && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(quotaUsage / messageLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {quotaUsage.toLocaleString()} / {messageLimit.toLocaleString()} used
            </p>
          </div>
        )}
        {timeUntilReset && (
          <p className="text-xs text-gray-500 mt-1">
            Resets in {timeUntilReset.hours}h {timeUntilReset.minutes}m
          </p>
        )}
      </div>

      {/* Selected Audience */}
      <div>
        <p className="text-sm font-medium text-gray-500">Selected Audience</p>
        <p className="text-base font-semibold text-gray-900">
          {totalSelectedContacts.toLocaleString()}
        </p>
      </div>
      
      {/* Unique Contacts Messaged Today */}
      <div>
        <p className="text-sm font-medium text-gray-500">Unique Contacts Today</p>
        <p className="text-base font-semibold text-gray-900">
          {uniqueContactsCount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Already messaged today
        </p>
      </div>
    </div>
  </div>
  );
}

export default InformationCards;