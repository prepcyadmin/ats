import { calculateAdvancedATSScore } from '../utils/advancedScoring.js';
import { extractAdvancedKeywords } from '../utils/advancedNLP.js';
import { matchTechnicalRequirements } from '../utils/technicalMatcher.js';
import { extractTechnicalRequirements } from '../utils/technicalExtractor.js';
import { matchSkills } from '../utils/skillsMatcher.js';
import { config } from '../config/index.js';

/**
 * Advanced resume analysis using AI/ML algorithms
 * Uses semantic similarity, n-grams, entity extraction, and multi-factor scoring
 * Now focuses on TECHNICAL REQUIREMENTS matching instead of common English words
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @param {Array<string>} jobKeywords - Pre-extracted job keywords (legacy, kept for compatibility)
 * @returns {Object} Comprehensive analysis results
 */
export function analyzeResume(resumeText, jobDescription, jobKeywords) {
  // NEW: Comprehensive skills matching (checks resume text directly, not just extracted lists)
  const skillsMatch = matchSkills(resumeText, jobDescription);
  
  // NEW: Extract and match TECHNICAL requirements only (filters common English words)
  const technicalMatch = matchTechnicalRequirements(resumeText, jobDescription);
  
  // Extract technical requirements for keyword matching
  const jobTechnical = extractTechnicalRequirements(jobDescription);
  const resumeTechnical = extractTechnicalRequirements(resumeText);
  
  // Use technical terms for keyword matching instead of all words
  const technicalJobKeywords = jobTechnical.allTechnicalTerms;
  const technicalResumeKeywords = resumeTechnical.allTechnicalTerms;
  
  // Use advanced AI/ML scoring algorithm (but weighted towards technical match)
  const analysis = calculateAdvancedATSScore(resumeText, jobDescription);
  
  // Extract keywords for display (using advanced extraction)
  const resumeKeywords = extractAdvancedKeywords(resumeText, config.ats.keywordCount);
  
  // Calculate technical keyword match score (only technical terms, not common words)
  const technicalKeywordMatch = calculateTechnicalKeywordMatch(
    technicalJobKeywords,
    technicalResumeKeywords,
    resumeText
  );
  
  // Use skills match score for skill relevance (more accurate)
  const improvedSkillRelevance = skillsMatch.overallMatchScore;
  
  // Boost score based on technical match and skills match
  const technicalBoost = technicalMatch.technicalMatchScore > 70 ? 5 : 0;
  const skillsBoost = skillsMatch.overallMatchScore > 75 ? 5 : 0;
  const boostedScore = Math.min(100, analysis.finalScore + technicalBoost + skillsBoost);
  
  return {
    resumeKeywords: resumeKeywords.map(k => k.term),
    cosine: parseFloat(analysis.breakdown.cosineSimilarity) / 100, // For backward compatibility
    keywordMatchScore: parseFloat(analysis.breakdown.keywordMatch),
    technicalKeywordMatch: technicalKeywordMatch, // NEW: Technical-only keyword match
    rawATS: analysis.baseScore,
    boostedScore: boostedScore,
    // Advanced metrics
    semanticSimilarity: parseFloat(analysis.breakdown.semanticSimilarity),
    jaccardSimilarity: parseFloat(analysis.breakdown.jaccardSimilarity),
    skillRelevance: improvedSkillRelevance || parseFloat(analysis.breakdown.skillRelevance),
    experienceMatch: parseFloat(analysis.breakdown.experienceMatch),
    educationMatch: parseFloat(analysis.breakdown.educationMatch),
    breakdown: analysis.breakdown,
    skillsAnalysis: analysis.skillsAnalysis,
    // NEW: Technical requirements matching
    technicalMatch: {
      score: technicalMatch.technicalMatchScore,
      matches: technicalMatch.matches,
      missingRequirements: technicalMatch.missingRequirements,
      relatedMatches: technicalMatch.relatedMatches,
      recommendations: technicalMatch.recommendations,
      jobTechnical: technicalMatch.jobTechnical,
      resumeTechnical: technicalMatch.resumeTechnical
    },
    
    // NEW: Comprehensive Skills Matching (improved - checks resume text directly)
    skillsMatch: {
      overallMatchScore: skillsMatch.overallMatchScore,
      totalRequired: skillsMatch.totalRequired,
      matched: skillsMatch.matched,
      missing: skillsMatch.missing,
      matchedSkills: skillsMatch.matchedSkills,
      missingSkills: skillsMatch.missingSkills,
      categoryScores: skillsMatch.categoryScores,
      recommendations: skillsMatch.recommendations,
      skillMatches: skillsMatch.skillMatches // Detailed match info with confidence scores
    }
  };
}

/**
 * Calculate keyword match score using only technical terms (not common English words)
 */
function calculateTechnicalKeywordMatch(jobTechnicalTerms, resumeTechnicalTerms, resumeText) {
  if (jobTechnicalTerms.length === 0) return 0;
  
  const resumeTextLower = resumeText.toLowerCase();
  let matchedCount = 0;
  
  jobTechnicalTerms.forEach(term => {
    const termLower = term.toLowerCase();
    // Check if technical term appears in resume
    const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(resumeTextLower) || resumeTechnicalTerms.some(r => 
      r.toLowerCase() === termLower || termLower.includes(r.toLowerCase()) || r.toLowerCase().includes(termLower)
    )) {
      matchedCount++;
    }
  });
  
  return Math.round((matchedCount / jobTechnicalTerms.length) * 100);
}
