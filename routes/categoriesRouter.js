const Router = require('express');
const router = new Router();
const CategoriesController = require('../controllers/categoriesController');

router.get('/', CategoriesController.getAllCategories);
router.get('/:category_id', CategoriesController.getCategory);
router.get('/:category_id/posts', CategoriesController.getAllPostsForCategory);
router.post('/', CategoriesController.createCategory);
router.patch('/:category_id', CategoriesController.updateCategory);
router.delete('/:category_id', CategoriesController.deleteCategory);

module.exports = router;
