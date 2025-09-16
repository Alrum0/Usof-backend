const Router = require('express');
const router = Router();
const AuthController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimit');

router.post('/register', AuthController.registration);
router.get('/verify', AuthController.verifyEmail);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout);
router.post('/password-reset', AuthController.passwordReset);
router.post('/password-reset/:confirm_token', AuthController.confirmToken);

module.exports = router;
