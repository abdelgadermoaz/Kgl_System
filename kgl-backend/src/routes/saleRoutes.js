import express from 'express';
import { createSale, getSales } from '../controllers/saleController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Only MANAGER and SALES_AGENT can CREATE sales
router.post('/', requireAuth, requireRole(['MANAGER', 'SALES_AGENT']), createSale);

// Manager, Sales Agent, AND DIRECTOR can VIEW sales
router.get('/', requireAuth, requireRole(['MANAGER', 'SALES_AGENT', 'DIRECTOR']), getSales);

export default router;