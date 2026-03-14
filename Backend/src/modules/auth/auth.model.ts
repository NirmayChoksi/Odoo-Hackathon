export interface RegisterDto {
  login_id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  login_id: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface JwtPayload {
  id: number;
  login_id: string;
  email: string;
  role: string;
}
