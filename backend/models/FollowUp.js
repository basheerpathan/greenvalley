const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, required: true },
  time: { type: String },
  type: { type: String, enum: ['Call', 'Visit', 'Video'], required: true },
  staffResponsible: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  notes: { type: String },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);
