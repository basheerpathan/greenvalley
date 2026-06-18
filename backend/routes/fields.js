const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');
const {
  getFields, createField, updateField, deleteField, reorderFields
} = require('../controllers/formFieldController');

router.use(protect);
router.route('/:formType').get(getFields).post(authorize('Admin'), createField);
router.route('/:formType/reorder').put(authorize('Admin'), reorderFields);
router.route('/:formType/:fieldId').put(authorize('Admin'), updateField).delete(authorize('Admin'), deleteField);

module.exports = router;
