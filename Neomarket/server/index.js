// ========================================
// SERVER CODE - COMMENTED OUT FOR SERVERLESS APPROACH
// ========================================
// This server code has been preserved for future use if needed.
// The application now uses direct Supabase connections from the frontend.

/*
// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import exchangeRoutes from './routes/exchange.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3002;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, '').toLowerCase())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const normalized = new URL(origin).origin.toLowerCase();
      callback(null, allowedOrigins.includes(normalized));
    } catch {
      callback(null, false);
    }
  },
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'NFT Exchange Server'
  });
});

// API Routes
app.use('/api/exchange', exchangeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NFT Exchange Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Validate required environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'THIRDWEB_CLIENT_ID',
    'THIRDWEB_SECRET_KEY',
    'SERVER_WALLET_ADDRESS',
    'USDT_CONTRACT_ADDRESS',
    'ALLOWED_ORIGINS',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
    console.warn('Please check your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }
});

export default app;
*/

console.log('🔄 Server code is commented out - using serverless approach with direct Supabase connections');
console.log('📝 To re-enable server, uncomment the code above and run: npm run dev');
