import { apiClient, authClient } from '@/lib/api-client';
import type {
  LoginDto,
  LoginResultDto,
  RefreshTokenDto,
  RegisterUserDto,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  UserDto,
  GetUsersInput,
  CreateRoleDto,
  UpdateRoleDto,
  RoleDto,
  GetRolesInput,
  AssignRoleToUsersDto,
  RemoveRoleFromUsersDto,
  CreateGroupDto,
  UpdateGroupDto,
  GroupDto,
  GetGroupsInput,
  AssignGroupToUsersDto,
  RemoveGroupFromUsersDto,
  GroupHierarchyDto,
  GetUserActivitiesInput,
  UserActivityDto,
  GetMetricsInput,
  SystemMetricsDto,
  UserMetricsDto,
  ActivityMetricsDto,
  PermissionDto,
  GetPermissionsInput,
  CreatePermissionDto,
  UpdatePermissionDto
} from '@/types/userManagement';

// Authentication endpoints
export const authApi = {
  login: async (data: LoginDto): Promise<LoginResultDto> => {
    const response = await apiClient.post('/api/v1/usermanagement/login', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenDto): Promise<LoginResultDto> => {
    const response = await apiClient.post('/api/v1/usermanagement/refresh-token', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await authClient.post('/api/v1/usermanagement/logout');
  },

  register: async (data: RegisterUserDto): Promise<UserDto> => {
    const response = await apiClient.post('/api/v1/usermanagement/register', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/usermanagement/forgot-password', email);
    return response.data;
  },

  requestOtpLogin: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/usermanagement/request-otp-login', email);
    return response.data;
  },

  loginWithOtp: async (email: string, otpCode: string): Promise<LoginResultDto> => {
    const response = await apiClient.post('/api/v1/usermanagement/login-with-otp', { email, otpCode });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/usermanagement/reset-password', data);
    return response.data;
  },

  confirmEmail: async (userId: string, token: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/v1/usermanagement/users/${userId}/confirm-email?token=${encodeURIComponent(token)}`);
    return response.data;
  }
};

// User Management endpoints
export const userManagementApi = {
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await authClient.get('/api/v1/usermanagement/me');
    return response.data;
  },

  createUser: async (data: CreateUserDto): Promise<UserDto> => {
    const response = await authClient.post('/api/v1/usermanagement/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<UserDto> => {
    const response = await authClient.put(`/api/v1/usermanagement/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await authClient.delete(`/api/v1/usermanagement/users/${id}`);
  },

  getUser: async (id: string): Promise<UserDto> => {
    const response = await authClient.get(`/api/v1/usermanagement/users/${id}`);
    return response.data;
  },

  getUsers: async (params: GetUsersInput): Promise<{ items: UserDto[]; totalCount: number }> => {
    const response = await authClient.get('/api/v1/usermanagement/users', { params });
    return response.data;
  },

  changePassword: async (userId: string, data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${userId}/change-password`, data);
    return response.data;
  },

  activateUser: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${id}/deactivate`);
    return response.data;
  },

  unlockUser: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${id}/unlock`);
    return response.data;
  },

  assignRolesToUser: async (userId: string, roleIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${userId}/roles`, roleIds);
    return response.data;
  },

  removeRolesFromUser: async (userId: string, roleIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.delete(`/api/v1/usermanagement/users/${userId}/roles`, { data: roleIds });
    return response.data;
  },

  assignGroupsToUser: async (userId: string, groupIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${userId}/groups`, groupIds);
    return response.data;
  },

  removeGroupsFromUser: async (userId: string, groupIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.delete(`/api/v1/usermanagement/users/${userId}/groups`, { data: groupIds });
    return response.data;
  },

  sendEmailConfirmation: async (userId: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/usermanagement/users/${userId}/send-email-confirmation`);
    return response.data;
  }
};

