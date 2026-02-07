import Fuse from 'fuse.js';

/**
 * Calculate keyword match score between resume and job keywords
 * @param {Array<string>} resumeKeywords - Keywords from resume
 * @param {Array<string>} jobKeywords - Keywords from job description
 * @param {number} fuzzyThreshold - Threshold for fuzzy matching
 * @returns {number} Match score (0-100)
 */
export function calculateKeywordMatchScore(resumeKeywords, jobKeywords, fuzzyThreshold = 0.4) {
  if (!resumeKeywords || resumeKeywords.length === 0 || !jobKeywords || jobKeywords.length === 0) {
    return 0;
  }

  // Normalize keywords to lowercase for comparison
  const resumeKeywordsLower = resumeKeywords.map(k => k.toLowerCase());
  const jobKeywordsLower = jobKeywords.map(k => k.toLowerCase());

  // Count exact matches
  let exactMatches = 0;
  resumeKeywordsLower.forEach(resumeKw => {
    if (jobKeywordsLower.includes(resumeKw)) {
      exactMatches++;
    }
  });

  // Use fuzzy matching for partial matches
  const fuse = new Fuse(resumeKeywordsLower, {
    includeScore: true,
    threshold: fuzzyThreshold,
  });

  let fuzzyMatches = 0;
  jobKeywordsLower.forEach(jobKw => {
    const results = fuse.search(jobKw);
    if (results.length > 0 && results[0].score < fuzzyThreshold) {
      fuzzyMatches++;
    }
  });

  // Calculate match percentage: (exact matches + weighted fuzzy matches) / total job keywords
  const totalMatches = exactMatches + (fuzzyMatches * 0.5); // Fuzzy matches count as half
  const matchPercentage = (totalMatches / jobKeywords.length) * 100;
  
  return Math.min(matchPercentage, 100);
}
