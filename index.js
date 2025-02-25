const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/auth');
const messageRoutes = require('./src/routes/messages');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting for message submission
const messageLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50, // 50 requests per IP per day
});

// Routes
app.use('/api', authRoutes);
app.use('/api', messageRoutes);
app.use('/api/messages', messageLimiter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});