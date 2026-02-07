import natural from 'natural';
import stopword from 'stopword';

const { WordTokenizer, PorterStemmer, TfIdf } = natural;

/**
 * Preprocess text by tokenizing, removing stopwords, and stemming
 * @param {string} text - Input text
 * @returns {Array<string>} Preprocessed tokens
 */
export function preprocessText(text) {
  const tokenizer = new WordTokenizer();
  let tokens = tokenizer.tokenize(text.toLowerCase());
  tokens = stopword.removeStopwords(tokens);
  return tokens.map(word => PorterStemmer.stem(word));
}

/**
 * Extract top keywords from text using TF-IDF
 * @param {string} text - Input text
 * @param {number} count - Number of keywords to extract
 * @returns {Array<string>} Top keywords
 */
export function getImportantKeywords(text, count = 20) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  const terms = tfidf.listTerms(0);
  if (!terms.length) return [];
  return terms.slice(0, count).map(term => term.term);
}

/**
 * Count keyword occurrences in text
 * @param {string} text - Input text
 * @param {string} term - Term to search for
 * @returns {number} Number of occurrences
 */
export function getSkillFrequency(text, term) {
  const regex = new RegExp(`\\b${term}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Normalize value to 0-10 range
 * @param {number} count - Input count
 * @param {number} max - Maximum value for normalization
 * @returns {number} Normalized value
 */
export function normalize(count, max = 10) {
  return Math.min((count / max) * 10, 10);
}
