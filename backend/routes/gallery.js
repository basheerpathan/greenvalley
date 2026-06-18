const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getGallery, uploadPhotos, deletePhoto, updatePhoto } = require('../controllers/galleryController');
const { upload } = require('../config/cloudinary');

router.get('/', getGallery);

router.post('/', 
  protect, 
  authorize('Admin', 'Staff'), 
  (req, res, next) => {
    req.uploadFolder = 'gallery';
    next();
  }, 
  upload.array('photos', 20), 
  uploadPhotos
);

router.route('/:id')
  .put(protect, authorize('Admin'), updatePhoto)
  .delete(protect, authorize('Admin'), deletePhoto);

module.exports = router;