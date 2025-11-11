export const getMessageLimit = (wabaInfo) => {
  if (!wabaInfo?.messagingLimit) return 250; // Default to 250 if no tier info

  const tierLimits = {
    'TIER_1K': 1000,
    'TIER_10K': 10000,
    'TIER_100K': 100000,
  };

  return tierLimits[wabaInfo.messagingLimit] || 250; // Default to 250 if tier not found
};

export const isContactLimitExceeded = (contactCount, wabaInfo) => {
  const messageLimit = getMessageLimit(wabaInfo);
  return contactCount > messageLimit;
};


export const getTierDisplayName = (wabaInfo) => {
  if (!wabaInfo?.messagingLimit) return '0';
  return wabaInfo.messagingLimit.replace('TIER_', '');
};


export const getRemainingQuota = (wabaInfo, quotaUsage = 0) => {
  const messageLimit = getMessageLimit(wabaInfo);
  return Math.max(0, messageLimit - quotaUsage);
};
