// 1. CRITICAL HOISTING: Environment variables MUST load before any other imports!
require('dotenv').config();

// FORCE INJECT STRINGS - Bypasses broken/cached environment configs
process.env.CLOUDINARY_CLOUD_NAME = 'djfow8d5f';
process.env.CLOUDINARY_API_KEY = '451467784592966';
process.env.CLOUDINARY_API_SECRET = 'QZVb_-tDd-wTmcBHxCCKNshoWbU';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// Connect to MongoDB Database
connectDB();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting for API routes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

// Body Parsers & Request Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ==========================================
//           BASE & UTILITY ROUTES
// ==========================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Green Valley Foundation API Engine',
      version: '1.0.0',
      description: 'Core backend engine API documentation for the Green Valley Foundation application platform',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Live Documentation Explorer UI Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Fixes the "GET / 404" terminal error by serving a clean welcome check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌿 Welcome to the Green Valley Foundation API Server Engine Engine",
    status: "Healthy",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// Fixes the "GET /favicon.ico 404" log clutter from browsers
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Existing health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
//                   API ROUTES
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/fields', require('./routes/fields'));
app.use('/api/followups', require('./routes/followups'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/events', require('./routes/events'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/content', require('./routes/content'));
app.use('/api/cameras', require('./routes/cameras'));

// ==========================================
//           GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Socket.io Real-time Connection Engine
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Launch Server Listening Engine
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🌿 Green Valley Foundation Server`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = { app, io };