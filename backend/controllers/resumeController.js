import { processResume } from '../services/resumeService.js';
import { generatePDFReport } from '../utils/reportGenerator.js';
import { trackSearch } from '../services/analyticsService.js';

/**
 * Upload and analyze a single resume
 * @route POST /api/v1/resumes/analyze
 */
export const analyzeResume = async (req, res, next) => {
  try {
    const file = req.files.resume;
    const jobDescription = req.body.jobDescription;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No resume file uploaded.' }
      });
    }

    const result = await processResume(file, jobDescription);

    // Track analytics
    const ipAddress = req.ip || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || 
                     'unknown';
    const fileType = file.name.split('.').pop() || 'unknown';
    const atsScore = result.formattingAnalysis?.atsReadabilityScore || 0;
    const jdScore = result.jdMatchScore || 0;
    // Track analytics (don't await - run in background)
    trackSearch(ipAddress, fileType, atsScore, jdScore).catch(err => {
      console.error('Error tracking analytics:', err);
    });

    res.status(200).json({
      success: true,
      data: {
        result,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export analysis report as PDF
 * @route POST /api/v1/resumes/export
 */
export const exportReport = async (req, res, next) => {
  try {
    const result = req.body.result;
    
    if (!result) {
      return res.status(400).json({
        success: false,
        error: { message: 'Analysis result is required for export.' }
      });
    }

    const pdfBuffer = await generatePDFReport(result);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ats-report-${result.resumeName || 'resume'}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Health check endpoint
 * @route GET /api/v1/health
 */
export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ATS Scanner API is running',
    timestamp: new Date().toISOString(),
  });
};
