const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  dosage: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date, required: true },
  lowStockThreshold: { type: Number, default: 10 },
  manufacturer: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

medicineSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
