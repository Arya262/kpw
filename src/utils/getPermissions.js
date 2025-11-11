import { ROLE_PERMISSIONS } from "../context/permissions";

export function getPermissions(user) {
  // If user has custom permissions (from RBAC system), use those
  if (user?.permissions && typeof user.permissions === 'object' && user.permissions !== null) {
    // Map granular permissions to legacy permission format for backward compatibility
    const customPerms = user.permissions;
    
    return {
      // Legacy format for backward compatibility
      canView: customPerms.contacts?.view || customPerms.broadcasts?.view || customPerms.templates?.view || false,
      canAdd: customPerms.contacts?.add || false,
      canEdit: customPerms.contacts?.edit || customPerms.broadcasts?.edit || customPerms.templates?.edit || false,
      canDelete: customPerms.contacts?.delete || customPerms.broadcasts?.delete || customPerms.templates?.delete || false,
      
      // Granular permissions (new format)
      contacts: customPerms.contacts || {},
      broadcasts: customPerms.broadcasts || {},
      templates: customPerms.templates || {},
      chats: customPerms.chats || {},
      analytics: customPerms.analytics || {},
      settings: customPerms.settings || {},
      users: customPerms.users || {},
      
      // Plan-based permissions (still apply)
      ...getPlanPermissions(user?.plan),
    };
  }
  
  // Fallback to role-based permissions (legacy system)
  const role = user?.role;
  const rolePermissions = ROLE_PERMISSIONS[role] || {};
  
  // Get plan-based permissions
  function getPlanPermissions(planType) {
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
  }

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