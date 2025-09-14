const Router = require('express');
const router = new Router();
const CommentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:comment_id', CommentController.getComment);
router.get('/:comment_id/like', CommentController.getAllLikesForComment);
router.post('/:comment_id/like',authMiddleware, CommentController.createLikeForComment);
router.patch('/:comment_id', CommentController.updateComment);
router.delete('/:comment_id', CommentController.deleteComment);
router.delete('/:comment_id/like',authMiddleware, CommentController.deleteLikeForComment);

module.exports = router;
