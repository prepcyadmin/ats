/**
 * Extract text content from TXT file buffer
 * @param {Buffer} txtBuffer - TXT file buffer
 * @returns {Promise<string|null>} Extracted text or null if extraction fails
 */
export async function extractTextFromTXT(txtBuffer) {
  try {
    // Try UTF-8 first
    let text = txtBuffer.toString('utf8');
    
    // If that fails or produces weird characters, try other encodings
    if (!text || text.length === 0 || /[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(text)) {
      try {
        text = txtBuffer.toString('latin1');
      } catch (e) {
        text = txtBuffer.toString('ascii');
      }
    }
    
    const trimmedText = text.trim();
    return trimmedText.length > 0 ? trimmedText : null;
  } catch (error) {
    console.error('❌ TXT text extraction failed:', error.message);
    throw new Error('Failed to extract text from TXT file');
  }
}
