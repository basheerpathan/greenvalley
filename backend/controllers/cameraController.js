const Camera = require('../models/Camera');

exports.getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find({ isActive: true }).sort({ order: 1 });
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCamera = async (req, res) => {
  try {
    const maxOrder = await Camera.findOne().sort({ order: -1 });
    req.body.order = maxOrder ? maxOrder.order + 1 : 0;
    const camera = await Camera.create(req.body);
    res.status(201).json(camera);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCamera = async (req, res) => {
  try {
    const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!camera) return res.status(404).json({ message: 'Camera not found' });
    res.json(camera);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCamera = async (req, res) => {
  try {
    await Camera.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Camera removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
