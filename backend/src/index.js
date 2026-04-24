const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Sets standard security headers
app.use(cors({ origin: '*', credentials: true })); // Consider restricting origin in strict production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate Limiting (Global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// Stricter Rate Limiting for Auth routes (Login/Register)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth requests per hour
  message: { message: 'Too many authentication attempts, please try again after an hour' }
});
app.use('/api/auth', authLimiter);

// Static files for uploads (for viewing attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'FinTrack API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/borrow-lend', require('./routes/borrowLend'));
app.use('/api', require('./routes/billsEmis'));
app.use('/api/credit-cards', require('./routes/creditCards'));
 app.use('/api/savings-goals', require('./routes/savings'));
//app.use('/api/savings-goals', require('./routes/savingsGoals'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handler
app.use(errorHandler);

// Export the Express app so serverless environments (like Vercel) can use it
module.exports = app;

// Only start the server if this file is run directly (e.g., node src/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`FinTrack backend server running on port ${PORT}`);
  });
}
