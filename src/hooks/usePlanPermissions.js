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

  const permissions = getPlanPermissions(user?.plan);
  
  const checkPermission = (permission) => {
    return permissions[permission] || false;
  };

  const requireUpgrade = (feature, currentPlan) => {
    // Logic to determine if user needs to upgrade for a feature
    const upgradeMap = {
      'canUseDynamicTemplates': { required: 'pro', current: currentPlan },
      'canScheduleBroadcast': { required: 'pro', current: currentPlan },
      'canUseAPIs': { required: 'pro', current: currentPlan },
      'canBulkUpload': { required: 'trial', current: currentPlan },
      'canAddSubUser': { 
        required: currentPlan === 'trial' || currentPlan === 'basic' ? 'pro' : null, 
        current: currentPlan 
      },
    };
    
    return upgradeMap[feature];
  };

  // Debug logs
  // console.log('Current plan:', user?.plan || 'trial');
  // console.log('Permissions for plan:', permissions);
  // console.log('Users count for canAddSubUser:', usersMatrix?.length || 0);
  
  return {
    permissions,
    checkPermission,
    requireUpgrade,
    userPlan: user?.plan || 'trial'
  };
};
