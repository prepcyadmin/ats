import express from 'express';
import { config } from './config/index.js';
import { corsMiddleware } from './middleware/corsConfig.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import resumeRoutes from './routes/resumeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/admin', adminRoutes);

// Log registered routes
console.log('📋 Registered routes:');
console.log('  - GET  /api/v1/resumes/health');
console.log('  - POST /api/v1/resumes/analyze');
console.log('  - POST /api/v1/resumes/export');
console.log('  - GET  /api/v1/admin/stats');
console.log('  - POST /api/v1/admin/reset');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ATS Scanner API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/resumes/health',
      analyze: '/api/v1/resumes/analyze',
      adminStats: '/api/v1/admin/stats',
      adminReset: '/api/v1/admin/reset',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`✅ ATS Scanner API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.server.env}`);
  console.log(`🔗 CORS Origin: ${config.cors.origin}`);
});
