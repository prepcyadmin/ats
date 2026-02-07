import express from 'express';
import fileUpload from 'express-fileupload';
import { analyzeResume, healthCheck, exportReport } from '../controllers/resumeController.js';
import { validateSingleUpload, validateJobDescription } from '../middleware/uploadValidator.js';

const router = express.Router();

// Health check route
router.get('/health', healthCheck);

// Analyze single resume route
router.post(
  '/analyze',
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
  }),
  validateSingleUpload,
  validateJobDescription,
  analyzeResume
);

// Export report route
router.post('/export', express.json(), exportReport);

export default router;
