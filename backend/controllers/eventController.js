const Event = require('../models/Event');
const { cloudinary } = require('../config/cloudinary');

exports.getEvents = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    const events = await Event.find(query).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, photos: [] };
    if (req.files && req.files.length > 0) {
      eventData.photos = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    }
    const event = await Event.create(eventData);
    const io = req.app.get('io');
    io.emit('events:updated', { action: 'created', event });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(f => ({ url: f.path, publicId: f.filename }));
      const existing = await Event.findById(req.params.id);
      updateData.photos = [...(existing.photos || []), ...newPhotos];
    }
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const io = req.app.get('io');
    io.emit('events:updated', { action: 'updated', event });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    for (const photo of event.photos) {
      if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    }
    await Event.findByIdAndUpdate(req.params.id, { isActive: false });
    const io = req.app.get('io');
    io.emit('events:updated', { action: 'deleted', eventId: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEventPhoto = async (req, res) => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $pull: { photos: { publicId } } },
      { new: true }
    );
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
