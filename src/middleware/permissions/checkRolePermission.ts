/**
 * Role-based access control middleware
 * Owner | Farmer | Labor
 */

export type UserRole = 'Owner' | 'Farmer' | 'Labor';

export type Permission =
  | 'view_land_reports'
  | 'view_labor_summaries'
  | 'read_only_jobs'
  | 'create_jobs'
  | 'hire_labor'
  | 'mark_attendance'
  | 'process_payments'
  | 'view_jobs'
  | 'apply_for_jobs'
  | 'view_assignments';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Owner: [
    'view_land_reports',
    'view_labor_summaries',
    'read_only_jobs',
  ],
  Farmer: [
    'create_jobs',
    'hire_labor',
    'mark_attendance',
    'process_payments',
    'view_jobs',
    'read_only_jobs',
    'view_labor_summaries',
  ],
  Labor: [
    'view_jobs',
    'apply_for_jobs',
    'view_assignments',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

export function allowRoles(allowedRoles: UserRole[]) {
  return (userRole: UserRole): boolean => {
    return allowedRoles.includes(userRole);
  };
}

export function requirePermission(permission: Permission) {
  return (userRole: UserRole): boolean => {
    return hasPermission(userRole, permission);
  };
}
