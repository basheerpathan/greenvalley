const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPatient, getPatients, getPatient, updatePatient,
  dischargePatient, deletePatient, getStats
} = require('../controllers/patientController');

router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getPatients).post(authorize('Admin', 'Staff'), createPatient);
router.route('/:id').get(getPatient).put(authorize('Admin', 'Staff'), updatePatient).delete(authorize('Admin'), deletePatient);
router.put('/:id/discharge', authorize('Admin', 'Staff'), dischargePatient);

module.exports = router;
