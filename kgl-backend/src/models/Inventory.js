import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  produceType: { type: String },
  branch: { type: String, required: true },
  quantityKg: { type: Number, required: true, default: 0 },
  sellingPriceUgx: { type: Number, required: true },
  lowStockThresholdKg: { type: Number, default: 50 }
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);