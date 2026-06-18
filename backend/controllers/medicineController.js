const Medicine = require('../models/Medicine');
const MedicineAssignment = require('../models/MedicineAssignment');

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true }).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true });
    const lowStock = medicines.filter(m => m.stockQuantity <= m.lowStockThreshold);
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const query = patientId ? { patientId, isActive: true } : { isActive: true };
    const assignments = await MedicineAssignment.find(query)
      .populate('patientId', 'fullName patientId')
      .populate('medicineId', 'name dosage type');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const assignment = await MedicineAssignment.create(req.body);
    await assignment.populate('patientId', 'fullName patientId');
    await assignment.populate('medicineId', 'name dosage type');
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await MedicineAssignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }).populate('patientId', 'fullName patientId').populate('medicineId', 'name dosage type');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await MedicineAssignment.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
