import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/category.routes';
import productRoutes from './modules/products/product.routes';
import warehouseRoutes from './modules/warehouses/warehouse.routes';
import locationRoutes from './modules/locations/location.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import customerRoutes from './modules/customers/customer.routes';
import receiptRoutes from './modules/receipts/receipt.routes';
import deliveryRoutes from './modules/deliveries/delivery.routes';
import transferRoutes from './modules/transfers/transfer.routes';
import adjustmentRoutes from './modules/adjustments/adjustment.routes';
import stockRoutes from './modules/stock/stock.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : true; // true reflects the origin back dynamically, enabling credentials

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }),
);
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
