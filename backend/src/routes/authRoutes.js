import { Router } from 'express';

import { getMe, login, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateLogin, validateRegister } from '../validators/authValidators.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;
