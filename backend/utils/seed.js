require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Content = require('../models/Content');

const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@greenvalley.org' });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin User',
      email: 'admin@greenvalley.org',
      password: 'Admin@123',
      role: 'Admin'
    });
    console.log('✅ Admin user created: admin@greenvalley.org / Admin@123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  const existingStaff = await User.findOne({ email: 'staff@greenvalley.org' });
  if (!existingStaff) {
    await User.create({
      name: 'Staff User',
      email: 'staff@greenvalley.org',
      password: 'Staff@123',
      role: 'Staff'
    });
    console.log('✅ Staff user created: staff@greenvalley.org / Staff@123');
  }

  const contentTypes = ['hero', 'mission', 'stats', 'testimonials', 'about', 'achievement', 'contact-info'];
  for (const type of contentTypes) {
    const existing = await Content.findOne({ type });
    if (!existing) {
      await Content.create({ type, data: {} });
    }
  }

  console.log('✅ Database seeded successfully');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
