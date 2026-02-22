import express from 'express';
import Expense from '../models/Expense.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses (Managers & Directors)
router.get('/', requireAuth, requireRole(['MANAGER', 'DIRECTOR']), async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
});

// Record a new expense (Managers & Directors)
router.post('/', requireAuth, requireRole(['MANAGER', 'DIRECTOR']), async (req, res) => {
  try {
    const { category, amountUgx, description, branch } = req.body;
    
    const newExpense = new Expense({
      category,
      amountUgx,
      description,
      branch: branch || 'Kampala HQ',
      recordedBy: req.user.userId || req.user.id || req.user._id    });

    await newExpense.save();
    res.status(201).json({ message: 'Expense recorded successfully', expense: newExpense });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error recording expense' });
  }
});

export default router;