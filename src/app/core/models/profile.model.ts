export interface AdminUserSummaryResponse {
  id: string;
  name: string;
  email: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityProfile {
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  lastLoginUserAgent?: string;
}

export interface MfaSetupResponse {
  token: string;
  otpAuthUri: string;
}

export interface MfaConfirmRequest {
  code: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
}

export interface ChangeEmailRequest {
  email: string;
  confirmEmail: string;
}

export interface ChangePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface DisableMfaRequest {
  code: string;
}

