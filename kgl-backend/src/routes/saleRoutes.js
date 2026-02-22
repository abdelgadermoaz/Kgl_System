import express from 'express';
// Notice the new function added inside the brackets on the line below:
import { createSale, getSales, updateCreditPayment } from '../controllers/saleController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole(['MANAGER', 'SALES_AGENT']), createSale);
router.get('/', requireAuth, requireRole(['MANAGER', 'SALES_AGENT', 'DIRECTOR']), getSales);

// NEW ROUTE: Accept payment for a specific sale ID
router.post('/:id/pay', requireAuth, requireRole(['MANAGER', 'SALES_AGENT']), updateCreditPayment);

export default router;