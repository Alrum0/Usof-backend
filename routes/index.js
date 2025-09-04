const Router = require('express');
const router = new Router();

const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const postRouter = require('./postsRouter');
const categoriesRouter = require('./categoriesRouter');
const commentRouter = require('./commentsRouter');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/categories', categoriesRouter);
router.use('/comments', commentRouter);

module.exports = router;
