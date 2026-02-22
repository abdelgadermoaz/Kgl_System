import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 KGL Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });