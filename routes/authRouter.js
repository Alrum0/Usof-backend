const Router = require('express');
const router = Router();
const AuthController = require('../controllers/authController');

router.post('/register', AuthController.registration);
router.get('/verify', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/password-reset', AuthController.passwordReset);
router.post('/password-reset/:confirm_token', AuthController.confirmToken);

module.exports = router;
