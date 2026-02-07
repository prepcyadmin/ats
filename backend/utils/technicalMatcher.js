import { extractTechnicalRequirements } from './technicalExtractor.js';
import natural from 'natural';

const { WordTokenizer } = natural;

/**
 * Match resume technical skills against job description technical requirements
 * Uses fuzzy matching and semantic similarity for technical terms
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} Technical matching analysis
 */
export function matchTechnicalRequirements(resumeText, jobDescription) {
  // Extract technical requirements from both
  const jobTechnical = extractTechnicalRequirements(jobDescription);
  const resumeTechnical = extractTechnicalRequirements(resumeText);
  
  // Match each category
  const matches = {
    programmingLanguages: matchCategory(
      jobTechnical.categories.programmingLanguages,
      resumeTechnical.categories.programmingLanguages
    ),
    frameworks: matchCategory(
      jobTechnical.categories.frameworks,
      resumeTechnical.categories.frameworks
    ),
    tools: matchCategory(
      jobTechnical.categories.tools,
      resumeTechnical.categories.tools
    ),
    platforms: matchCategory(
      jobTechnical.categories.platforms,
      resumeTechnical.categories.platforms
    ),
    databases: matchCategory(
      jobTechnical.categories.databases,
      resumeTechnical.categories.databases
    ),
    methodologies: matchCategory(
      jobTechnical.categories.methodologies,
      resumeTechnical.categories.methodologies
    )
  };
  
  // Calculate overall technical match score
  const technicalMatchScore = calculateTechnicalMatchScore(matches, jobTechnical);
  
  // Find missing critical requirements
  const missingRequirements = findMissingRequirements(jobTechnical, resumeTechnical);
  
  // Find related/similar technologies (fuzzy matching)
  const relatedMatches = findRelatedTechnologies(jobTechnical, resumeTechnical);
  
  return {
    matches,
    technicalMatchScore,
    missingRequirements,
    relatedMatches,
    jobTechnical: {
      total: jobTechnical.summary.totalTechnicalTerms,
      breakdown: jobTechnical.summary
    },
    resumeTechnical: {
      total: resumeTechnical.summary.totalTechnicalTerms,
      breakdown: resumeTechnical.summary
    },
    recommendations: generateTechnicalRecommendations(matches, missingRequirements, jobTechnical)
  };
}

/**
 * Match items in a category with fuzzy matching
 */
function matchCategory(jobItems, resumeItems) {
  const matched = [];
  const missing = [];
  const resumeLower = resumeItems.map(i => i.toLowerCase());
  
  jobItems.forEach(jobItem => {
    const jobItemLower = jobItem.toLowerCase();
    
    // Exact match
    if (resumeLower.includes(jobItemLower)) {
      matched.push({
        job: jobItem,
        resume: jobItem,
        matchType: 'exact',
        confidence: 1.0
      });
    } else {
      // Fuzzy match - check for similar terms
      const fuzzyMatch = findFuzzyMatch(jobItemLower, resumeLower);
      if (fuzzyMatch) {
        matched.push({
          job: jobItem,
          resume: fuzzyMatch.term,
          matchType: 'fuzzy',
          confidence: fuzzyMatch.confidence
        });
      } else {
        missing.push(jobItem);
      }
    }
  });
  
  return {
    matched,
    missing,
    matchRate: jobItems.length > 0 ? (matched.length / jobItems.length) * 100 : 0
  };
}

/**
 * Find fuzzy match for a term
 */
function findFuzzyMatch(term, candidateTerms) {
  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.7; // 70% similarity threshold
  
  candidateTerms.forEach(candidate => {
    const similarity = calculateStringSimilarity(term, candidate);
    if (similarity > bestScore && similarity >= threshold) {
      bestScore = similarity;
      bestMatch = { term: candidate, confidence: similarity };
    }
  });
  
  // Also check for partial matches (e.g., "react" matches "react.js")
  if (!bestMatch) {
    candidateTerms.forEach(candidate => {
      if (term.includes(candidate) || candidate.includes(term)) {
        const similarity = 0.8; // High confidence for partial matches
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = { term: candidate, confidence: similarity };
        }
      }
    });
  }
  
  return bestMatch;
}

/**
 * Calculate string similarity (Jaro-Winkler-like)
 */
function calculateStringSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  // Check for common prefixes
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }
  
  // Simple Levenshtein-like similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  const similarity = 1 - (distance / longer.length);
  
  // Boost for common prefix
  return Math.min(1.0, similarity + (prefix * 0.1));
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate overall technical match score
 */
