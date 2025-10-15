import { ROLE_PERMISSIONS } from "../context/permissions";

export function getPermissions(user) {
  const role = user?.role;
  const rolePermissions = ROLE_PERMISSIONS[role] || {};
  
  // Get plan-based permissions
  const getPlanPermissions = (planType) => {
    const plans = {
      trial: {
        canUseDynamicTemplates: false,
        canUseButtons: false,
        canScheduleBroadcast: false,
        canUseAdvancedAnalytics: false,
        canUseAPIs: false,
        canBulkUpload: true,
        agentLimit: 1,
        trialDays: 14,
      },
      basic: {
        canUseDynamicTemplates: false,
        canUseButtons: false,
        canScheduleBroadcast: false,
        canUseAdvancedAnalytics: false,
        canUseAPIs: false,
        canBulkUpload: false,
        agentLimit: 1,
      },
      pro: {
        canUseDynamicTemplates: true,
        canUseButtons: true,
        canScheduleBroadcast: true,
        canUseAdvancedAnalytics: true,
        canUseAPIs: true,
        canBulkUpload: true,
        agentLimit: 5,
      }
    };
    
    return plans[planType] || plans.trial;
  };

  const planPermissions = getPlanPermissions(user?.plan);
  
  // Merge role permissions with plan permissions
  return {
    ...rolePermissions,
    ...planPermissions,
    // Override specific permissions based on plan
    canBulkUpload: planPermissions.canBulkUpload && rolePermissions.canBulkUpload,
    canScheduleBroadcast: planPermissions.canScheduleBroadcast && rolePermissions.canScheduleBroadcast,
    canUseAPIs: planPermissions.canUseAPIs && rolePermissions.canUseAPIs,
    canUseDynamicTemplates: planPermissions.canUseDynamicTemplates && rolePermissions.canUseDynamicTemplates,
    canUseAdvancedAnalytics: planPermissions.canUseAdvancedAnalytics && rolePermissions.canUseAdvancedAnalytics,
  };
} 