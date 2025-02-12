import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';

// App config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Updated CORS configuration
app.use(cors({
    origin: [
        process.env.FRONTEND_USER_URL,
        process.env.FRONTEND_ADMIN_URL,
        'https://medilink-healthcareservices-admin.vercel.app'  // Add your specific frontend URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Added OPTIONS method
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'token',
        'adminToken',
        'admintoken',
        'Admintoken'  // Added both cases to handle case sensitivity
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
});

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Bind to all network interfaces
app.listen(port)
    .on('error', (err) => {
        console.error('Failed to start server:', err);
    })
    .on('listening', () => {
        console.log(`Server running on port ${port}`);
    });