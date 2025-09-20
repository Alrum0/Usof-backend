const Router = require('express');
const router = new Router();
const StarController = require('../controllers/starController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:post_id', authMiddleware, StarController.giveStars); // OK

module.exports = router;