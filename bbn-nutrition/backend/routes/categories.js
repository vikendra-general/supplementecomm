const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', categoryController.getCategories);

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', categoryController.getCategory);

module.exports = router;