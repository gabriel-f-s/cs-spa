export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  mfaRequired: boolean;
  mfaToken: string | null;
  status: string;
}

export interface MfaVerifyRequest {
  token: string;
  code: string;
}

export interface RefreshRequest {
  refreshToken: string | null;
}

export interface FirstPasswordChangedRequest {
  password: string;
  confirmPassword: string;
  tempToken: string;
}
