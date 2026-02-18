import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));
router.put('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));

// Password reset via SMS OTP
router.post('/forgot-password', authLimiter, (req, res, next) => authController.sendOtp(req, res, next));
router.post('/verify-otp', authLimiter, (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/reset-password', authLimiter, (req, res, next) => authController.resetPassword(req, res, next));

export default router;
