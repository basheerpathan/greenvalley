const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['Doctor', 'Counselor', 'Nurse', 'Admin', 'Support'],
    required: true
  },
  photo: { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
  contact: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  qualification: { type: String },
  joiningDate: { type: Date, required: true },
  bio: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
