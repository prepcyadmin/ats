import pdfParse from 'pdf-parse';

/**
 * Extract text content from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string|null>} Extracted text or null if extraction fails
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text.trim();
    return text.length > 0 ? text : null;
  } catch (error) {
    console.error('❌ PDF text extraction failed:', error.message);
    throw new Error('Failed to extract text from PDF');
  }
}
