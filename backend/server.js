const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Routes
const authRoutes = require('./src/routes/authRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://pqr-crismor-pqr-frontend.tcnjej.easypanel.host'
];

app.use(cors({
    origin: function (origin, callback) {
        // PERMISSIVE CORS FOR DEBUGGING
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes middleware
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
    res.send('PQR-Crismor Backend is running');
});

// Health check to verify DB connection
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
