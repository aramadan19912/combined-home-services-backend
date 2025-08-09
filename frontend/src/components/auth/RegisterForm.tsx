import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/services/userManagementApi';
import { roleManagementApi, groupManagementApi } from '@/services/userManagementApi';
import type { RegisterUserDto, RoleDto, GroupDto } from '@/types/userManagement';

interface RegisterFormProps {
  onRegisterSuccess?: (result: any) => void;
  onLoginClick?: () => void;
  allowRoleGroupSelection?: boolean; // For admin users creating accounts
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onLoginClick,
  allowRoleGroupSelection = false
}) => {
  const [formData, setFormData] = useState<RegisterUserDto>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roleIds: [],
    groupIds: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false
  });
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupDto[]>([]);

  // Load roles and groups if admin is creating account
  useEffect(() => {
    if (allowRoleGroupSelection) {
      loadRolesAndGroups();
    }
  }, [allowRoleGroupSelection]);

  const loadRolesAndGroups = async () => {
    try {
      const [rolesResponse, groupsResponse] = await Promise.all([
        roleManagementApi.getRoles({ maxResultCount: 100 }),
        groupManagementApi.getGroups({ maxResultCount: 100 })
      ]);
      setAvailableRoles(rolesResponse.items.filter(role => role.isActive));
      setAvailableGroups(groupsResponse.items.filter(group => group.isActive));
    } catch (err) {
      console.error('Failed to load roles and groups:', err);
    }
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    return {
      score,
      feedback,
      isValid: score >= 4
    };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.isValid) {
      errors.password = 'Password does not meet strength requirements';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterUserDto, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check password strength if password field
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value as string));
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    const currentRoles = formData.roleIds || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    handleInputChange('roleIds', newRoles);
  };

  const handleGroupToggle = (groupId: string) => {
    const currentGroups = formData.groupIds || [];
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter(id => id !== groupId)
      : [...currentGroups, groupId];
    handleInputChange('groupIds', newGroups);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authApi.register(formData);
      onRegisterSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // Handle specific validation errors from API
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            {allowRoleGroupSelection ? 'Create a new user account with roles and groups' : 'Sign up to get started'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`pl-10 ${validationErrors.username ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-red-500">{validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`pl-10 ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.phoneNumber && (
                <p className="text-sm text-red-500">{validationErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{getPasswordStrengthText(passwordStrength.score)}</span>
                  </div>
                  
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p>Password must include:</p>
                      <ul className="list-none space-y-1 ml-2">
                        {passwordStrength.feedback.map((requirement, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <X className="h-3 w-3 text-red-500" />
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {allowRoleGroupSelection && (
              <>
                {availableRoles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map(role => (
                        <Badge
                          key={role.id}
                          variant={formData.roleIds?.includes(role.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleRoleToggle(role.id)}
                        >
                          {role.name}
                          {formData.roleIds?.includes(role.id) && (
                            <Check className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {availableGroups.length > 0 && (
                  <div className="space-y-2">
                    <Label>Groups</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableGroups.map(group => (
                        <Badge
                          key={group.id}
                          variant={formData.groupIds?.includes(group.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleGroupToggle(group.id)}
                        >
                          {group.name}
                          {formData.groupIds?.includes(group.id) && (
                            <Check className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordStrength.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>

            {onLoginClick && (
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};