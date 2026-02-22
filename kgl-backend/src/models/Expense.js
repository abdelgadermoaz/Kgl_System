import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true, 
    enum: ['TRANSPORT', 'RENT', 'SALARIES', 'UTILITIES', 'MAINTENANCE', 'OTHER'] 
  },
  amountUgx: { 
    type: Number, 
    required: true,
    min: 0 
  },
  description: { 
    type: String, 
    required: true 
  },
  branch: { 
    type: String, 
    default: 'Kampala HQ' 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);