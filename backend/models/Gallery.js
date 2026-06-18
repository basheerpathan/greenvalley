const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  caption: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Events', 'Facilities', 'Staff', 'Activities', 'General'],
    default: 'General'
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
