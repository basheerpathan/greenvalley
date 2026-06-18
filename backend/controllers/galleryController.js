const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

exports.getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    const photos = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const { category, caption } = req.body;
    const photos = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      category: category || 'General',
      caption: caption || '',
      uploadedBy: req.user._id
    }));
    const saved = await Gallery.insertMany(photos);
    const io = req.app.get('io');
    io.emit('gallery:updated', { action: 'uploaded', photos: saved });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    await cloudinary.uploader.destroy(photo.publicId);
    await Gallery.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    io.emit('gallery:updated', { action: 'deleted', photoId: req.params.id });
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePhoto = async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) return res.status(404).json({ message: 'Photo not found' });
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
