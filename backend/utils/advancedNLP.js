import natural from 'natural';
import stopword from 'stopword';
import nlp from 'compromise';

const { WordTokenizer, PorterStemmer, TfIdf } = natural;

/**
 * Generate bigrams from tokens
 */
function generateBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push([tokens[i], tokens[i + 1]]);
  }
  return bigrams;
}

/**
 * Generate trigrams from tokens
 */
function generateTrigrams(tokens) {
  const trigrams = [];
  for (let i = 0; i < tokens.length - 2; i++) {
    trigrams.push([tokens[i], tokens[i + 1], tokens[i + 2]]);
  }
  return trigrams;
}

/**
 * Advanced text preprocessing with n-grams
 * @param {string} text - Input text
 * @returns {Object} Preprocessed data with unigrams, bigrams, and trigrams
 */
export function advancedPreprocessText(text) {
  const tokenizer = new WordTokenizer();
  let tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove stopwords
  tokens = stopword.removeStopwords(tokens);
  
  // Stem tokens
  const stemmedTokens = tokens.map(word => PorterStemmer.stem(word));
  
  // Generate n-grams for better context understanding
  const bigrams = generateBigrams(tokens);
  const trigrams = generateTrigrams(tokens);
  
  return {
    unigrams: stemmedTokens,
    bigrams: bigrams.map(bg => bg.join(' ')),
    trigrams: trigrams.map(tg => tg.join(' ')),
    originalTokens: tokens
  };
}

/**
 * Extract entities using NLP (skills, experience, education)
 * @param {string} text - Input text
 * @returns {Object} Extracted entities
 */
export function extractEntities(text) {
  const doc = nlp(text);
  
  // Extract skills (common technical terms)
  const skills = doc.match('#Noun+ (language|framework|tool|technology|platform)').out('array');
  
  // Extract experience indicators
  const experience = doc.match('#Value+ (year|month|experience|worked|developed)').out('array');
  
  // Extract education
  const education = doc.match('(degree|bachelor|master|phd|university|college|education)').out('array');
  
  // Extract organizations/companies
  const organizations = doc.match('#Organization+').out('array');
  
  return {
    skills: skills.slice(0, 20),
    experience: experience.slice(0, 10),
    education: education.slice(0, 10),
    organizations: organizations.slice(0, 10)
  };
}

/**
 * Advanced keyword extraction using TF-IDF with n-grams
 * @param {string} text - Input text
 * @param {number} count - Number of keywords to extract
 * @returns {Object} Keywords with weights
 */
export function extractAdvancedKeywords(text, count = 30) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  
  // Get terms with their TF-IDF scores
  const terms = tfidf.listTerms(0);
  if (!terms.length) return [];
  
  // Extract top keywords with weights
  const keywords = terms.slice(0, count).map(term => ({
    term: term.term,
    tfidf: term.tfidf,
    importance: term.tfidf * 100 // Normalize to 0-100 scale
  }));
  
  return keywords;
}

/**
 * Calculate semantic similarity using multiple methods
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {Object} Similarity scores
 */
export function calculateSemanticSimilarity(text1, text2) {
  const processed1 = advancedPreprocessText(text1);
  const processed2 = advancedPreprocessText(text2);
  
  // 1. Jaccard Similarity (set-based)
  const set1 = new Set([...processed1.unigrams, ...processed1.bigrams]);
  const set2 = new Set([...processed2.unigrams, ...processed2.bigrams]);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const jaccard = union.size > 0 ? intersection.size / union.size : 0;
  
  // 2. Cosine Similarity (vector-based with n-grams)
  const allTerms = Array.from(new Set([...processed1.unigrams, ...processed2.unigrams]));
  const vector1 = allTerms.map(term => 
    processed1.unigrams.filter(w => w === term).length +
    processed1.bigrams.filter(bg => bg.includes(term)).length * 0.5
  );
  const vector2 = allTerms.map(term => 
    processed2.unigrams.filter(w => w === term).length +
    processed2.bigrams.filter(bg => bg.includes(term)).length * 0.5
  );
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val ** 2, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val ** 2, 0));
  const cosine = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  
  // 3. Bigram Overlap
  const bigramSet1 = new Set(processed1.bigrams);
  const bigramSet2 = new Set(processed2.bigrams);
  const bigramIntersection = new Set([...bigramSet1].filter(x => bigramSet2.has(x)));
  const bigramUnion = new Set([...bigramSet1, ...bigramSet2]);
  const bigramSimilarity = bigramUnion.size > 0 ? bigramIntersection.size / bigramUnion.size : 0;
  
  return {
    jaccard,
    cosine,
    bigramSimilarity,
    combined: (jaccard * 0.3 + cosine * 0.5 + bigramSimilarity * 0.2) // Weighted combination
  };
}

/**
 * Extract skills with context and importance
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @returns {Object} Skills analysis
 */
export function extractSkillsWithContext(resumeText, jobDescription) {
  const resumeEntities = extractEntities(resumeText);
  const jobEntities = extractEntities(jobDescription);
  
  // Find matching skills
  const matchingSkills = resumeEntities.skills.filter(skill => 
    jobEntities.skills.some(js => 
      js.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(js.toLowerCase())
    )
  );
  
  // Calculate skill relevance score
  const skillRelevance = (matchingSkills.length / Math.max(jobEntities.skills.length, 1)) * 100;
  
  return {
    resumeSkills: resumeEntities.skills,
    jobSkills: jobEntities.skills,
    matchingSkills,
    skillRelevance,
    experience: resumeEntities.experience,
    education: resumeEntities.education
  };
}
