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

// Using cors middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'token', 
        'adminToken', 
        'admintoken',  // Ensure this is included
        'AdminToken',
        'x-requested-with'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Additional CORS headers for extra security and compatibility
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, token, adminToken, admintoken, AdminToken, x-requested-with");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});

// Debugging Middleware (Optional)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log("Incoming Request Headers:", req.headers);
        console.log("Request Origin:", req.headers.origin);
        console.log("Request Method:", req.method);
        next();
    });
}

// Security Headers
app.use((req, res, next) => {
    // Basic security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something broke on the server!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start Server
app.listen(port)
    .on('error', (err) => {
        console.error('Failed to start server:', err);
        process.exit(1); // Exit on failure to start server
    })
    .on('listening', () => {
        console.log(`Server running on port ${port}`);
        console.log('Allowed Origins:', allowedOrigins);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Consider graceful shutdown here if needed
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});