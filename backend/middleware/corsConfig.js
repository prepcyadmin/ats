import cors from 'cors';
import { config } from '../config/index.js';

/**
 * CORS configuration middleware
 */
export const corsMiddleware = cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
