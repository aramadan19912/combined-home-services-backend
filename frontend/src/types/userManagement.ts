// Base interfaces
export interface EntityDto<T = string> {
  id: T;
}

export interface PagedAndSortedResultRequestDto {
  maxResultCount?: number;
  skipCount?: number;
  sorting?: string;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

// Authentication DTOs
export interface LoginDto {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResultDto {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  user: UserDto;
  roles: string[];
  groups: string[];
  permissions: string[];
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface OtpLoginDto {
  email: string;
  otpCode: string;
}

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleIds?: string[];
  groupIds?: string[];
}

// User Management DTOs
export interface UserDto extends EntityDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  lastLoginDate?: string;
  failedLoginAttempts: number;
  lockoutEndDate?: string;
  creationTime: string;
  roles: RoleDto[];
  groups: GroupDto[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roleIds?: string[];
  groupIds?: string[];
}

export interface UpdateUserDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  roleIds?: string[];
  groupIds?: string[];
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordDto {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface GetUsersInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean;
  roleIds?: string[];
  groupIds?: string[];
}

// Role Management DTOs
export interface RoleDto extends EntityDto {
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  creationTime: string;
  permissions: PermissionDto[];
  userCount: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface GetRolesInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean;
  isSystemRole?: boolean;
}

export interface AssignRoleToUsersDto {
  roleId: string;
  userIds: string[];
  expiryDate?: string;
}

export interface RemoveRoleFromUsersDto {
  roleId: string;
  userIds: string[];
}

// Group Management DTOs
export interface GroupDto extends EntityDto {
  name: string;
  description?: string;
  isActive: boolean;
  parentGroupId?: string;
  parentGroupName?: string;
  creationTime: string;
  childGroups: GroupDto[];
  permissions: PermissionDto[];
  userCount: number;
  directUserCount: number;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  parentGroupId?: string;
  permissionIds?: string[];
}

export interface UpdateGroupDto {
  name: string;
  description?: string;
  parentGroupId?: string;
  permissionIds?: string[];
}

export interface GetGroupsInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean;
  parentGroupId?: string;
  includeChildGroups?: boolean;
}

export interface AssignGroupToUsersDto {
  groupId: string;
  userIds: string[];
  expiryDate?: string;
}

export interface RemoveGroupFromUsersDto {
  groupId: string;
  userIds: string[];
}

export interface GroupHierarchyDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  level: number;
  children: GroupHierarchyDto[];
}

// Permission Management DTOs
export interface PermissionDto extends EntityDto {
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  creationTime: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionDto {
  name: string;
  description?: string;
  category?: string;
}

export interface GetPermissionsInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  category?: string;
  isActive?: boolean;
}

// User Activity DTOs
export interface UserActivityDto extends EntityDto {
  userId: string;
  username: string;
  activityType: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  activityDate: string;
  isSuccessful: boolean;
  additionalData?: string;
}

export interface GetUserActivitiesInput extends PagedAndSortedResultRequestDto {
  userId?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  isSuccessful?: boolean;
  ipAddress?: string;
}

// Metrics DTOs
export interface UserMetricsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  unconfirmedEmailUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  lastUpdated: string;
}

export interface ActivityMetricsDto {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueActiveUsers: number;
  loginAttemptsToday: number;
  successfulLoginsToday: number;
  failedLoginsToday: number;
  hourlyActivity: HourlyActivityDto[];
  dailyActivity: DailyActivityDto[];
  lastUpdated: string;
}

export interface HourlyActivityDto {
  hour: number;
  loginCount: number;
  failedLoginCount: number;
  uniqueUsers: number;
}

export interface DailyActivityDto {
  date: string;
  loginCount: number;
  failedLoginCount: number;
  uniqueUsers: number;
  newUsers: number;
}

export interface SystemMetricsDto {
  userMetrics: UserMetricsDto;
  activityMetrics: ActivityMetricsDto;
  totalRoles: number;
  activeRoles: number;
  totalGroups: number;
  activeGroups: number;
  totalPermissions: number;
  activePermissions: number;
  topRoles: RoleUsageDto[];
  topGroups: GroupUsageDto[];
}

export interface RoleUsageDto {
  roleId: string;
  roleName: string;
  userCount: number;
}

export interface GroupUsageDto {
  groupId: string;
  groupName: string;
  userCount: number;
}

export interface GetMetricsInput {
  startDate?: string;
  endDate?: string;
  includeHourlyBreakdown?: boolean;
  includeDailyBreakdown?: boolean;
  topItemsCount?: number;
}

// Activity Types Constants
export const ActivityTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  REGISTRATION: 'REGISTRATION',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
  GROUP_ASSIGNMENT: 'GROUP_ASSIGNMENT',
  ACCOUNT_LOCKOUT: 'ACCOUNT_LOCKOUT',
  ACCOUNT_UNLOCK: 'ACCOUNT_UNLOCK',
  EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
  PASSWORD_RESET: 'PASSWORD_RESET'
} as const;

// Permission Names Constants
export const PermissionNames = {
  USER_MANAGEMENT_CREATE: 'UserManagement.Create',
  USER_MANAGEMENT_UPDATE: 'UserManagement.Update',
  USER_MANAGEMENT_DELETE: 'UserManagement.Delete',
  USER_MANAGEMENT_VIEW: 'UserManagement.View',
  
  ROLE_MANAGEMENT_CREATE: 'RoleManagement.Create',
  ROLE_MANAGEMENT_UPDATE: 'RoleManagement.Update',
  ROLE_MANAGEMENT_DELETE: 'RoleManagement.Delete',
  ROLE_MANAGEMENT_VIEW: 'RoleManagement.View',
  
  GROUP_MANAGEMENT_CREATE: 'GroupManagement.Create',
  GROUP_MANAGEMENT_UPDATE: 'GroupManagement.Update',
  GROUP_MANAGEMENT_DELETE: 'GroupManagement.Delete',
  GROUP_MANAGEMENT_VIEW: 'GroupManagement.View',
  
  ADMIN_PANEL_ACCESS: 'AdminPanel.Access',
  METRICS_VIEW: 'Metrics.View',
  SYSTEM_SETTINGS_MANAGE: 'SystemSettings.Manage'
} as const;

// Dashboard Summary DTO
export interface DashboardSummaryDto {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  todayLogins: number;
  todayFailedLogins: number;
  activeSessions: number;
  totalRoles: number;
  totalGroups: number;
  recentActivities: UserActivityDto[];
  lastUpdated: string;
}

// Form validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// Auth context types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  groups: string[];
  permissions: string[];
  isEmailConfirmed: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterUserDto) => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isInRole: (role: string) => boolean;
  isInGroup: (group: string) => boolean;
}