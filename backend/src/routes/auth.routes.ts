import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, registerValidation, loginValidation, refreshTokenValidation } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh', validate(refreshTokenValidation), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
