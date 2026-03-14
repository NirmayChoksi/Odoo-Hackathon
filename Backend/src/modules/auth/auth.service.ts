import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { AuthRepository } from "./auth.repository"
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
  JwtPayload,
} from "./auth.model"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/
const LOGIN_ID_REGEX = /^[a-zA-Z0-9_]{6,12}$/
const OTP_EXPIRY_MINUTES = 10
const SALT_ROUNDS = 12

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function sendOtpEmail(email: string, otp: string) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"Odoo Hackathon" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP for Password Reset",
    html: `
      <h2>Password Reset OTP</h2>
      <p>Your one-time password is:</p>
      <h1 style="letter-spacing:8px">${otp}</h1>
      <p>This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  })
}

export const AuthService = {
  async register(dto: RegisterDto) {
    const { loginId, email, password, confirmPassword } = dto

    if (!LOGIN_ID_REGEX.test(loginId)) {
      return {
        success: false,
        message:
          "Login ID must be 6–12 characters and contain only letters, numbers, or underscores.",
      }
    }

    if (!PASSWORD_REGEX.test(password)) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a special character.",
      }
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." }
    }

    const existingLoginId = await AuthRepository.findByLoginId(loginId)
    if (existingLoginId) {
      return { success: false, message: "Login ID is already taken." }
    }

    const existingEmail = await AuthRepository.findByEmail(email)
    if (existingEmail) {
      return {
        success: false,
        message: "An account with this email already exists.",
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await AuthRepository.createUser({
      loginId,
      email,
      password: hashedPassword,
    })

    return {
      success: true,
      message: "Account created successfully.",
      data: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
      },
    }
  },

  async login(dto: LoginDto) {
    const { loginId, password } = dto

    const user = await AuthRepository.findByLoginId(loginId)
    if (!user) {
      return { success: false, message: "Invalid login ID or password." }
    }

    if (!user.isActive) {
      return { success: false, message: "Your account has been deactivated." }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { success: false, message: "Invalid login ID or password." }
    }

    const payload: JwtPayload = {
      id: user.id,
      loginId: user.loginId,
      email: user.email,
      role: user.role,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    } as jwt.SignOptions)

    return {
      success: true,
      message: "Login successful.",
      data: { token, user: payload },
    }
  },

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto

    const user = await AuthRepository.findByEmail(email)
    if (!user) {
      return {
        success: true,
        message: "If that email is registered, an OTP has been sent to your inbox.",
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    user.otp = hashedOtp
    user.otpExpiresAt = expiresAt
    await AuthRepository.saveUser(user)

    try {
      await sendOtpEmail(email, otp)
    } catch {
      return {
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      }
    }

    return {
      success: true,
      message: "If that email is registered, an OTP has been sent to your inbox.",
    }
  },

  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto

    if (!/^\d{6}$/.test(otp)) {
      return { success: false, message: "OTP must be a 6-digit number." }
    }

    const user = await AuthRepository.findByEmail(email)
    if (!user || !user.otp || !user.otpExpiresAt) {
      return {
        success: false,
        message: "No OTP request found. Please request a new OTP.",
      }
    }

    if (new Date() > user.otpExpiresAt) {
      user.otp = null
      user.otpExpiresAt = null
      await AuthRepository.saveUser(user)
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      }
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp)
    if (!isOtpValid) {
      return { success: false, message: "Invalid OTP." }
    }

    user.otp = null
    user.otpExpiresAt = null
    await AuthRepository.saveUser(user)

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: "password_reset" },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" } as jwt.SignOptions,
    )

    return {
      success: true,
      message: "OTP verified successfully.",
      data: { resetToken },
    }
  },

  async resetPassword(dto: ResetPasswordDto) {
    const { resetToken, password, confirmPassword } = dto

    if (!resetToken) {
      return {
        success: false,
        message: "Reset token is required. Please verify your OTP first.",
      }
    }

    if (!PASSWORD_REGEX.test(password)) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a special character.",
      }
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." }
    }

    let payload: { id: number; email: string; purpose: string }
    try {
      payload = jwt.verify(
        resetToken,
        process.env.JWT_SECRET as string,
      ) as typeof payload
    } catch {
      return {
        success: false,
        message: "Reset token is invalid or has expired. Please request a new OTP.",
      }
    }

    if (payload.purpose !== "password_reset") {
      return { success: false, message: "Invalid reset token." }
    }

    const user = await AuthRepository.findByEmail(payload.email)
    if (!user) {
      return { success: false, message: "User not found." }
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS)
    await AuthRepository.saveUser(user)

    return { success: true, message: "Password has been reset successfully." }
  },
}
