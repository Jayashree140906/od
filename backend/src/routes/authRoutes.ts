import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.get('/register-meta', AuthController.getRegisterMeta);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.me);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/pending-verifications', requireAuth, AuthController.getPendingVerifications);
router.post('/verify-user/:id', requireAuth, AuthController.verifyUser);
router.get('/demo-users', AuthController.getDemoUsers);

export default router;
