const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: String, required: true },
  addictionType: { type: String, required: true },
  admissionDate: { type: Date, required: true, default: Date.now },
  assignedDoctor: { type: String },
  emergencyContactName: { type: String, required: true },
  emergencyContactNumber: { type: String, required: true },
  wardNumber: { type: String },
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  dischargeDate: { type: Date },
  dischargeCondition: {
    type: String,
    enum: ['Recovered', 'Against Advice', 'Referred', ''],
    default: ''
  },
  dischargeNotes: { type: String },
  authorizedStaff: { type: String },
  followUpSchedule: { type: String },
  dischargeCustomFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['admitted', 'discharged'], default: 'admitted' },
  patientId: { type: String, unique: true }
}, { timestamps: true });

patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `GVF-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
