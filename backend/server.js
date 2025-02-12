import express from 'express';
import "dotenv/config";
import cors from 'cors';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_USER_URL || "http://localhost:5173",
    process.env.FRONTEND_ADMIN_URL || "http://localhost:5174"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, token, adminToken, admintoken");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Debugging Middleware (Optional, for Logging)
app.use((req, res, next) => {
    console.log("Incoming Request Headers:", req.headers);
    next();
});

// Security Headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start Server
app.listen(port)
    .on('error', (err) => {
        console.error('Failed to start server:', err);
    })
    .on('listening', () => {
        console.log(`Server running on port ${port}`);
    });
