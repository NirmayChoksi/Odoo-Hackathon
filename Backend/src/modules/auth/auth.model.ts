export interface RegisterDto {
  loginId: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginDto {
  loginId: string
  password: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface VerifyOtpDto {
  email: string
  otp: string
}

export interface ResetPasswordDto {
  resetToken: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

export interface JwtPayload {
  id: number
  loginId: string
  email: string
  role: string
}
