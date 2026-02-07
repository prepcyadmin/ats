import { preprocessText } from './textProcessor.js';

/**
 * Calculate cosine similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Cosine similarity score (0-1)
 */
export function cosineSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const words1 = preprocessText(text1);
  const words2 = preprocessText(text2);
  
  if (!words1.length || !words2.length) return 0;

  const allWords = Array.from(new Set([...words1, ...words2]));
  const vector1 = allWords.map(word => words1.filter(w => w === word).length);
  const vector2 = allWords.map(word => words2.filter(w => w === word).length);

  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val ** 2, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val ** 2, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}
