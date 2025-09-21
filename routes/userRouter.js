const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userController.getAllUsers); // admin OK 
router.get('/:user_id', userController.getUser); // OK
router.post('/', authMiddleware, userController.createUser); // admin OK
router.patch('/avatar', authMiddleware, userController.uploadAvatar); // OK
router.patch('/:user_id', authMiddleware, userController.updateUser); // admin OK
router.delete('/:user_id', authMiddleware, userController.deleteUser); // admin OK
// ---- ------ ------ ----
router.get('/:user_id/stars', authMiddleware, userController.getUserStars); // OK
router.post('/stars', authMiddleware, userController.addStars); // OK
// ---- ------ ------ ----
router.post('/:user_id/follow', authMiddleware, userController.followUser); // OK
router.delete('/:user_id/unfollow', authMiddleware, userController.unfollowUser); // OK
router.get('/:user_id/followers', userController.getFollowers); // OK
router.get('/:user_id/following', userController.getFollowing); // OK
// ---- ------ ------ ----
router.get('/:user_id/rating', userController.getUserRating); // OK

module.exports = router;
