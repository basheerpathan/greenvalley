const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCameras, createCamera, updateCamera, deleteCamera } = require('../controllers/cameraController');

router.use(protect);
router.route('/').get(getCameras).post(authorize('Admin'), createCamera);
router.route('/:id').put(authorize('Admin'), updateCamera).delete(authorize('Admin'), deleteCamera);

module.exports = router;
