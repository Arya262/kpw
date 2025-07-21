import { ROLE_PERMISSIONS } from "../context/permissions";

export function getPermissions(user) {
  const role = user?.role;
  return ROLE_PERMISSIONS[role] || {};
} 