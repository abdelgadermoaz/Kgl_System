import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kgl_groceries';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('⏳ Connected to MongoDB. Starting database seed...');

    // 1. Clear existing users to prevent duplicates if you run this multiple times
    await User.deleteMany({});
    console.log('🧹 Cleared existing users.');

    // 2. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashManager = await bcrypt.hash('manager123', salt);
    const hashAgent = await bcrypt.hash('agent123', salt);
    const hashDirector = await bcrypt.hash('director123', salt);

    // 3. Define the Demo Users
    const users = [
      { name: 'KGL Manager', email: 'manager@kgl.com', password: hashManager, role: 'MANAGER' },
      { name: 'KGL Sales Agent', email: 'agent@kgl.com', password: hashAgent, role: 'SALES_AGENT' },
      { name: 'KGL Director', email: 'director@kgl.com', password: hashDirector, role: 'DIRECTOR' }
    ];

    // 4. Insert into the database
    await User.insertMany(users);
    console.log('✅ Demo users seeded successfully!');
    
    // 5. Exit the script successfully
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();