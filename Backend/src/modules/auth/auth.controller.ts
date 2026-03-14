import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOtpDto } from './auth.model';

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const dto: RegisterDto = req.body;
      const result = await AuthService.register(dto);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const dto: LoginDto = req.body;
      const result = await AuthService.login(dto);
      res.status(result.success ? 200 : 401).json(result);
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const dto: ForgotPasswordDto = req.body;
      const result = await AuthService.forgotPassword(dto);
      res.status(result.success ? 200 : 500).json(result);
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  async verifyOtp(req: Request, res: Response) {
    try {
      const dto: VerifyOtpDto = req.body;
      const result = await AuthService.verifyOtp(dto);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },
};
