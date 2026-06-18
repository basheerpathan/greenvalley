const Staff = require('../models/Staff');
const { cloudinary } = require('../config/cloudinary');

exports.getStaff = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    const staff = await Staff.find(query).sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    if (req.file) {
      req.body.photo = req.file.path;
      req.body.photoPublicId = req.file.filename;
    }
    const staff = await Staff.create(req.body);
    const io = req.app.get('io');
    io.emit('staff:updated', { action: 'created', staff });
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const existing = await Staff.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Staff not found' });
    if (req.file) {
      if (existing.photoPublicId) {
        await cloudinary.uploader.destroy(existing.photoPublicId);
      }
      req.body.photo = req.file.path;
      req.body.photoPublicId = req.file.filename;
    }
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    const io = req.app.get('io');
    io.emit('staff:updated', { action: 'updated', staff });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    if (staff.photoPublicId) {
      await cloudinary.uploader.destroy(staff.photoPublicId);
    }
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    const io = req.app.get('io');
    io.emit('staff:updated', { action: 'deleted', staffId: req.params.id });
    res.json({ message: 'Staff member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
