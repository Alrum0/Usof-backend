const Router = require('express');
const router = new Router();
const StarController = require('../controllers/starController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:post_id',authMiddleware, StarController.giveStars);
//FIXME: на подумати
 router.get('/:post_id', StarController.getAllStarsForPost);

module.exports = router;