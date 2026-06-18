const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitContact, getContacts, markRead, deleteContact } = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', protect, authorize('Admin', 'Staff'), getContacts);
router.put('/:id', protect, authorize('Admin', 'Staff'), markRead);
router.delete('/:id', protect, authorize('Admin'), deleteContact);

module.exports = router;