// Role Management endpoints
export const roleManagementApi = {
  createRole: async (data: CreateRoleDto): Promise<RoleDto> => {
    const response = await authClient.post('/api/v1/rolemanagement/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: UpdateRoleDto): Promise<RoleDto> => {
    const response = await authClient.put(`/api/v1/rolemanagement/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await authClient.delete(`/api/v1/rolemanagement/roles/${id}`);
  },

  getRole: async (id: string): Promise<RoleDto> => {
    const response = await authClient.get(`/api/v1/rolemanagement/roles/${id}`);
    return response.data;
  },

  getRoles: async (params: GetRolesInput): Promise<{ items: RoleDto[]; totalCount: number }> => {
    const response = await authClient.get('/api/v1/rolemanagement/roles', { params });
    return response.data;
  },

  activateRole: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/rolemanagement/roles/${id}/activate`);
    return response.data;
  },

  deactivateRole: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/rolemanagement/roles/${id}/deactivate`);
    return response.data;
  },

  assignRoleToUsers: async (data: AssignRoleToUsersDto): Promise<{ message: string }> => {
    const response = await authClient.post('/api/v1/rolemanagement/assign-role-to-users', data);
    return response.data;
  },

  removeRoleFromUsers: async (data: RemoveRoleFromUsersDto): Promise<{ message: string }> => {
    const response = await authClient.post('/api/v1/rolemanagement/remove-role-from-users', data);
    return response.data;
  },

  assignPermissionsToRole: async (roleId: string, permissionIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/rolemanagement/roles/${roleId}/permissions`, permissionIds);
    return response.data;
  },

  removePermissionsFromRole: async (roleId: string, permissionIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.delete(`/api/v1/rolemanagement/roles/${roleId}/permissions`, { data: permissionIds });
    return response.data;
  },

  getRoleUsers: async (roleId: string, params: any): Promise<{ items: UserDto[]; totalCount: number }> => {
    const response = await authClient.get(`/api/v1/rolemanagement/roles/${roleId}/users`, { params });
    return response.data;
  },

  isRoleInUse: async (roleId: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/rolemanagement/roles/${roleId}/in-use`);
    return response.data;
  }
};

// Group Management endpoints
export const groupManagementApi = {
  createGroup: async (data: CreateGroupDto): Promise<GroupDto> => {
    const response = await authClient.post('/api/v1/groupmanagement/groups', data);
    return response.data;
  },

  updateGroup: async (id: string, data: UpdateGroupDto): Promise<GroupDto> => {
    const response = await authClient.put(`/api/v1/groupmanagement/groups/${id}`, data);
    return response.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await authClient.delete(`/api/v1/groupmanagement/groups/${id}`);
  },

  getGroup: async (id: string): Promise<GroupDto> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${id}`);
    return response.data;
  },

  getGroups: async (params: GetGroupsInput): Promise<{ items: GroupDto[]; totalCount: number }> => {
    const response = await authClient.get('/api/v1/groupmanagement/groups', { params });
    return response.data;
  },

  getGroupHierarchy: async (): Promise<GroupHierarchyDto[]> => {
    const response = await authClient.get('/api/v1/groupmanagement/group-hierarchy');
    return response.data;
  },

  getChildGroups: async (parentGroupId: string): Promise<GroupDto[]> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${parentGroupId}/children`);
    return response.data;
  },

  getParentGroup: async (groupId: string): Promise<GroupDto> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${groupId}/parent`);
    return response.data;
  },

  activateGroup: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/groupmanagement/groups/${id}/activate`);
    return response.data;
  },

  deactivateGroup: async (id: string): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/groupmanagement/groups/${id}/deactivate`);
    return response.data;
  },

  assignGroupToUsers: async (data: AssignGroupToUsersDto): Promise<{ message: string }> => {
    const response = await authClient.post('/api/v1/groupmanagement/assign-group-to-users', data);
    return response.data;
  },

  removeGroupFromUsers: async (data: RemoveGroupFromUsersDto): Promise<{ message: string }> => {
    const response = await authClient.post('/api/v1/groupmanagement/remove-group-from-users', data);
    return response.data;
  },

  assignPermissionsToGroup: async (groupId: string, permissionIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.post(`/api/v1/groupmanagement/groups/${groupId}/permissions`, permissionIds);
    return response.data;
  },

  removePermissionsFromGroup: async (groupId: string, permissionIds: string[]): Promise<{ message: string }> => {
    const response = await authClient.delete(`/api/v1/groupmanagement/groups/${groupId}/permissions`, { data: permissionIds });
    return response.data;
  },

  getGroupUsers: async (groupId: string, params: any): Promise<{ items: UserDto[]; totalCount: number }> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${groupId}/users`, { params });
    return response.data;
  },

  isGroupInUse: async (groupId: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${groupId}/in-use`);
    return response.data;
  },

  canDeleteGroup: async (groupId: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/groupmanagement/groups/${groupId}/can-delete`);
    return response.data;
  }
};

// Metrics and Activity endpoints
export const userMetricsApi = {
  getSystemMetrics: async (params: GetMetricsInput): Promise<SystemMetricsDto> => {
    const response = await authClient.get('/api/v1/usermetrics/system', { params });
    return response.data;
  },

  getUserMetrics: async (params: GetMetricsInput): Promise<UserMetricsDto> => {
    const response = await authClient.get('/api/v1/usermetrics/users', { params });
    return response.data;
  },

  getActivityMetrics: async (params: GetMetricsInput): Promise<ActivityMetricsDto> => {
    const response = await authClient.get('/api/v1/usermetrics/activities', { params });
    return response.data;
  },

  getUserActivities: async (params: GetUserActivitiesInput): Promise<{ items: UserActivityDto[]; totalCount: number }> => {
    const response = await authClient.get('/api/v1/usermetrics/user-activities', { params });
    return response.data;
  },

  logUserActivity: async (userId: string, activityType: string, description?: string, isSuccessful: boolean = true, additionalData?: string): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('activityType', activityType);
    if (description) formData.append('description', description);
    formData.append('isSuccessful', isSuccessful.toString());
    if (additionalData) formData.append('additionalData', additionalData);

    const response = await authClient.post('/api/v1/usermetrics/log-activity', formData);
    return response.data;
  },

  getPermissions: async (params: GetPermissionsInput): Promise<{ items: PermissionDto[]; totalCount: number }> => {
    const response = await authClient.get('/api/v1/usermetrics/permissions', { params });
    return response.data;
  },

  createPermission: async (data: CreatePermissionDto): Promise<PermissionDto> => {
    const response = await authClient.post('/api/v1/usermetrics/permissions', data);
    return response.data;
  },

  updatePermission: async (id: string, data: UpdatePermissionDto): Promise<PermissionDto> => {
    const response = await authClient.put(`/api/v1/usermetrics/permissions/${id}`, data);
    return response.data;
  },

  deletePermission: async (id: string): Promise<void> => {
    await authClient.delete(`/api/v1/usermetrics/permissions/${id}`);
  },

  getPermission: async (id: string): Promise<PermissionDto> => {
    const response = await authClient.get(`/api/v1/usermetrics/permissions/${id}`);
    return response.data;
  },

  hasPermission: async (userId: string, permissionName: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/usermetrics/users/${userId}/has-permission?permissionName=${encodeURIComponent(permissionName)}`);
    return response.data;
  },

  getUserPermissions: async (userId: string): Promise<string[]> => {
    const response = await authClient.get(`/api/v1/usermetrics/users/${userId}/permissions`);
    return response.data;
  },

  isInRole: async (userId: string, roleName: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/usermetrics/users/${userId}/is-in-role?roleName=${encodeURIComponent(roleName)}`);
    return response.data;
  },

  isInGroup: async (userId: string, groupName: string): Promise<boolean> => {
    const response = await authClient.get(`/api/v1/usermetrics/users/${userId}/is-in-group?groupName=${encodeURIComponent(groupName)}`);
    return response.data;
  },

  getActiveSessionsCount: async (): Promise<number> => {
    const response = await authClient.get('/api/v1/usermetrics/active-sessions-count');
    return response.data;
  },

  getTodayLoginCount: async (): Promise<number> => {
    const response = await authClient.get('/api/v1/usermetrics/today-login-count');
    return response.data;
  },

  getTodayFailedLoginCount: async (): Promise<number> => {
    const response = await authClient.get('/api/v1/usermetrics/today-failed-login-count');
    return response.data;
  },

  getRecentActivities: async (count: number = 50): Promise<UserActivityDto[]> => {
    const response = await authClient.get(`/api/v1/usermetrics/recent-activities?count=${count}`);
    return response.data;
  },

  getDashboardSummary: async (): Promise<any> => {
    const response = await authClient.get('/api/v1/usermetrics/dashboard-summary');
    return response.data;
  }
};