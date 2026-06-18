const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register, login, refresh, logout, getMe, getUsers, updateUser, deleteUser
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id', protect, authorize('Admin'), updateUser);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
