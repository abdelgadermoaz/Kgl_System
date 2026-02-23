import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Your perfectly corrected import!
import User from './models/user.js'; 
import Inventory from './models/Inventory.js';
import Procurement from './models/Procurement.js';
import Sale from './models/Sale.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seedDummyData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('⏳ Connected to MongoDB. Injecting KGL dummy data...');

    const director = await User.findOne({ email: 'director@kgl.com' });
    const agent = await User.findOne({ email: 'agent@kgl.com' });

    if (!director || !agent) {
      console.log('❌ Error: Users not found. Run seed.js first!');
      process.exit(1);
    }

    await Inventory.deleteMany({});
    await Procurement.deleteMany({});
    await Sale.deleteMany({});
    console.log('🧹 Cleared old records...');

    // 3. Create Dummy Inventory
    const items = await Inventory.insertMany([
      { produceName: 'Premium Maize (100kg)', branch: 'Kampala', quantity: 500, sellingPriceUgx: 120000 },
      { produceName: 'Soya Beans (50kg)', branch: 'Kampala', quantity: 300, sellingPriceUgx: 85000 },
      { produceName: 'Wheat Grain (50kg)', branch: 'Kampala', quantity: 150, sellingPriceUgx: 90000 }
    ]);
    console.log('📦 Inventory populated...');

    // 4. Create Dummy Procurements
    await Procurement.insertMany([
      { produceName: 'Premium Maize (100kg)', tonnageKg: 500, costUgx: 100000, sellingPriceUgx: 120000, dealerName: 'National Grain Ltd', branch: 'Kampala', createdBy: director._id },
      { produceName: 'Soya Beans (50kg)', tonnageKg: 300, costUgx: 70000, sellingPriceUgx: 85000, dealerName: 'Farmers Co-op', branch: 'Kampala', createdBy: director._id }
    ]);
    console.log('🚚 Procurements populated...');

    // 5. Create Dummy Sales
    await Sale.insertMany([
      { 
        produceName: 'Premium Maize (100kg)', 
        tonnageKg: 10, 
        unitPriceUgx: 120000,
        totalAmountUgx: 1200000, 
        amountPaidUgx: 1200000, 
        amountDueUgx: 0, 
        buyerName: 'Local Market', 
        branch: 'Kampala', 
        saleType: 'CASH', // Changed to all caps
        salesAgent: agent._id,
        salesAgentName: agent.name,
        createdBy: agent._id 
      },
      { 
        produceName: 'Soya Beans (50kg)', 
        tonnageKg: 5, 
        unitPriceUgx: 85000,
        totalAmountUgx: 425000, 
        amountPaidUgx: 200000, 
        amountDueUgx: 225000, 
        buyerName: 'City Bakery', 
        branch: 'Kampala', 
        saleType: 'CREDIT', // Changed to all caps
        salesAgent: agent._id,
        salesAgentName: agent.name,
        createdBy: agent._id 
      }
    ]);
    console.log('💰 Sales populated...');

    console.log('✅ KGL Dashboard successfully populated with dummy data!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    process.exit(1);
  }
};

seedDummyData();