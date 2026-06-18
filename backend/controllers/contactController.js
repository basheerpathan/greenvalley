const Contact = require('../models/Contact');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    const contact = await Contact.create({ name, email, phone, message });
    const io = req.app.get('io');
    io.emit('contact:new', contact);
    res.status(201).json({ message: 'Message sent successfully. We will get back to you soon.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ contacts, total, unread: await Contact.countDocuments({ isRead: false }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true, replyNote: req.body.replyNote || '' },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Message not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
