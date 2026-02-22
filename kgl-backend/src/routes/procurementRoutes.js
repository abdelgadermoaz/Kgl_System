import express from 'express';
import Procurement from '../models/Procurement.js';
import Inventory from '../models/Inventory.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/v1/procurements (MANAGER ONLY)
router.post('/', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  try {
    const { produceName, produceType, tonnageKg, costUgx, sellingPriceUgx, dealerName, branch } = req.body;

    // 1. Create the Procurement Record
    const newProcurement = new Procurement({
      produceName, produceType, tonnageKg, costUgx, sellingPriceUgx, dealerName, branch,
      createdBy: req.user.id
    });
    await newProcurement.save();

    // 2. Update existing inventory OR create new inventory item
    let inventoryItem = await Inventory.findOne({ produceName, branch });
    
    if (inventoryItem) {
      inventoryItem.quantityKg += tonnageKg;
      inventoryItem.sellingPriceUgx = sellingPriceUgx; // Update to latest selling price
      await inventoryItem.save();
    } else {
      inventoryItem = new Inventory({
        produceName, produceType, branch, quantityKg: tonnageKg, sellingPriceUgx
      });
      await inventoryItem.save();
    }

    res.status(201).json({ message: 'Procurement recorded successfully', procurement: newProcurement });
  } catch (error) {
    console.error('Procurement Error:', error);
    res.status(500).json({ message: 'Server error processing procurement' });
  }
});

// GET /api/v1/procurements
router.get('/', requireAuth, requireRole(['MANAGER']), async (req, res) => {
  try {
    const procurements = await Procurement.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching procurements' });
  }
});

export default router;