const Content = require('../models/Content');

const defaultContent = {
  hero: {
    title: 'Welcome to Green Valley Foundation',
    subtitle: 'A New Beginning, A Better Life',
    tagline: 'Helping individuals overcome addiction and reclaim their lives with compassion, dignity, and expert care.',
    ctaPrimary: 'Get Help Now',
    ctaSecondary: 'Learn More',
    backgroundImage: ''
  },
  mission: {
    mission: 'To provide compassionate, evidence-based treatment for substance use disorders, helping individuals reclaim their lives and reunite with their families.',
    vision: 'A society free from the devastating effects of addiction, where every person has access to the support they need to lead a healthy, fulfilling life.',
    values: ['Compassion', 'Integrity', 'Excellence', 'Community', 'Recovery']
  },
  stats: {
    patientsHelped: 1200,
    yearsActive: 15,
    staffCount: 45,
    successRate: 87
  },
  testimonials: [
    {
      id: 1,
      name: 'Ramesh Kumar',
      text: 'Green Valley Foundation gave me back my life. The staff here are incredibly supportive and caring.',
      role: 'Recovered Patient'
    }
  ],
  about: {
    history: 'Founded in 2009, Green Valley Foundation has been at the forefront of addiction treatment in the region.',
    content: 'We believe in a holistic approach to recovery that addresses the physical, psychological, and social aspects of addiction.',
    image: ''
  },
  achievement: {
    milestones: [
      { year: 2009, text: 'Founded Green Valley Foundation' },
      { year: 2013, text: 'Expanded to 50-bed facility' },
      { year: 2018, text: 'Received National Excellence Award' },
      { year: 2023, text: 'Helped 1000th patient recover' }
    ],
    awards: ['National Healthcare Excellence Award 2018', 'Best Rehabilitation Center 2021']
  },
  'contact-info': {
    address: '123 Green Valley Road, Hyderabad, Telangana 500001',
    phone: '+91 98765 43210',
    email: 'info@greenvalleyfoundation.org',
    mapUrl: '',
    workingHours: 'Mon - Sun: 24/7'
  }
};

exports.getContent = async (req, res) => {
  try {
    const { type } = req.params;
    let content = await Content.findOne({ type });
    if (!content) {
      content = await Content.create({ type, data: defaultContent[type] || {} });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const all = await Content.find();
    const result = {};
    for (const item of all) {
      result[item.type] = item.data;
    }
    for (const [key, val] of Object.entries(defaultContent)) {
      if (!result[key]) result[key] = val;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { type } = req.params;
    const content = await Content.findOneAndUpdate(
      { type },
      { data: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    const io = req.app.get('io');
    io.emit('content:updated', { type, data: content.data });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
