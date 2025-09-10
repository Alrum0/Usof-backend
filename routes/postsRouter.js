const Router = require('express');
const router = new Router();
const PostController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', PostController.getAllPosts);
router.get('/:post_id', PostController.getPost);
router.get('/:post_id/comments', PostController.getAllCommentsForPost);
router.post('/:post_id/comments', authMiddleware, PostController.createCommentForPost);
router.get('/:post_id/categories',PostController.getAllCategories);
router.get('/:post_id/like', PostController.getAllLikesForPost);
router.post('/', authMiddleware, PostController.createPost);
router.post('/:post_id/like', authMiddleware, PostController.createLike);
router.patch('/:post_id', PostController.updatePost);
router.delete('/:post_id',  PostController.deletePost);
router.delete('/:post_id/like', PostController.deleteLike);

module.exports = router;
