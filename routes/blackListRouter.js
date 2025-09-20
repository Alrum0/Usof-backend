const Router = require('express');
const router = new Router();
const BlackListController = require('../controllers/blackListController')
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, BlackListController.getBlackList); // OK
router.post('/', authMiddleware, BlackListController.addToBlackList); // OK
router.delete('/:user_id', authMiddleware, BlackListController.removeFromBlackList); // OK


module.exports = router;