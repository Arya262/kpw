import { useAuth } from '../context/AuthContext';

export const usePlanPermissions = (usersMatrix = []) => {
  const { user } = useAuth();
  
  const getPlanPermissions = (planType) => {
    const plans = {
      trial: {
        canUseDynamicTemplates: false,
        canUseButtons: false,
        canScheduleBroadcast: false,
        canUseAdvancedAnalytics: false,
        canUseAPIs: false,
        canBulkUpload: true,
        canAddSubUser: usersMatrix.length < 1,
        trialDays: 14,
      },
      basic: {
        canUseDynamicTemplates: false,
        canUseButtons: false,
        canScheduleBroadcast: false,
        canUseAdvancedAnalytics: false,
        canUseAPIs: false,
        canBulkUpload: false,
        canAddSubUser: usersMatrix.length < 1,
      },
      pro: {
        canUseDynamicTemplates: true,
        canUseButtons: true,
        canScheduleBroadcast: true,
        canUseAdvancedAnalytics: true,
        canUseAPIs: true,
        canBulkUpload: true,
        canAddSubUser: usersMatrix.length < 5,
      }
    };
    
    return plans[planType] || plans.trial;
  };
  
  const normalizedPlan = (user?.plan || 'trial').toLowerCase();
  const permissions = getPlanPermissions(normalizedPlan);
    
  const checkPermission = (permission) => {
    return permissions[permission] || false;
  };

  const requireUpgrade = (feature, currentPlan) => {
    const upgradeMap = {
    
      'canScheduleBroadcast': { required: 'pro', current: currentPlan },
      'canBulkUpload': { required: 'trial', current: currentPlan },
      'canAddSubUser': { 
        required: currentPlan === 'trial' || currentPlan === 'basic' ? 'pro' : null, 
        current: currentPlan 
      },
    };
    
    return upgradeMap[feature];
  };
  
  return {
    permissions,
    checkPermission,
    requireUpgrade,
    userPlan: normalizedPlan 
  };
};
