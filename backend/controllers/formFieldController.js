const FormField = require('../models/FormField');

exports.getFields = async (req, res) => {
  try {
    const { formType } = req.params;
    const fields = await FormField.find({ formType, isActive: true }).sort({ order: 1 });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createField = async (req, res) => {
  try {
    const { formType } = req.params;
    const { label, fieldType, options, isRequired } = req.body;
    const fieldKey = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const maxOrder = await FormField.findOne({ formType, isActive: true }).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;
    const field = await FormField.create({
      formType,
      label,
      fieldKey,
      fieldType,
      options: options || [],
      order,
      isRequired: isRequired || false
    });
    const io = req.app.get('io');
    io.emit('fields:updated', { formType, action: 'created', field });
    res.status(201).json(field);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A field with this key already exists for this form' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateField = async (req, res) => {
  try {
    const { formType } = req.params;
    const field = await FormField.findOneAndUpdate(
      { _id: req.params.fieldId, formType },
      req.body,
      { new: true, runValidators: true }
    );
    if (!field) return res.status(404).json({ message: 'Field not found' });
    const io = req.app.get('io');
    io.emit('fields:updated', { formType, action: 'updated', field });
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteField = async (req, res) => {
  try {
    const { formType } = req.params;
    const field = await FormField.findOneAndUpdate(
      { _id: req.params.fieldId, formType },
      { isActive: false },
      { new: true }
    );
    if (!field) return res.status(404).json({ message: 'Field not found' });
    const io = req.app.get('io');
    io.emit('fields:updated', { formType, action: 'deleted', fieldId: req.params.fieldId });
    res.json({ message: 'Field deleted (soft)', field });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorderFields = async (req, res) => {
  try {
    const { formType } = req.params;
    const { orderedIds } = req.body;
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id, formType }, update: { order: index } }
    }));
    await FormField.bulkWrite(bulkOps);
    const fields = await FormField.find({ formType, isActive: true }).sort({ order: 1 });
    const io = req.app.get('io');
    io.emit('fields:updated', { formType, action: 'reordered', fields });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
