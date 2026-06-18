const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'mission', 'stats', 'testimonial', 'about', 'achievement', 'contact-info'],
    required: true,
    unique: true
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
