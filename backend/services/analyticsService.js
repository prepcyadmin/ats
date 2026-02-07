/**
 * Analytics Service - Tracks usage statistics
 * In-memory storage (can be replaced with database)
 */

// In-memory storage for analytics
let analyticsData = {
  totalUsers: new Set(), // Track unique users by IP/session
  totalSearches: 0,
  searchesByDate: {}, // { '2024-01-01': 5, ... }
  usersByDate: {}, // { '2024-01-01': Set([ip1, ip2]), ... }
  trafficByHour: {}, // { '14': 10, ... } hour -> count
  fileTypes: {}, // { 'pdf': 10, 'docx': 5, ... }
  averageScore: { ats: 0, jd: 0, count: 0 },
  createdAt: new Date().toISOString()
};

/**
 * Track a new search/analysis
 * @param {string} ipAddress - User IP address
 * @param {string} fileType - File type (pdf, docx, txt)
 * @param {number} atsScore - ATS readability score
 * @param {number} jdScore - JD match score
 */
export function trackSearch(ipAddress, fileType, atsScore = 0, jdScore = 0) {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourKey = now.getHours().toString();

  // Track total searches
  analyticsData.totalSearches++;

  // Track unique users
  analyticsData.totalUsers.add(ipAddress);

  // Track searches by date
  if (!analyticsData.searchesByDate[dateKey]) {
    analyticsData.searchesByDate[dateKey] = 0;
  }
  analyticsData.searchesByDate[dateKey]++;

  // Track users by date
  if (!analyticsData.usersByDate[dateKey]) {
    analyticsData.usersByDate[dateKey] = new Set();
  }
  analyticsData.usersByDate[dateKey].add(ipAddress);

  // Track traffic by hour
  if (!analyticsData.trafficByHour[hourKey]) {
    analyticsData.trafficByHour[hourKey] = 0;
  }
  analyticsData.trafficByHour[hourKey]++;

  // Track file types
  const normalizedFileType = (fileType || 'unknown').toLowerCase().replace('.', '');
  if (!analyticsData.fileTypes[normalizedFileType]) {
    analyticsData.fileTypes[normalizedFileType] = 0;
  }
  analyticsData.fileTypes[normalizedFileType]++;

  // Track average scores
  if (atsScore > 0 || jdScore > 0) {
    analyticsData.averageScore.count++;
    analyticsData.averageScore.ats = 
      (analyticsData.averageScore.ats * (analyticsData.averageScore.count - 1) + atsScore) / 
      analyticsData.averageScore.count;
    analyticsData.averageScore.jd = 
      (analyticsData.averageScore.jd * (analyticsData.averageScore.count - 1) + jdScore) / 
      analyticsData.averageScore.count;
  }
}

/**
 * Get analytics statistics
 * @returns {Object} Analytics data
 */
export function getAnalytics() {
  // Convert Sets to counts for JSON serialization
  const usersByDateCount = {};
  Object.keys(analyticsData.usersByDate).forEach(date => {
    usersByDateCount[date] = analyticsData.usersByDate[date].size;
  });

  // Get last 30 days of data
  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    last30Days.push({
      date: dateKey,
      searches: analyticsData.searchesByDate[dateKey] || 0,
      users: usersByDateCount[dateKey] || 0
    });
  }

  // Get last 24 hours traffic
  const last24Hours = [];
  const currentHour = today.getHours();
  for (let i = 23; i >= 0; i--) {
    const hour = (currentHour - i + 24) % 24;
    const hourKey = hour.toString();
    last24Hours.push({
      hour: hour,
      searches: analyticsData.trafficByHour[hourKey] || 0
    });
  }

  return {
    totalUsers: analyticsData.totalUsers.size,
    totalSearches: analyticsData.totalSearches,
    averageScores: {
      ats: Math.round(analyticsData.averageScore.ats),
      jd: Math.round(analyticsData.averageScore.jd)
    },
    fileTypes: analyticsData.fileTypes,
    last30Days: last30Days,
    last24Hours: last24Hours,
    createdAt: analyticsData.createdAt,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Reset analytics (for testing/admin purposes)
 */
export function resetAnalytics() {
  analyticsData = {
    totalUsers: new Set(),
    totalSearches: 0,
    searchesByDate: {},
    usersByDate: {},
    trafficByHour: {},
    fileTypes: {},
    averageScore: { ats: 0, jd: 0, count: 0 },
    createdAt: new Date().toISOString()
  };
}
