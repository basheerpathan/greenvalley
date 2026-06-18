const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createFollowUp, getFollowUps, getPatientFollowUps, updateFollowUp, deleteFollowUp
} = require('../controllers/followUpController');

router.use(protect);
router.route('/').get(getFollowUps).post(authorize('Admin', 'Staff'), createFollowUp);
router.get('/patient/:patientId', getPatientFollowUps);
router.route('/:id').put(authorize('Admin', 'Staff'), updateFollowUp).delete(authorize('Admin'), deleteFollowUp);

module.exports = router;
