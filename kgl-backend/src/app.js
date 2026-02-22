import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import reportRoutes from './routes/reportRoutes.js';    

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Simple Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'KGL API is running' }));

// Mount the Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/procurements', procurementRoutes);
app.use('/api/v1/reports', reportRoutes);
export default app;