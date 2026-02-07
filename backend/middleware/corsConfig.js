import cors from 'cors';
import { config } from '../config/index.js';

/**
 * CORS configuration middleware
 * Supports multiple origins (comma-separated) or single origin
 */
const getAllowedOrigins = () => {
  const origin = config.cors.origin || 'http://localhost:3000';
  
  // If comma-separated, split into array
  if (origin.includes(',')) {
    return origin.split(',').map(o => o.trim());
  }
  
  // Return array with single origin
  return [origin];
};

const allowedOrigins = getAllowedOrigins();

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Also allow Render frontend URLs (for development/testing)
      if (origin.includes('.onrender.com')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
