import Sale from '../models/Sale.js';
import Inventory from '../models/Inventory.js';
import { createSaleSchema } from '../validators/saleValidator.js';

export const createSale = async (req, res) => {
  try {
    const validatedData = createSaleSchema.parse(req.body);
    const { 
      saleType, produceName, tonnageKg, unitPriceUgx, 
      buyerName, nationalIdNIN, amountPaidUgx, dueDate, branch 
    } = validatedData;

    const inventoryItem = await Inventory.findOne({ produceName, branch });
    if (!inventoryItem) return res.status(404).json({ message: 'Produce not found in inventory for this branch' });
    if (inventoryItem.quantityKg < tonnageKg) return res.status(409).json({ message: `Insufficient stock. Only ${inventoryItem.quantityKg}kg available.` });

    const totalAmountUgx = tonnageKg * unitPriceUgx;
    let amountDueUgx = 0;
    let creditStatus = null;

    if (saleType === 'CASH') {
      if (amountPaidUgx !== totalAmountUgx) return res.status(400).json({ message: 'For CASH sales, amount paid must equal total amount' });
    } else if (saleType === 'CREDIT') {
      amountDueUgx = totalAmountUgx - amountPaidUgx;
      creditStatus = amountDueUgx > 0 ? 'PENDING' : 'PAID';
    }

    const newSale = new Sale({
      saleType, produceName, produceType: inventoryItem.produceType, tonnageKg, unitPriceUgx,
      totalAmountUgx, buyerName, nationalIdNIN, amountPaidUgx, amountDueUgx, dueDate, creditStatus,
      branch, salesAgentName: req.user.name, createdBy: req.user.id
    });

    await newSale.save();
    inventoryItem.quantityKg -= tonnageKg;
    await inventoryItem.save();

    res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Server error processing sale' });
  }
};

export const getSales = async (req, res) => {
  try {
    const filter = req.query.branch ? { branch: req.query.branch } : {};
    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching sales' });
  }
};

// NEW FUNCTION: Handle paying off credit
export const updateCreditPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentAmount } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    if (sale.saleType !== 'CREDIT') return res.status(400).json({ message: 'Not a credit sale' });
    if (sale.creditStatus === 'PAID') return res.status(400).json({ message: 'Credit is already fully paid' });

    // Update the financials
    sale.amountPaidUgx += paymentAmount;
    sale.amountDueUgx -= paymentAmount;

    // If they paid it all off, change status to PAID
    if (sale.amountDueUgx <= 0) {
      sale.amountDueUgx = 0; 
      sale.creditStatus = 'PAID';
    }

    await sale.save();
    res.json({ message: 'Payment updated successfully', sale });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing payment' });
  }
};