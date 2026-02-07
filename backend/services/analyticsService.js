/**
 * Analytics Service - Tracks usage statistics
 * File-based persistence (survives server restarts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to analytics data file
const ANALYTICS_FILE = path.join(__dirname, '../data/analytics.json');

// Ensure data directory exists
const dataDir = path.dirname(ANALYTICS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default analytics data structure
const defaultAnalyticsData = {
  totalUsers: [], // Array of IP addresses (converted from Set for JSON)
  totalSearches: 0,
  searchesByDate: {}, // { '2024-01-01': 5, ... }
  usersByDate: {}, // { '2024-01-01': [ip1, ip2], ... } (arrays instead of Sets)
  trafficByHour: {}, // { '14': 10, ... } hour -> count
  fileTypes: {}, // { 'pdf': 10, 'docx': 5, ... }
  averageScore: { ats: 0, jd: 0, count: 0 },
  createdAt: new Date().toISOString()
};

// Load analytics data from file or initialize with defaults
function loadAnalyticsData() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const fileData = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      // Convert arrays back to Sets for runtime use
      return {
        ...parsed,
        totalUsers: new Set(parsed.totalUsers || []),
        usersByDate: Object.keys(parsed.usersByDate || {}).reduce((acc, date) => {
          acc[date] = new Set(parsed.usersByDate[date] || []);
          return acc;
        }, {})
      };
    }
  } catch (error) {
    console.error('Error loading analytics data:', error);
  }
  // Return defaults with Sets
  return {
    ...defaultAnalyticsData,
    totalUsers: new Set(),
    usersByDate: {}
  };
}

// Save analytics data to file
function saveAnalyticsData() {
  try {
    // Convert Sets to arrays for JSON serialization
    const dataToSave = {
      totalUsers: Array.from(analyticsData.totalUsers),
      totalSearches: analyticsData.totalSearches,
      searchesByDate: analyticsData.searchesByDate,
      usersByDate: Object.keys(analyticsData.usersByDate).reduce((acc, date) => {
        acc[date] = Array.from(analyticsData.usersByDate[date]);
        return acc;
      }, {}),
      trafficByHour: analyticsData.trafficByHour,
      fileTypes: analyticsData.fileTypes,
      averageScore: analyticsData.averageScore,
      createdAt: analyticsData.createdAt
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving analytics data:', error);
  }
}

// Initialize analytics data
let analyticsData = loadAnalyticsData();

// Auto-save every 30 seconds
setInterval(() => {
  saveAnalyticsData();
}, 30000);

// Save on process exit
process.on('SIGTERM', () => {
  saveAnalyticsData();
  process.exit(0);
});

process.on('SIGINT', () => {
  saveAnalyticsData();
  process.exit(0);
});

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

  // Save to file after each update
  saveAnalyticsData();

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
  saveAnalyticsData();
}