function calculateTechnicalMatchScore(matches, jobTechnical) {
  const categories = Object.values(matches);
  let totalWeight = 0;
  let weightedScore = 0;
  
  // Weight different categories
  const weights = {
    programmingLanguages: 0.25,
    frameworks: 0.20,
    tools: 0.15,
    databases: 0.15,
    platforms: 0.10,
    methodologies: 0.15
  };
  
  categories.forEach((category, index) => {
    const categoryName = Object.keys(matches)[index];
    const weight = weights[categoryName] || 0.1;
    totalWeight += weight;
    weightedScore += (category.matchRate / 100) * weight * 100;
  });
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

/**
 * Find missing critical requirements
 */
function findMissingRequirements(jobTechnical, resumeTechnical) {
  const missing = {
    critical: [],
    important: [],
    niceToHave: []
  };
  
  // Programming languages are critical
  jobTechnical.categories.programmingLanguages.forEach(lang => {
    if (!resumeTechnical.categories.programmingLanguages.some(r => 
      r.toLowerCase() === lang.toLowerCase()
    )) {
      missing.critical.push({ type: 'programmingLanguage', term: lang });
    }
  });
  
  // Frameworks are important
  jobTechnical.categories.frameworks.forEach(fw => {
    if (!resumeTechnical.categories.frameworks.some(r => 
      r.toLowerCase() === fw.toLowerCase()
    )) {
      missing.important.push({ type: 'framework', term: fw });
    }
  });
  
  // Tools are nice to have
  jobTechnical.categories.tools.forEach(tool => {
    if (!resumeTechnical.categories.tools.some(r => 
      r.toLowerCase() === tool.toLowerCase()
    )) {
      missing.niceToHave.push({ type: 'tool', term: tool });
    }
  });
  
  return missing;
}

/**
 * Find related technologies (similar but not exact matches)
 */
function findRelatedTechnologies(jobTechnical, resumeTechnical) {
  const related = [];
  
  // Check if resume has related technologies
  const allJobTech = [
    ...jobTechnical.categories.programmingLanguages,
    ...jobTechnical.categories.frameworks
  ];
  
  const allResumeTech = [
    ...resumeTechnical.categories.programmingLanguages,
    ...resumeTechnical.categories.frameworks
  ];
  
  // Technology families
  const techFamilies = {
    'javascript': ['typescript', 'node.js', 'react', 'angular', 'vue'],
    'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
    'java': ['spring', 'hibernate', 'maven', 'gradle'],
    'react': ['next.js', 'gatsby', 'remix'],
    'aws': ['azure', 'gcp', 'google cloud'],
    'docker': ['kubernetes', 'containerization']
  };
  
  allJobTech.forEach(jobTech => {
    const jobTechLower = jobTech.toLowerCase();
    const family = techFamilies[jobTechLower];
    
    if (family) {
      family.forEach(relatedTech => {
        if (allResumeTech.some(r => r.toLowerCase() === relatedTech.toLowerCase())) {
          related.push({
            required: jobTech,
            found: relatedTech,
            relationship: 'related'
          });
        }
      });
    }
  });
  
  return related;
}

/**
 * Generate technical recommendations
 */
function generateTechnicalRecommendations(matches, missingRequirements, jobTechnical) {
  const recommendations = [];
  
  // Critical missing requirements
  if (missingRequirements.critical.length > 0) {
    recommendations.push({
      priority: 'critical',
      title: 'Missing Critical Programming Languages',
      message: `The job requires these programming languages that are not in your resume: ${missingRequirements.critical.map(m => m.term).join(', ')}`,
      action: `Consider learning or highlighting experience with: ${missingRequirements.critical.slice(0, 3).map(m => m.term).join(', ')}`
    });
  }
  
  // Important missing requirements
  if (missingRequirements.important.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Missing Important Frameworks',
      message: `The job mentions these frameworks: ${missingRequirements.important.map(m => m.term).join(', ')}`,
      action: `Consider adding experience with: ${missingRequirements.important.slice(0, 3).map(m => m.term).join(', ')}`
    });
  }
  
  // Low match rates
  Object.entries(matches).forEach(([category, match]) => {
    if (match.matchRate < 50 && match.missing.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: `Low ${category} Match`,
        message: `Only ${match.matchRate.toFixed(1)}% of required ${category} are found`,
        action: `Add these ${category}: ${match.missing.slice(0, 3).join(', ')}`
      });
    }
  });
  
  return recommendations;
}
