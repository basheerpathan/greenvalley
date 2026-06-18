const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { upload } = require('../config/cloudinary');

router.get('/', getStaff);
router.post('/', protect, authorize('Admin'), (req, res, next) => {
  req.uploadFolder = 'staff';
  next();
}, upload.single('photo'), createStaff);
router.put('/:id', protect, authorize('Admin'), (req, res, next) => {
  req.uploadFolder = 'staff';
  next();
}, upload.single('photo'), updateStaff);
router.delete('/:id', protect, authorize('Admin'), deleteStaff);

module.exports = router;
