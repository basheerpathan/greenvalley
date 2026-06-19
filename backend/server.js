require('dotenv').config();

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

// ==========================================
//           CORS CONFIGURATION
// ==========================================
// Ensure this matches your ACTUAL deployed Vercel frontend URL
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-app.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// Connect to MongoDB Database
connectDB();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

// Body Parsers & Request Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ==========================================
//             BASE & API ROUTES
// ==========================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Green Valley Foundation API',
      version: '1.0.0',
    },
    servers: [{ url: process.env.BACKEND_URL || 'http://localhost:5000' }],
  },
  apis: ['./routes/*.js'],
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

app.get('/', (req, res) => res.status(200).json({ status: "Healthy" }));
app.get('/favicon.ico', (req, res) => res.status(204).end());

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Start the HTTP & Socket.io Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };