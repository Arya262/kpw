import { useState, useEffect, useCallback } from 'react';
import { getMessageLimit } from '../utils/messageLimits';

export const useQuotaManagement = (wabaInfo, customerId) => {
  const [quotaUsage, setQuotaUsage] = useState(0);
  const [uniqueContacts, setUniqueContacts] = useState(new Set());
  const [lastResetDate, setLastResetDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messageLimit = getMessageLimit(wabaInfo);

  const getQuotaData = useCallback(() => {
    if (!customerId) return { usage: 0, uniqueContacts: [], lastReset: null };
    
    try {
      const stored = localStorage.getItem(`quota_${customerId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          usage: data.usage || 0,
          uniqueContacts: data.uniqueContacts || [],
          lastReset: data.lastReset
        };
      }
    } catch (error) {
      console.error('Error reading quota data from localStorage:', error);
    }
    
    return { usage: 0, uniqueContacts: [], lastReset: null };
  }, [customerId]);

  const saveQuotaData = useCallback((usage, uniqueContactsArray, lastReset) => {
    if (!customerId) return;
    
    try {
      const quotaData = { 
        usage, 
        uniqueContacts: uniqueContactsArray, 
        lastReset 
      };
      localStorage.setItem(`quota_${customerId}`, JSON.stringify(quotaData));
    } catch (error) {
      console.error('Error saving quota data to localStorage:', error);
    }
  }, [customerId]);

  const shouldResetQuota = useCallback((lastReset) => {
    if (!lastReset) return true;
    const now = new Date();
    const lastResetUTC = new Date(lastReset);
    // Reset if we've crossed to a new UTC day
    return now.getUTCFullYear() !== lastResetUTC.getUTCFullYear() ||
           now.getUTCMonth() !== lastResetUTC.getUTCMonth() ||
           now.getUTCDate() !== lastResetUTC.getUTCDate();
  }, []);

  /**
   * Reset quota to full limit
   */
  const resetQuota = useCallback(() => {
    const now = new Date();
    setQuotaUsage(0);
    setUniqueContacts(new Set());
    setLastResetDate(now);
    saveQuotaData(0, [], now);
  }, [saveQuotaData]);

  /**
   * Initialize quota data
   */
  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    const quotaData = getQuotaData();
    
    if (shouldResetQuota(quotaData.lastReset)) {
      // Reset quota if 24 hours have passed
      resetQuota();
    } else {
      // Use existing quota data
      setQuotaUsage(quotaData.usage);
      setUniqueContacts(new Set(quotaData.uniqueContacts));
      setLastResetDate(quotaData.lastReset ? new Date(quotaData.lastReset) : null);
    }
    
    setIsLoading(false);
  }, [customerId, getQuotaData, shouldResetQuota, resetQuota]);

  /**
   * Use quota for unique contacts (WhatsApp API requirement)
   * @param {Array} contactIds - Array of contact IDs/phone numbers
   * @returns {{success: boolean, consumed: number, total: number}} Result object with success status, consumed count, and total count
   */
  const useQuota = useCallback((contactIds) => {
    if (!customerId || !contactIds || contactIds.length === 0) {
      return { success: false, consumed: 0, total: contactIds.length };
    }
    
    // Filter out contacts that have already been messaged today
    const newUniqueContacts = contactIds.filter(id => !uniqueContacts.has(id));
    
    if (newUniqueContacts.length === 0) {
      console.log(`All ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''} have already been messaged today - no quota consumed`);
      return { success: true, consumed: 0, total: contactIds.length }; // Success, but no quota consumed
    }
    
    const newUsage = quotaUsage + newUniqueContacts.length;
    
    if (newUsage > messageLimit) {
      return { success: false, consumed: 0, total: contactIds.length }; // Not enough quota
    }
    
    // Add new unique contacts to the set
    const updatedUniqueContacts = new Set([...uniqueContacts, ...newUniqueContacts]);
    
    setQuotaUsage(newUsage);
    setUniqueContacts(updatedUniqueContacts);
    saveQuotaData(newUsage, Array.from(updatedUniqueContacts), lastResetDate);
    
    const duplicates = contactIds.length - newUniqueContacts.length;
    console.log(`Quota consumed: ${newUniqueContacts.length} unique contact${newUniqueContacts.length !== 1 ? 's' : ''}${duplicates > 0 ? ` (${duplicates} duplicate${duplicates !== 1 ? 's' : ''} ignored)` : ''}`);
    return { success: true, consumed: newUniqueContacts.length, total: contactIds.length };
  }, [customerId, uniqueContacts, quotaUsage, messageLimit, lastResetDate, saveQuotaData]);

  /**
   * Get remaining quota
   */
  const getRemainingQuota = useCallback(() => {
    return Math.max(0, messageLimit - quotaUsage);
  }, [messageLimit, quotaUsage]);

  /**
   * Check if there's enough quota for the given unique contacts
   */
  const hasEnoughQuota = useCallback((contactIds) => {
    if (!contactIds || contactIds.length === 0) return true;
    
    const newUniqueContacts = contactIds.filter(id => !uniqueContacts.has(id));
    return getRemainingQuota() >= newUniqueContacts.length;
  }, [uniqueContacts, getRemainingQuota]);

  /**
   * Get quota usage percentage
   */
  const getQuotaUsagePercentage = useCallback(() => {
    return (quotaUsage / messageLimit) * 100;
  }, [quotaUsage, messageLimit]);

  /**
   * Get time until next reset
   */
  const getTimeUntilReset = useCallback(() => {
    const now = new Date();
    // Next midnight UTC:
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const timeDiff = nextReset - now;
    if (timeDiff <= 0) return null;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, []);

  /**
   * Get unique contacts count
   */
  const getUniqueContactsCount = useCallback(() => {
    return uniqueContacts.size;
  }, [uniqueContacts]);

  return {
    // State
    quotaUsage,
    remainingQuota: getRemainingQuota(),
    messageLimit,
    lastResetDate,
    isLoading,
    uniqueContactsCount: getUniqueContactsCount(),
    
    // Actions
    useQuota,
    resetQuota,
    
    // Computed values
    hasEnoughQuota,
    quotaUsagePercentage: getQuotaUsagePercentage(),
    timeUntilReset: getTimeUntilReset(),
  };
};
