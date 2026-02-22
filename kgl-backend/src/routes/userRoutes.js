import express from 'express';
import user from '../models/user.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all employees (Director only)
router.get('/', requireAuth, requireRole(['DIRECTOR']), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Create a new employee (Director only)
router.post('/register', requireAuth, requireRole(['DIRECTOR']), async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, branch });
    
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating user' });
  }
});

export default router;