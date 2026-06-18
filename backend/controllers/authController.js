const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate Access and Refresh JWT Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
  return { accessToken, refreshToken };
};

// ==========================================
//              USER REGISTRATION
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // 1. Create user document (This triggers userSchema.pre('save') for single hashing)
    const user = await User.create({ name, email, password, role: role || 'Viewer' });
    
    // 2. Generate authentication tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // 3. Save refresh token directly to database without re-triggering .save() password hooks
    await User.findByIdAndUpdate(user._id, { refreshToken });
    
    res.status(201).json({
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//                USER LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Fetch user and explicitly demand the hidden password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate fresh tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token directly to database without re-triggering .save() password hooks
    await User.findByIdAndUpdate(user._id, { refreshToken });
    
    res.json({
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//             JWT TOKEN REFRESH
// ==========================================
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    const tokens = generateTokens(user._id);
    
    // Update refresh token directly in database
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
    
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// ==========================================
//                USER LOGOUT
// ==========================================
exports.logout = async (req, res) => {
  try {
    // Clear out refresh token from the database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//             GET CURRENT PROFILE
// ==========================================
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// ==========================================
//          GET ALL USERS (ADMIN ONLY)
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//          UPDATE USER (ADMIN ONLY)
// ==========================================
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password; // Hashing will trigger here safely as it's intended
    
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//          DELETE USER (ADMIN ONLY)
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};