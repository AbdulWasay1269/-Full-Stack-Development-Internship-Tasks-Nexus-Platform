const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Socket.io

const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Route Files
const auth = require('./routes/auth');
const meetings = require('./routes/meetings');
const documents = require('./routes/documents');
const payments = require('./routes/payments');

const app = express();
const server = http.createServer(app); // Wrap Express app with HTTP server

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for dev. In prod, lock this to frontend domain
        methods: ['GET', 'POST']
    }
});

require('./utils/socketHandler')(io); // Inject io logic into separate module

// Middleware
app.use(express.json()); // Body parser

// ---- SECURITY MIDDLEWARE ----
// Sanitize data (Prevent NoSQL Injection)
// app.use(mongoSanitize()); // Note: express-mongo-sanitize is incompatible with Express 5.x

// Set security headers
app.use(helmet());

// Prevent XSS attacks
// app.use(xss()); // Note: xss-clean is incompatible with Express 5.x (Cannot set property query of #<Request>)

// Rate limiting (Max 100 requests per 10 mins per IP)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);

// Prevent http param pollution
// app.use(hpp()); // Note: hpp is incompatible with Express 5.x (Cannot set property query of #<Request>)
// Enable CORS
app.use(cors()); 

// Logging
app.use(morgan('dev')); // HTTP request logger

// Static file folder for uploads preview
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/api/auth', auth);
app.use('/api/meetings', meetings);
app.use('/api/documents', documents);
app.use('/api/payments', payments);

// Test Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Nexus API is running...',
        version: '1.0.0'
    });
});

// Default error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
