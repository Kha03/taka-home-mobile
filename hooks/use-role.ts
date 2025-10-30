/**
 * Hook để sử dụng role-based access control
 */

import { useAuth } from "@/contexts/auth-context";
import {
  hasRole,
  hasAnyRole,
  isAdmin,
  isLandlord,
  isTenant,
  type UserRole,
} from "@/lib/auth/roles";

export function useRole() {
  const { user } = useAuth();

  return {
    roles: user?.roles,
    hasRole: (role: UserRole) => hasRole(user?.roles, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user?.roles, roles),
    isAdmin: isAdmin(user?.roles),
    isLandlord: isLandlord(user?.roles),
    isTenant: isTenant(user?.roles),
  };
}
