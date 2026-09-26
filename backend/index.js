import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import menuRoutes from './menu/routes/menuRoutes.js';
import authRoutes from './auth/routes/authRoutes.js';
import cartRoutes from './cart/routes/cartRoutes.js';
import orderRoutes from './order/routes/orderRoutes.js';
import subscriptionRoutes from './subscription/subscriptionRoutes.js';
import profileRoutes from './profile/routes/profileRoutes.js';
import paymentRoutes from './payment/routes/paymentRoutes.js';
import aiRoutes from './ai/aiRoutes.js';
import planRoutes from './plan/planRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/nutriflow/menu', menuRoutes);
app.use('/nutriflow/auth', authRoutes);
app.use('/nutriflow/cart', cartRoutes);
app.use('/nutriflow/orders', orderRoutes);
app.use('/nutriflow/subscriptions', subscriptionRoutes);
app.use('/nutriflow/profile', profileRoutes);
app.use('/nutriflow/payment', paymentRoutes);
app.use('/nutriflow/ai', aiRoutes);
app.use('/nutriflow/plans', planRoutes);

app.get('/nutriflow', (req, res) => {
    res.json({ message: "Welcome to Nutriflow API" });
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 20 });
        console.log("MongoDB Connected successfully");

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Database Connection Error:`, error);
        process.exit(1);
    }
}
// Global Error Handler 
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ success: false, message });
});
connectDB();