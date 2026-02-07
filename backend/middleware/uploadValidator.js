import { config } from '../config/index.js';

/**
 * Validate single file upload
 */
export const validateSingleUpload = (req, res, next) => {
  if (!req.files || !req.files.resume) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'No resume file uploaded.',
      },
    });
  }

  const file = req.files.resume;

  // Check file size
  if (file.size > config.upload.maxFileSize) {
    return res.status(400).json({
      success: false,
      error: {
        message: `File exceeds maximum size of ${config.upload.maxFileSize / 1024 / 1024}MB.`,
      },
    });
  }

  // Check file type (by MIME type or extension)
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isValidMimeType = config.upload.allowedMimeTypes.includes(file.mimetype);
  const isValidExtension = config.upload.allowedExtensions.includes(fileExtension);
  
  if (!isValidMimeType && !isValidExtension) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'File format not supported. Supported formats: PDF, DOCX, DOC, TXT',
      },
    });
  }

  next();
};

/**
 * Validate job description
 */
export const validateJobDescription = (req, res, next) => {
  if (!req.body.jobDescription || req.body.jobDescription.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Job description is required and cannot be empty.',
      },
    });
  }

  if (req.body.jobDescription.length < 50) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Job description must be at least 50 characters long.',
      },
    });
  }

  next();
};
