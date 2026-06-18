const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  photos: [{
    url: String,
    publicId: String
  }],
  category: {
    type: String,
    enum: ['Event', 'Achievement', 'Milestone', 'Workshop', 'Awareness'],
    default: 'Event'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

eventSchema.virtual('isUpcoming').get(function () {
  return new Date(this.date) > new Date();
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
