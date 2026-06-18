const FollowUp = require('../models/FollowUp');

exports.createFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.create(req.body);
    await followUp.populate('patientId', 'fullName patientId');
    const io = req.app.get('io');
    io.emit('followup:created', followUp);
    res.status(201).json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFollowUps = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await FollowUp.countDocuments(query);
    const followUps = await FollowUp.find(query)
      .populate('patientId', 'fullName patientId')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ followUps, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ patientId: req.params.patientId })
      .sort({ date: -1 });
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('patientId', 'fullName patientId');
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
    const io = req.app.get('io');
    io.emit('followup:updated', followUp);
    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFollowUp = async (req, res) => {
  try {
    await FollowUp.findByIdAndDelete(req.params.id);
    res.json({ message: 'Follow-up deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
