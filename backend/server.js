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

// Connect to databases and services
try {
    await connectDB();
    console.log('MongoDB connected successfully');
    await connectCloudinary();
    console.log('Cloudinary connected successfully');
} catch (error) {
    console.error('Failed to connect to services:', error);
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_USER_URL || "http://localhost:5173",
    process.env.FRONTEND_ADMIN_URL || "http://localhost:5174",
    "https://medilink-healthcareservices-admin.vercel.app",
    "https://medilink-healthcareservices.vercel.app", // Add your user frontend URL if different
];

// CORS error handling middleware
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed',
            origin: req.headers.origin
        });
    } else {
        next(err);
    }
});

// Main CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('Request with no origin');
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origin blocked:', origin);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }

        console.log('Origin allowed:', origin);
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'token',
        'admintoken',
        'X-Requested-With',
        'Accept'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Additional headers middleware
app.use((req, res, next) => {
    console.log('Incoming request from origin:', req.headers.origin);
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        console.log('Setting CORS headers for origin:', origin);
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, admintoken, X-Requested-With, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    } else {
        console.log('Origin not in allowed list:', origin);
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.sendStatus(200);
        return;
    }
    next();
});

// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'active',
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle unhandled routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Start server with enhanced error handling
const server = app.listen(port)
    .on('error', (err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    })
    .on('listening', () => {
        console.log(`Server running on port ${port}`);
        console.log('Allowed Origins:', allowedOrigins);
    });

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});