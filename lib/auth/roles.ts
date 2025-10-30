/**
 * Role-based Access Control (RBAC) Configuration
 */

export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export const ROLES = {
  TENANT: "TENANT" as UserRole,
  LANDLORD: "LANDLORD" as UserRole,
  ADMIN: "ADMIN" as UserRole,
} as const;

/**
 * Route permissions configuration
 * Định nghĩa quyền truy cập cho từng route
 */
export const ROUTE_PERMISSIONS: Record<
  string,
  {
    allowedRoles: UserRole[];
    requireAuth: boolean;
    redirectTo?: string;
  }
> = {
  // Admin only routes
  "/property-approval": {
    allowedRoles: [ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/",
  },

  // Landlord only routes
  "/rental-requests": {
    allowedRoles: [ROLES.LANDLORD],
    requireAuth: true,
    redirectTo: "/",
  },
  "/my-properties": {
    allowedRoles: [ROLES.LANDLORD],
    requireAuth: true,
    redirectTo: "/",
  },
  "/properties/create": {
    allowedRoles: [ROLES.LANDLORD],
    requireAuth: true,
    redirectTo: "/",
  },

  // Common authenticated routes (Tenant, Landlord, and Admin)
  "/contracts": {
    allowedRoles: [ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/signin",
  },
  "/chat": {
    allowedRoles: [ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/signin",
  },
  "/profile": {
    allowedRoles: [ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/signin",
  },
  "/blockchain-history": {
    allowedRoles: [ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/signin",
  },
  "/payment-result": {
    allowedRoles: [ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN],
    requireAuth: true,
    redirectTo: "/signin",
  },
};

/**
 * Check if user has permission to access a route
 */
export function hasRoutePermission(
  pathname: string,
  userRoles?: UserRole[]
): {
  hasPermission: boolean;
  requireAuth: boolean;
  redirectTo?: string;
} {
  // Find matching route permission
  const routeKey = Object.keys(ROUTE_PERMISSIONS).find(
    (key) => pathname === key || pathname.startsWith(key + "/")
  );

  if (!routeKey) {
    // Route not in permission config, allow access
    return { hasPermission: true, requireAuth: false };
  }

  const permission = ROUTE_PERMISSIONS[routeKey];

  // If no user roles (not authenticated)
  if (!userRoles || userRoles.length === 0) {
    return {
      hasPermission: !permission.requireAuth,
      requireAuth: permission.requireAuth,
      redirectTo: permission.redirectTo || "/signin",
    };
  }

  // Check if user has any of the allowed roles
  const hasRole = userRoles.some((role) =>
    permission.allowedRoles.includes(role)
  );

  return {
    hasPermission: hasRole,
    requireAuth: permission.requireAuth,
    redirectTo: hasRole ? undefined : permission.redirectTo || "/",
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(
  userRoles: UserRole[] | undefined,
  role: UserRole
): boolean {
  if (!userRoles) return false;
  return userRoles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  userRoles: UserRole[] | undefined,
  roles: UserRole[]
): boolean {
  if (!userRoles) return false;
  return userRoles.some((role) => roles.includes(role));
}

/**
 * Check if user is admin
 */
export function isAdmin(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, ROLES.ADMIN);
}

/**
 * Check if user is landlord
 */
export function isLandlord(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, ROLES.LANDLORD);
}

/**
 * Check if user is tenant
 */
export function isTenant(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, ROLES.TENANT);
}
