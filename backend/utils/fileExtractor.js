import { extractTextFromPDF } from './pdfExtractor.js';
import { extractTextFromDOCX } from './docxExtractor.js';
import { extractTextFromTXT } from './txtExtractor.js';

/**
 * Extract text from various file formats
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - File MIME type
 * @param {string} fileName - File name (for extension detection)
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(fileBuffer, mimeType, fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // Determine file type from MIME type or extension
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return await extractTextFromPDF(fileBuffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    extension === 'docx' ||
    extension === 'doc'
  ) {
    return await extractTextFromDOCX(fileBuffer);
  } else if (
    mimeType === 'text/plain' ||
    extension === 'txt'
  ) {
    return await extractTextFromTXT(fileBuffer);
  } else {
    throw new Error(`Unsupported file format: ${mimeType || extension}. Supported formats: PDF, DOCX, TXT`);
  }
}
