export const getMessageLimit = (wabaInfo) => {
  // Case 1: user has no WABA connected
  if (!wabaInfo) return 2;


  if (!wabaInfo.messagingLimit) return 250;


  const tierLimits = {
    TIER_0K: 250,
    TIER_1K: 1000,
    TIER_10K: 10000,
    TIER_100K: 100000,
  };


  return tierLimits[wabaInfo.messagingLimit] || 250;
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
