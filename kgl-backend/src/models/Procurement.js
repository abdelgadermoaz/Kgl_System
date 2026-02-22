import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  produceType: { type: String },
  tonnageKg: { type: Number, required: true },
  costUgx: { type: Number, required: true },
  sellingPriceUgx: { type: Number, required: true },
  dealerName: { type: String, required: true },
  branch: { type: String, required: true },
  procurementDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Procurement', procurementSchema);