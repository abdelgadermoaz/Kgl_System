import Sale from '../models/Sale.js';
import Inventory from '../models/Inventory.js';
import { createSaleSchema } from '../validators/saleValidator.js';

export const createSale = async (req, res) => {
  try {
    // 1. Validate Input Data
    const validatedData = createSaleSchema.parse(req.body);
    const { 
      saleType, produceName, tonnageKg, unitPriceUgx, 
      buyerName, nationalIdNIN, amountPaidUgx, dueDate, branch 
    } = validatedData;

    // 2. Check if the produce exists in inventory and has enough stock
    const inventoryItem = await Inventory.findOne({ produceName, branch });
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Produce not found in inventory for this branch' });
    }
    if (inventoryItem.quantityKg < tonnageKg) {
      return res.status(409).json({ message: `Insufficient stock. Only ${inventoryItem.quantityKg}kg available.` });
    }

    // 3. Compute Financials
    const totalAmountUgx = tonnageKg * unitPriceUgx;
    let amountDueUgx = 0;
    let creditStatus = null;

    if (saleType === 'CASH') {
      if (amountPaidUgx !== totalAmountUgx) {
        return res.status(400).json({ message: 'For CASH sales, amount paid must equal total amount' });
      }
    } else if (saleType === 'CREDIT') {
      amountDueUgx = totalAmountUgx - amountPaidUgx;
      creditStatus = amountDueUgx > 0 ? 'PENDING' : 'PAID';
    }

    // 4. Create the Sale Record
    const newSale = new Sale({
      saleType,
      produceName,
      produceType: inventoryItem.produceType,
      tonnageKg,
      unitPriceUgx,
      totalAmountUgx,
      buyerName,
      nationalIdNIN,
      amountPaidUgx,
      amountDueUgx,
      dueDate,
      creditStatus,
      branch,
      salesAgentName: req.user.name,
      createdBy: req.user.id
    });

    await newSale.save();

    // 5. Deduct the inventory
    inventoryItem.quantityKg -= tonnageKg;
    await inventoryItem.save();

    res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Sale Creation Error:', error);
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