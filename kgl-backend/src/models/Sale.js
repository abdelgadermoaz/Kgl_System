import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  saleType: { type: String, enum: ['CASH', 'CREDIT'], required: true },
  produceName: { type: String, required: true },
  produceType: { type: String },
  tonnageKg: { type: Number, required: true },
  unitPriceUgx: { type: Number, required: true },
  totalAmountUgx: { type: Number, required: true },
  buyerName: { type: String, required: true },
  nationalIdNIN: { type: String },
  contacts: { type: String },
  location: { type: String },
  amountPaidUgx: { type: Number, required: true },
  amountDueUgx: { type: Number, required: true },
  dueDate: { type: Date },
  creditStatus: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE', null] },
  dispatchDate: { type: Date, default: Date.now },
  branch: { type: String, required: true },
  salesAgentName: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema);