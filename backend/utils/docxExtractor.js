import mammoth from 'mammoth';

/**
 * Extract text content from DOCX file buffer
 * @param {Buffer} docxBuffer - DOCX file buffer
 * @returns {Promise<string|null>} Extracted text or null if extraction fails
 */
export async function extractTextFromDOCX(docxBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    const text = result.value.trim();
    return text.length > 0 ? text : null;
  } catch (error) {
    console.error('❌ DOCX text extraction failed:', error.message);
    throw new Error('Failed to extract text from DOCX file');
  }
}

/**
 * Extract text with formatting information (optional)
 * @param {Buffer} docxBuffer - DOCX file buffer
 * @returns {Promise<Object>} Extracted text with formatting
 */
export async function extractTextWithFormatting(docxBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    const htmlResult = await mammoth.convertToHtml({ buffer: docxBuffer });
    
    return {
      text: result.value.trim(),
      html: htmlResult.value,
      messages: result.messages.concat(htmlResult.messages)
    };
  } catch (error) {
    console.error('❌ DOCX extraction with formatting failed:', error.message);
    throw new Error('Failed to extract text from DOCX file');
  }
}
