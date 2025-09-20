const Router = require('express');
const router = new Router();
const CategoriesController = require('../controllers/categoriesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', CategoriesController.getAllCategories); // OK
router.get('/:category_id', CategoriesController.getCategory); // OK
router.get('/:category_id/posts', CategoriesController.getAllPostsForCategory); // OK
router.post('/', authMiddleware, CategoriesController.createCategory); // admin OK
router.patch('/:category_id', authMiddleware, CategoriesController.updateCategory); // admin OK
router.delete('/:category_id', authMiddleware, CategoriesController.deleteCategory); // admin OK

module.exports = router;
