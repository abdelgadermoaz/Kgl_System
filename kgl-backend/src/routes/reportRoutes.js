import express from 'express';
import Sale from '../models/Sale.js';
import Inventory from '../models/Inventory.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/v1/reports/summary
router.get('/summary', requireAuth, requireRole(['MANAGER', 'DIRECTOR']), async (req, res) => {
  try {
    // Calculate Total Sales Revenue
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmountUgx" }, totalDue: { $sum: "$amountDueUgx" } } }
    ]);

    // Calculate Total Inventory Value
    const invAgg = await Inventory.aggregate([
      { $project: { itemValue: { $multiply: ["$quantityKg", "$sellingPriceUgx"] } } },
      { $group: { _id: null, totalInventoryValue: { $sum: "$itemValue" } } }
    ]);

    res.json({
      totalRevenueUgx: salesAgg[0]?.totalRevenue || 0,
      totalPendingCreditUgx: salesAgg[0]?.totalDue || 0,
      totalInventoryValueUgx: invAgg[0]?.totalInventoryValue || 0,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

export default router;