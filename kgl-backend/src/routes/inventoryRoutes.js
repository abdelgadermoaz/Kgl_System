import express from 'express';
import Inventory from '../models/Inventory.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/inventory (All authenticated users can view inventory)
router.get('/', requireAuth, async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ produceName: 1 });
    res.json(inventory);
  } catch (error) {
    console.error('Inventory Fetch Error:', error);
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
});

export default router;