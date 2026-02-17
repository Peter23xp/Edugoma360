import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { LoginDto, ChangePasswordDto } from './auth.dto';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = LoginDto.parse(req.body);
            const result = await authService.login(data);

            // Set httpOnly cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 8 * 60 * 60 * 1000, // 8 hours
            });

            res.json({ data: result });
        } catch (error) {
            if (error instanceof Error && error.message === 'Identifiants invalides') {
                res.status(401).json({
                    error: { code: 'INVALID_CREDENTIALS', message: error.message },
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
        res.clearCookie('token');
        res.json({ data: { message: 'Déconnexion réussie' } });
    }
}

export const authController = new AuthController();
