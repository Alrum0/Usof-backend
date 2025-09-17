const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUser);
router.post('/', userController.createUser); // authMiddleware,
router.patch('/avatar', authMiddleware, userController.uploadAvatar);
router.patch('/:user_id', userController.updateUser); //authMiddleware,
router.delete('/:user_id', userController.deleteUser); //authMiddleware,
// ---- ------ ------ ----
router.get('/:user_id/stars', userController.getUserStars);
router.post('/stars', authMiddleware, userController.addStars);
// ---- ------ ------ ----
router.post('/:user_id/follow', authMiddleware, userController.followUser);
router.delete('/:user_id/unfollow', authMiddleware, userController.unfollowUser);
router.get('/:user_id/followers', userController.getFollowers);
router.get('/:user_id/following', userController.getFollowing);
// ---- ------ ------ ----
router.get('/:user_id/rating', userController.getUserRating);

module.exports = router;
