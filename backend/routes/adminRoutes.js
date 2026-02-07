import express from 'express';
import { getAdminStats, resetStats } from '../controllers/adminController.js';

const router = express.Router();

// Test route to verify admin routes are working
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is accessible',
    routes: {
      stats: '/api/v1/admin/stats',
      reset: '/api/v1/admin/reset'
    }
  });
});

// Get admin statistics
router.get('/stats', getAdminStats);

// Reset statistics (admin only)
router.post('/reset', resetStats);

export default router;
