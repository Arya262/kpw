import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getPermissions } from "../utils/getPermissions";

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return null;
    return getPermissions(user);
  }, [user]);


  const hasPermission = (module, action) => {
    if (!permissions) return false;
    
    // Check granular permissions first (new RBAC system)
    if (permissions[module] && permissions[module][action] !== undefined) {
      return permissions[module][action];
    }
    
    // Fallback to legacy permissions for backward compatibility
    if (module === 'contacts' || module === 'broadcasts' || module === 'templates') {
      if (action === 'add' || action === 'create') return permissions.canAdd || false;
      if (action === 'edit') return permissions.canEdit || false;
      if (action === 'delete') return permissions.canDelete || false;
      if (action === 'view') return permissions.canView !== false;
    }
    
    // Drip campaigns permissions mapping
    if (module === 'drip_campaigns') {
      if (action === 'view') return permissions.canViewDripCampaigns !== false;
      if (action === 'create') return permissions.canAddDripCampaign || false;
      if (action === 'edit') return permissions.canEditDripCampaign || false;
      if (action === 'delete') return permissions.canDeleteDripCampaign || false;
      if (action === 'activate') return permissions.canActivateDripCampaign || false;
      if (action === 'enroll') return permissions.canEnrollDripCampaign || false;
    }
    
    return false;
  };

  const hasAllPermissions = (checks) => {
    return checks.every(([module, action]) => hasPermission(module, action));
  };

  const hasAnyPermission = (checks) => {
    return checks.some(([module, action]) => hasPermission(module, action));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    // Legacy compatibility
    canAdd: permissions?.canAdd || false,
    canEdit: permissions?.canEdit || false,
    canDelete: permissions?.canDelete || false,
    canView: permissions?.canView !== false,
  };
};

