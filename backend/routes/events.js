const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getEvents, createEvent, updateEvent, deleteEvent, deleteEventPhoto } = require('../controllers/eventController');
const { upload } = require('../config/cloudinary');

router.get('/', getEvents);
router.post('/', protect, authorize('Admin'), (req, res, next) => {
  req.uploadFolder = 'events';
  next();
}, upload.array('photos', 10), createEvent);
router.put('/:id', protect, authorize('Admin'), (req, res, next) => {
  req.uploadFolder = 'events';
  next();
}, upload.array('photos', 10), updateEvent);
router.delete('/:id', protect, authorize('Admin'), deleteEvent);
router.delete('/:id/photos', protect, authorize('Admin'), deleteEventPhoto);

module.exports = router;
