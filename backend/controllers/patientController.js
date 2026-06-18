const Patient = require('../models/Patient');

exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    const io = req.app.get('io');
    io.emit('patient:created', patient);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { addictionType: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const io = req.app.get('io');
    io.emit('patient:updated', patient);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dischargePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        status: 'discharged',
        dischargeDate: req.body.dischargeDate || new Date()
      },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const io = req.app.get('io');
    io.emit('patient:discharged', patient);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const admitted = await Patient.countDocuments({ status: 'admitted' });
    const discharged = await Patient.countDocuments({ status: 'discharged' });
    const thisMonth = await Patient.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    res.json({ total, admitted, discharged, thisMonth });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
