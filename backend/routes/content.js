const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getContent, getAllContent, updateContent } = require('../controllers/contentController');

router.get('/', getAllContent);
router.get('/:type', getContent);
router.put('/:type', protect, authorize('Admin'), updateContent);

module.exports = router;
