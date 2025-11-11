import { useState, useEffect, useCallback } from 'react';
import { getMessageLimit } from '../utils/messageLimits';

export const useUniqueQuotaManagement = (wabaInfo, customerId) => {
  const [quotaUsage, setQuotaUsage] = useState(0);
  const [uniqueContacts, setUniqueContacts] = useState(new Set());
  const [lastResetDate, setLastResetDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const messageLimit = getMessageLimit(wabaInfo);


  const getQuotaData = useCallback(() => {
    if (!customerId) return { usage: 0, uniqueContacts: [], lastReset: null };
    
    try {
      const stored = localStorage.getItem(`unique_quota_${customerId}`);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          usage: data.usage || 0,
          uniqueContacts: data.uniqueContacts || [],
          lastReset: data.lastReset
        };
      }
    } catch (error) {
      console.error('Error reading unique quota data from localStorage:', error);
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
      localStorage.setItem(`unique_quota_${customerId}`, JSON.stringify(quotaData));
    } catch (error) {
      console.error('Error saving unique quota data to localStorage:', error);
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

  const resetQuota = useCallback(() => {
    const now = new Date();
    setQuotaUsage(0);
    setUniqueContacts(new Set());
    setLastResetDate(now);
    saveQuotaData(0, [], now);
  }, [saveQuotaData]);


  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    const quotaData = getQuotaData();
    
    if (shouldResetQuota(quotaData.lastReset)) {
      resetQuota();
    } else {
      setQuotaUsage(quotaData.usage);
      setUniqueContacts(new Set(quotaData.uniqueContacts));
      setLastResetDate(quotaData.lastReset ? new Date(quotaData.lastReset) : null);
    }
    
    setIsLoading(false);
  }, [customerId, getQuotaData, shouldResetQuota, resetQuota]);


  const useQuotaForUniqueContacts = useCallback((contactIds) => {
    if (!customerId || !contactIds || contactIds.length === 0) return false;
    

    const newUniqueContacts = contactIds.filter(id => !uniqueContacts.has(id));
    
    if (newUniqueContacts.length === 0) {
      console.log('All contacts have already been messaged today - no quota consumed');
      return true; 
    }
    
    const newUsage = quotaUsage + newUniqueContacts.length;
    
    if (newUsage > messageLimit) {
      return false; 
    }
    

    const updatedUniqueContacts = new Set([...uniqueContacts, ...newUniqueContacts]);
    
    setQuotaUsage(newUsage);
    setUniqueContacts(updatedUniqueContacts);
    saveQuotaData(newUsage, Array.from(updatedUniqueContacts), lastResetDate);
    
    console.log(`Quota consumed: ${newUniqueContacts.length} unique contacts (${contactIds.length - newUniqueContacts.length} duplicates ignored)`);
    return true;
  }, [customerId, uniqueContacts, quotaUsage, messageLimit, lastResetDate, saveQuotaData]);


  const getRemainingQuota = useCallback(() => {
    return Math.max(0, messageLimit - quotaUsage);
  }, [messageLimit, quotaUsage]);


  const hasEnoughQuotaForUniqueContacts = useCallback((contactIds) => {
    if (!contactIds || contactIds.length === 0) return true;
    
    const newUniqueContacts = contactIds.filter(id => !uniqueContacts.has(id));
    return getRemainingQuota() >= newUniqueContacts.length;
  }, [uniqueContacts, getRemainingQuota]);


  const getQuotaUsagePercentage = useCallback(() => {
    return (quotaUsage / messageLimit) * 100;
  }, [quotaUsage, messageLimit]);


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


  const getUniqueContactsCount = useCallback(() => {
    return uniqueContacts.size;
  }, [uniqueContacts]);

  return {
    quotaUsage,
    remainingQuota: getRemainingQuota(),
    messageLimit,
    lastResetDate,
    isLoading,
    uniqueContactsCount: getUniqueContactsCount(),
    
    useQuotaForUniqueContacts,
    resetQuota,
    
    hasEnoughQuotaForUniqueContacts,
    quotaUsagePercentage: getQuotaUsagePercentage(),
    timeUntilReset: getTimeUntilReset(),
  };
};
