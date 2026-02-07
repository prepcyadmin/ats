import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    maxFiles: parseInt(process.env.MAX_FILES) || 10,
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword', // DOC
      'text/plain' // TXT
    ],
    allowedExtensions: ['pdf', 'docx', 'doc', 'txt'],
  },
  ats: {
    keywordCount: parseInt(process.env.KEYWORD_COUNT) || 30,
    cosineWeight: parseFloat(process.env.COSINE_WEIGHT) || 0.5,
    keywordMatchWeight: parseFloat(process.env.KEYWORD_MATCH_WEIGHT) || 0.5,
    maxBoostPoints: parseInt(process.env.MAX_BOOST_POINTS) || 20,
    fuzzyThreshold: 0.4,
  },
};
