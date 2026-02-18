import { Request, Response, NextFunction } from 'express';
import { authService, AuthError } from './auth.service';
import { LoginDto, RefreshTokenDto, ChangePasswordDto } from './auth.dto';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = LoginDto.parse(req.body);
            const result = await authService.login(data);

            // ── Set refreshToken as httpOnly cookie ────────────────────────
            const cookieMaxAge = result.rememberMe
                ? 30 * 24 * 60 * 60 * 1000  // 30 days
                : undefined;                 // session cookie (closes with browser)

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
                maxAge: cookieMaxAge,
            });

            // NEVER return refreshToken in the body
            const { refreshToken, rememberMe, ...responseData } = result;

            res.json({ data: responseData });
        } catch (error) {
            if (error instanceof AuthError) {
                const statusCode = error.code === 'ACCOUNT_LOCKED' ? 423 : 401;
                res.status(statusCode).json({
                    error: { code: error.code, message: error.message },
                });
                return;
            }
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            // Read refreshToken from cookie
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({
                    error: { code: 'NO_REFRESH_TOKEN', message: 'Token de rafraîchissement absent.' },
                });
                return;
            }

            const result = await authService.refresh(refreshToken);
            res.json({ data: result });
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(401).json({
                    error: { code: error.code, message: error.message },
                });
                return;
            }
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getProfile(req.user!.userId);
            res.json({ data: user });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const data = ChangePasswordDto.parse(req.body);
            const result = await authService.changePassword(req.user!.userId, data);
            res.json({ data: result });
        } catch (error) {
            if (error instanceof Error && error.message === 'Mot de passe actuel incorrect') {
                res.status(400).json({
                    error: { code: 'INVALID_PASSWORD', message: error.message },
                });
                return;
            }
            next(error);
        }
    }

    async logout(_req: Request, res: Response) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth',
        });
        res.json({ data: { message: 'Déconnexion réussie' } });
    }

    async sendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone } = req.body;
            
            if (!phone) {
                res.status(400).json({
                    error: { code: 'MISSING_PHONE', message: 'Numéro de téléphone requis' },
                });
                return;
            }

            const result = await authService.sendOtp(phone);
            res.json(result);
        } catch (error) {
            if (error instanceof AuthError) {
                const statusCode = error.code === 'PHONE_NOT_FOUND' ? 404 : 400;
                res.status(statusCode).json({
                    error: { code: error.code, message: error.message },
                });
                return;
            }
            next(error);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone, otp } = req.body;
            
            if (!phone || !otp) {
                res.status(400).json({
                    error: { code: 'MISSING_FIELDS', message: 'Téléphone et code requis' },
                });
                return;
            }

            const result = await authService.verifyOtp(phone, otp);
            res.json(result);
        } catch (error) {
            if (error instanceof AuthError) {
                const statusCode = error.code === 'OTP_EXPIRED' ? 410 : 400;
                res.status(statusCode).json({
                    error: { code: error.code, message: error.message },
                });
                return;
            }
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { resetToken, newPassword } = req.body;
            
            if (!resetToken || !newPassword) {
                res.status(400).json({
                    error: { code: 'MISSING_FIELDS', message: 'Token et nouveau mot de passe requis' },
                });
                return;
            }

            const result = await authService.resetPassword(resetToken, newPassword);
            res.json(result);
        } catch (error) {
            if (error instanceof AuthError) {
                const statusCode = error.code === 'INVALID_RESET_TOKEN' ? 401 : 400;
                res.status(statusCode).json({
                    error: { code: error.code, message: error.message },
                });
                return;
            }
            next(error);
        }
    }
}

export const authController = new AuthController();
