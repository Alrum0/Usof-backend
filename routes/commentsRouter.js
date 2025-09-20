const Router = require('express');
const router = new Router();
const CommentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:comment_id', CommentController.getComment); // OK
router.get('/:comment_id/like', CommentController.getAllLikesForComment); // OK
router.post('/:comment_id/like', authMiddleware, CommentController.createLikeForComment); // OK
router.patch('/:comment_id', authMiddleware, CommentController.updateComment); // OK
router.delete('/:comment_id', authMiddleware, CommentController.deleteComment); // OK
router.delete('/:comment_id/like', authMiddleware, CommentController.deleteLikeForComment); // OK

module.exports = router;
