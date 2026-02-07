import { getAnalytics, resetAnalytics } from '../services/analyticsService.js';

/**
 * Get admin analytics dashboard data
 */
export async function getAdminStats(req, res) {
  try {
    const analytics = getAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch admin statistics',
        details: error.message
      }
    });
  }
}

/**
 * Reset analytics data (admin only)
 */
export async function resetStats(req, res) {
  try {
    resetAnalytics();
    
    res.json({
      success: true,
      message: 'Analytics data reset successfully'
    });
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reset statistics',
        details: error.message
      }
    });
  }
}
