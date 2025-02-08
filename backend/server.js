import express from 'express';
import cors from 'cors';
import "dotenv/config"
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Add 'token' here
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
});


// api endpoint
app.use('/api/admin', adminRouter); 
app.use('/api/doctor',doctorRouter);
app.use('/api/user', userRouter);


app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(port, () => console.log('listening on port', port));

