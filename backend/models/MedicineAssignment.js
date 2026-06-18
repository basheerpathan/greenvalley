const mongoose = require('mongoose');

const medicineAssignmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  schedule: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  },
  dosageNote: { type: String },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MedicineAssignment', medicineAssignmentSchema);
