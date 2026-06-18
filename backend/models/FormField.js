const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  formType: {
    type: String,
    enum: ['patient-in', 'patient-out', 'follow-up'],
    required: true
  },
  label: { type: String, required: true, trim: true },
  fieldKey: { type: String, required: true, trim: true },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'textarea'],
    required: true
  },
  options: [{ type: String }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isRequired: { type: Boolean, default: false }
}, { timestamps: true });

formFieldSchema.index({ formType: 1, fieldKey: 1 }, { unique: true });

module.exports = mongoose.model('FormField', formFieldSchema);
