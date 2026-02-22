import express from 'express';
import Sale from '../models/Sale.js';
import Inventory from '../models/Inventory.js';
import Expense from '../models/Expense.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', requireAuth, requireRole(['DIRECTOR']), async (req, res) => {
  try {
    // 1. Calculate Total Revenue
    const sales = await Sale.find();
    const totalRevenueUgx = sales.reduce((sum, sale) => sum + sale.totalAmountUgx, 0);
    const totalPendingCreditUgx = sales.reduce((sum, sale) => sum + (sale.amountDueUgx || 0), 0);

    // 2. Calculate Total Inventory Value
    const inventory = await Inventory.find();
    const totalInventoryValueUgx = inventory.reduce((sum, item) => sum + (item.quantityKg * item.sellingPriceUgx), 0);

    // 3. NEW: Calculate Total Operating Expenses
    const expenses = await Expense.find();
    const totalExpensesUgx = expenses.reduce((sum, exp) => sum + exp.amountUgx, 0);

    // 4. NEW: Calculate Net Profit
    // Note: In a full ERP, you would also subtract Procurement Costs (Cost of Goods Sold). 
    // For now, Net Profit = Revenue - Operating Expenses
    const netProfitUgx = totalRevenueUgx - totalExpensesUgx;

    res.json({
      totalRevenueUgx,
      totalPendingCreditUgx,
      totalInventoryValueUgx,
      totalExpensesUgx,
      netProfitUgx
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating report' });
  }
});

export default router;