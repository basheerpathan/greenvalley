const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStock,
  getAssignments, createAssignment, updateAssignment, deleteAssignment
} = require('../controllers/medicineController');

router.use(protect);
router.get('/low-stock', getLowStock);
router.route('/').get(getMedicines).post(authorize('Admin', 'Staff'), createMedicine);
router.route('/:id').put(authorize('Admin', 'Staff'), updateMedicine).delete(authorize('Admin'), deleteMedicine);
router.route('/assignments').get(getAssignments).post(authorize('Admin', 'Staff'), createAssignment);
router.route('/assignments/:id').put(authorize('Admin', 'Staff'), updateAssignment).delete(authorize('Admin'), deleteAssignment);

module.exports = router;
