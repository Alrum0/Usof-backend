const Router = require('express');
const router = Router();
const AuthController = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimit');

router.post('/register', AuthController.registration); // OK
router.get('/verify', AuthController.verifyEmail); // OK
router.post('/login', loginLimiter, AuthController.login); // OK
router.post('/refresh', AuthController.refresh); // OK
router.post('/logout', AuthController.logout); // OK
router.post('/password-reset', AuthController.passwordReset); // OK
router.post('/password-reset/:confirm_token', AuthController.confirmToken); // OK

module.exports = router;
