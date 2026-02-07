/**
 * Analytics Service - Tracks usage statistics
 * Uses MongoDB for persistent storage (survives deployments)
 * Falls back to file-based storage if MongoDB not available
 */

import { getDatabase } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to analytics data file (fallback)
const ANALYTICS_FILE = path.join(__dirname, '../data/analytics.json');
const dataDir = path.dirname(ANALYTICS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default analytics data structure
const defaultAnalyticsData = {
  totalUsers: [],
  totalSearches: 0,
  searchesByDate: {},
  usersByDate: {},
  trafficByHour: {},
  fileTypes: {},
  averageScore: { ats: 0, jd: 0, count: 0 },
  createdAt: new Date().toISOString()
};

// Load from MongoDB or file
async function loadAnalyticsData() {
  const db = await getDatabase();
  
  if (db) {
    // Try MongoDB first
    try {
      const collection = db.collection('analytics');
      const doc = await collection.findOne({ _id: 'main' });
      if (doc) {
        // Convert arrays back to Sets for runtime
        return {
          totalUsers: new Set(doc.totalUsers || []),
          totalSearches: doc.totalSearches || 0,
          searchesByDate: doc.searchesByDate || {},
          usersByDate: Object.keys(doc.usersByDate || {}).reduce((acc, date) => {
            acc[date] = new Set(doc.usersByDate[date] || []);
            return acc;
          }, {}),
          trafficByHour: doc.trafficByHour || {},
          fileTypes: doc.fileTypes || {},
          averageScore: doc.averageScore || { ats: 0, jd: 0, count: 0 },
          createdAt: doc.createdAt || new Date().toISOString()
        };
      }
      // No data in MongoDB, initialize
      await collection.insertOne({
        _id: 'main',
        ...defaultAnalyticsData
      });
      return {
        ...defaultAnalyticsData,
        totalUsers: new Set(),
        usersByDate: {}
      };
    } catch (error) {
      console.error('Error loading from MongoDB:', error);
    }
  }
  
  // Fallback to file
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const fileData = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
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
    console.error('Error loading from file:', error);
  }
  
  return {
    ...defaultAnalyticsData,
    totalUsers: new Set(),
    usersByDate: {}
  };
}

// Save to MongoDB or file
async function saveAnalyticsData() {
  const db = await getDatabase();
  
  // Convert Sets to arrays for storage
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
    createdAt: analyticsData.createdAt,
    lastUpdated: new Date().toISOString()
  };
  
  if (db) {
    // Save to MongoDB
    try {
      const collection = db.collection('analytics');
      await collection.updateOne(
        { _id: 'main' },
        { $set: dataToSave },
        { upsert: true }
      );
      return;
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
    }
  }
  
  // Fallback to file
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving to file:', error);
  }
}

// Initialize analytics data
let analyticsData = await loadAnalyticsData();

// Auto-save every 30 seconds
setInterval(async () => {
  await saveAnalyticsData();
}, 30000);

// Save on process exit
process.on('SIGTERM', async () => {
  await saveAnalyticsData();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await saveAnalyticsData();
  process.exit(0);
});

/**
 * Track a new search/analysis
 * @param {string} ipAddress - User IP address
 * @param {string} fileType - File type (pdf, docx, txt)
 * @param {number} atsScore - ATS readability score
 * @param {number} jdScore - JD match score
 */
export async function trackSearch(ipAddress, fileType, atsScore = 0, jdScore = 0) {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
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

  // Save after all updates
  await saveAnalyticsData();
}

/**
 * Get analytics statistics
 * @returns {Object} Analytics data
 */
export async function getAnalytics() {
  // Reload from database to ensure we have latest data
  analyticsData = await loadAnalyticsData();
  
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
export async function resetAnalytics() {
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
  await saveAnalyticsData();
}
