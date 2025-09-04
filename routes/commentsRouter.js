const Router = require('express');
const router = new Router();
const CommentController = require('../controllers/CommentController');

router.get('/:comment_id', CommentController.getComment);
router.get('/:comment_id/like', CommentController.getAllLikesForComment);
router.get('/:comment_id/like', CommentController.createLikeForComment);
router.patch('/:comment_id', CommentController.updateComment);
router.delete('/:comment_id', CommentController.deleteComment);
router.delete('/:comment_id/like', CommentController.deleteLikeForComment);

module.exports = router;
