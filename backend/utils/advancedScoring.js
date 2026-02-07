import { calculateSemanticSimilarity, extractAdvancedKeywords, extractSkillsWithContext } from './advancedNLP.js';
import { calculateKeywordMatchScore } from './keywordMatcher.js';
import { config } from '../config/index.js';

/**
 * Multi-factor ATS scoring algorithm
 * Uses multiple AI/ML techniques for accurate scoring
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @returns {Object} Comprehensive analysis with multiple scores
 */
export function calculateAdvancedATSScore(resumeText, jobDescription) {
  // 1. Semantic Similarity (Multiple methods)
  const semanticScores = calculateSemanticSimilarity(resumeText, jobDescription);
  
  // 2. Advanced Keyword Extraction
  const resumeKeywords = extractAdvancedKeywords(resumeText, config.ats.keywordCount);
  const jobKeywords = extractAdvancedKeywords(jobDescription, config.ats.keywordCount);
  
  // 3. Keyword Match Score (with weights)
  const keywordMatchScore = calculateWeightedKeywordMatch(
    resumeKeywords,
    jobKeywords
  );
  
  // 4. Skills Context Analysis
  const skillsAnalysis = extractSkillsWithContext(resumeText, jobDescription);
  
  // 5. Experience and Education Matching
  const experienceScore = calculateExperienceMatch(resumeText, jobDescription);
  const educationScore = calculateEducationMatch(resumeText, jobDescription);
  
  // 6. Multi-factor scoring
  const baseScore = calculateMultiFactorScore({
    semanticSimilarity: semanticScores.combined,
    keywordMatch: keywordMatchScore,
    skillRelevance: skillsAnalysis.skillRelevance / 100,
    experienceMatch: experienceScore,
    educationMatch: educationScore
  });
  
  // 7. Apply intelligent boost based on critical requirements
  const boostedScore = applyIntelligentBoost(
    resumeText,
    jobDescription,
    baseScore,
    skillsAnalysis
  );
  
  return {
    finalScore: Math.round(Math.min(boostedScore, 100)),
    baseScore: Math.round(baseScore),
    breakdown: {
      semanticSimilarity: (semanticScores.combined * 100).toFixed(1),
      jaccardSimilarity: (semanticScores.jaccard * 100).toFixed(1),
      cosineSimilarity: (semanticScores.cosine * 100).toFixed(1),
      keywordMatch: keywordMatchScore.toFixed(1),
      skillRelevance: skillsAnalysis.skillRelevance.toFixed(1),
      experienceMatch: (experienceScore * 100).toFixed(1),
      educationMatch: (educationScore * 100).toFixed(1)
    },
    resumeKeywords: resumeKeywords.map(k => k.term),
    jobKeywords: jobKeywords.map(k => k.term),
    skillsAnalysis
  };
}

/**
 * Calculate weighted keyword match considering TF-IDF importance
 * @param {Array} resumeKeywords - Resume keywords with weights
 * @param {Array} jobKeywords - Job keywords with weights
 * @returns {number} Weighted match score (0-100)
 */
function calculateWeightedKeywordMatch(resumeKeywords, jobKeywords) {
  if (!resumeKeywords.length || !jobKeywords.length) return 0;
  
  const resumeKwMap = new Map(resumeKeywords.map(k => [k.term.toLowerCase(), k.importance]));
  const jobKwMap = new Map(jobKeywords.map(k => [k.term.toLowerCase(), k.importance]));
  
  let totalWeight = 0;
  let matchedWeight = 0;
  
  // Calculate weighted match
  jobKeywords.forEach(jobKw => {
    const jobTerm = jobKw.term.toLowerCase();
    const jobWeight = jobKw.importance;
    totalWeight += jobWeight;
    
    // Check for exact match
    if (resumeKwMap.has(jobTerm)) {
      matchedWeight += jobWeight;
    } else {
      // Check for partial/fuzzy match
      for (const [resumeTerm, resumeWeight] of resumeKwMap.entries()) {
        if (jobTerm.includes(resumeTerm) || resumeTerm.includes(jobTerm)) {
          matchedWeight += jobWeight * 0.7; // Partial match gets 70% weight
          break;
        }
      }
    }
  });
  
  return totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
}

/**
 * Calculate experience match score
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @returns {number} Experience match score (0-1)
 */
function calculateExperienceMatch(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract years of experience from job description
  const yearsMatch = jobLower.match(/(\d+)\+?\s*(year|yr|years)/);
  const requiredYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;
  
  if (requiredYears === 0) return 0.5; // Neutral if not specified
  
  // Extract experience from resume
  const resumeYearsMatch = resumeLower.match(/(\d+)\+?\s*(year|yr|years?)\s*(of\s*)?(experience|exp)/);
  const resumeYears = resumeYearsMatch ? parseInt(resumeYearsMatch[1]) : 0;
  
  if (resumeYears === 0) return 0.2; // Low score if no experience mentioned
  
  // Calculate match ratio
  if (resumeYears >= requiredYears) return 1.0;
  return Math.max(0.2, resumeYears / requiredYears);
}

/**
 * Calculate education match score
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @returns {number} Education match score (0-1)
 */
function calculateEducationMatch(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Education keywords
  const educationLevels = {
    'phd': 5,
    'doctorate': 5,
    'master': 4,
    'mba': 4,
    'bachelor': 3,
    'bachelor\'s': 3,
    'btech': 3,
    'b.e': 3,
    'degree': 2,
    'diploma': 1
  };
  
  // Find required education in job description
  let requiredLevel = 0;
  for (const [level, value] of Object.entries(educationLevels)) {
    if (jobLower.includes(level)) {
      requiredLevel = Math.max(requiredLevel, value);
    }
  }
  
  if (requiredLevel === 0) return 0.5; // Neutral if not specified
  
  // Find education in resume
  let resumeLevel = 0;
  for (const [level, value] of Object.entries(educationLevels)) {
    if (resumeLower.includes(level)) {
      resumeLevel = Math.max(resumeLevel, value);
    }
  }
  
  if (resumeLevel === 0) return 0.1; // Low score if no education mentioned
  
  // Calculate match
  if (resumeLevel >= requiredLevel) return 1.0;
  return Math.max(0.1, resumeLevel / requiredLevel);
}

/**
 * Multi-factor scoring combining all metrics
 * @param {Object} scores - Individual scores
 * @returns {number} Combined score (0-100)
 */
function calculateMultiFactorScore(scores) {
  // Improved AI-based weights for accurate JD matching
  // These weights are optimized based on ATS system behavior
  const weights = {
    semanticSimilarity: 0.30,  // Increased - semantic understanding is critical
    keywordMatch: 0.35,         // Increased - keywords are heavily weighted by ATS
    skillRelevance: 0.20,       // Skills matching importance
    experienceMatch: 0.10,     // Experience level match
    educationMatch: 0.05        // Education level match
  };
  
  // Normalize scores to 0-1 range if needed
  const normalizedScores = {
    semanticSimilarity: Math.min(1, Math.max(0, scores.semanticSimilarity)),
    keywordMatch: Math.min(1, Math.max(0, scores.keywordMatch / 100)),
    skillRelevance: Math.min(1, Math.max(0, scores.skillRelevance)),
    experienceMatch: Math.min(1, Math.max(0, scores.experienceMatch)),
    educationMatch: Math.min(1, Math.max(0, scores.educationMatch))
  };
  
  // Calculate weighted average
  const weightedScore = 
    (normalizedScores.semanticSimilarity * weights.semanticSimilarity * 100) +
    (normalizedScores.keywordMatch * weights.keywordMatch * 100) +
    (normalizedScores.skillRelevance * weights.skillRelevance * 100) +
    (normalizedScores.experienceMatch * weights.experienceMatch * 100) +
    (normalizedScores.educationMatch * weights.educationMatch * 100);
  
  // Apply non-linear scaling for more accurate distribution
  // Higher scores get slight boost, lower scores get slight penalty
  const scaledScore = weightedScore < 50 
    ? weightedScore * 0.95  // Slight penalty for low scores
    : weightedScore < 80
    ? weightedScore * 1.0   // No change for medium scores
    : Math.min(100, weightedScore * 1.05);  // Slight boost for high scores
  
  return Math.round(Math.min(scaledScore, 100));
}

/**
 * Apply intelligent boost based on critical requirements
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @param {number} baseScore - Base score
 * @param {Object} skillsAnalysis - Skills analysis
 * @returns {number} Boosted score
 */
function applyIntelligentBoost(resumeText, jobDescription, baseScore, skillsAnalysis) {
  let boost = 0;
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Boost for critical skills match
  const criticalSkillsRatio = skillsAnalysis.matchingSkills.length / 
    Math.max(skillsAnalysis.jobSkills.length, 1);
  if (criticalSkillsRatio > 0.7) {
    boost += 5; // Strong skills match
  } else if (criticalSkillsRatio > 0.5) {
    boost += 3; // Good skills match
  }
  
  // Boost for required technologies
  const techKeywords = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 
    'aws', 'docker', 'kubernetes', 'typescript', 'angular', 'vue'];
  let techMatches = 0;
  techKeywords.forEach(tech => {
    if (jobLower.includes(tech) && resumeLower.includes(tech)) {
      techMatches++;
    }
  });
  boost += Math.min(techMatches * 1.5, 8); // Max 8 points for tech matches
  
  // Boost for certifications
  if (jobLower.includes('certification') || jobLower.includes('certified')) {
    const certKeywords = ['certified', 'certification', 'cert', 'license'];
    certKeywords.forEach(cert => {
      if (resumeLower.includes(cert)) {
        boost += 2;
      }
    });
  }
  
  return Math.min(baseScore + boost, 100);
}
