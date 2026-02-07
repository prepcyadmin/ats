import natural from 'natural';

const { WordTokenizer } = natural;

/**
 * Analyze keyword density and provide optimization recommendations
 * @param {string} resumeText - Resume text
 * @param {Array<string>} jobKeywords - Keywords from job description
 * @param {Array<string>} resumeKeywords - Keywords found in resume
 * @returns {Object} Keyword optimization analysis
 */
export function analyzeKeywordDensity(resumeText, jobKeywords, resumeKeywords) {
  const tokenizer = new WordTokenizer();
  const tokens = tokenizer.tokenize(resumeText.toLowerCase());
  const totalWords = tokens.length;
  
  const keywordAnalysis = {};
  const recommendations = [];
  const placementSuggestions = [];
  
  // Analyze each job keyword
  jobKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordTokens = keywordLower.split(/\s+/);
    
    // Count occurrences
    let count = 0;
    const positions = [];
    
    // Exact match
    const exactRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const exactMatches = resumeText.match(exactRegex);
    if (exactMatches) {
      count = exactMatches.length;
      // Find positions (approximate)
      let searchIndex = 0;
      while ((searchIndex = resumeText.toLowerCase().indexOf(keywordLower, searchIndex)) !== -1) {
        positions.push(searchIndex);
        searchIndex += keywordLower.length;
      }
    }
    
    // Calculate density (percentage)
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;
    
    // Optimal density is 1-3% per keyword
    const optimalMin = 1;
    const optimalMax = 3;
    const isOptimal = density >= optimalMin && density <= optimalMax;
    const isOverOptimized = density > optimalMax;
    const isMissing = count === 0;
    
    keywordAnalysis[keyword] = {
      count,
      density: parseFloat(density.toFixed(2)),
      isOptimal,
      isOverOptimized,
      isMissing,
      positions: positions.slice(0, 5) // Limit to first 5 positions
    };
    
    // Generate recommendations
    if (isMissing) {
      recommendations.push({
        keyword,
        priority: 'high',
        message: `Add "${keyword}" - this is a required keyword from the job description`,
        suggestedLocations: suggestKeywordPlacement(resumeText, keyword)
      });
    } else if (isOverOptimized) {
      recommendations.push({
        keyword,
        priority: 'medium',
        message: `Reduce "${keyword}" usage - current density (${density.toFixed(2)}%) exceeds optimal range (1-3%)`,
        suggestedLocations: []
      });
    } else if (!isOptimal && density < optimalMin) {
      recommendations.push({
        keyword,
        priority: 'low',
        message: `Consider adding more instances of "${keyword}" - current density (${density.toFixed(2)}%) is below optimal`,
        suggestedLocations: suggestKeywordPlacement(resumeText, keyword)
      });
    }
  });
  
  // Overall keyword optimization score
  const missingCount = Object.values(keywordAnalysis).filter(k => k.isMissing).length;
  const overOptimizedCount = Object.values(keywordAnalysis).filter(k => k.isOverOptimized).length;
  const optimalCount = Object.values(keywordAnalysis).filter(k => k.isOptimal).length;
  
  const optimizationScore = calculateOptimizationScore(
    jobKeywords.length,
    missingCount,
    overOptimizedCount,
    optimalCount
  );
  
  return {
    keywordAnalysis,
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
    optimizationScore,
    summary: {
      totalJobKeywords: jobKeywords.length,
      missingKeywords: missingCount,
      overOptimizedKeywords: overOptimizedCount,
      optimalKeywords: optimalCount,
      averageDensity: calculateAverageDensity(keywordAnalysis)
    },
    placementSuggestions
  };
}

/**
 * Suggest where to place a keyword
 */
function suggestKeywordPlacement(resumeText, keyword) {
  const suggestions = [];
  const sections = {
    summary: /(summary|objective|profile|about)/i,
    experience: /(experience|employment|work history)/i,
    skills: /(skills|technical skills|competencies)/i,
    education: /(education|academic|university|college)/i
  };
  
  const lines = resumeText.split('\n');
  let currentSection = 'experience'; // Default
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [section, pattern] of Object.entries(sections)) {
      if (pattern.test(line)) {
        currentSection = section;
        break;
      }
    }
  }
  
  // Suggest based on keyword type
  const keywordLower = keyword.toLowerCase();
  const technicalKeywords = ['javascript', 'python', 'react', 'sql', 'aws', 'docker'];
  const softKeywords = ['leadership', 'communication', 'teamwork', 'collaboration'];
  
  if (technicalKeywords.some(tech => keywordLower.includes(tech))) {
    suggestions.push('Add to Skills section');
    suggestions.push('Mention in relevant work experience descriptions');
  } else if (softKeywords.some(soft => keywordLower.includes(soft))) {
    suggestions.push('Add to Summary/Profile section');
    suggestions.push('Include in work experience achievements');
  } else {
    suggestions.push(`Add to ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} section`);
    suggestions.push('Include naturally in work experience descriptions');
  }
  
  return suggestions;
}

/**
 * Calculate optimization score (0-100)
 */
function calculateOptimizationScore(totalKeywords, missing, overOptimized, optimal) {
  if (totalKeywords === 0) return 100;
  
  const missingPenalty = (missing / totalKeywords) * 50;
  const overOptimizedPenalty = (overOptimized / totalKeywords) * 20;
  const optimalBonus = (optimal / totalKeywords) * 30;
  
  const score = 100 - missingPenalty - overOptimizedPenalty + optimalBonus;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate average keyword density
 */
function calculateAverageDensity(keywordAnalysis) {
  const densities = Object.values(keywordAnalysis).map(k => k.density);
  if (densities.length === 0) return 0;
  
  const sum = densities.reduce((a, b) => a + b, 0);
  return parseFloat((sum / densities.length).toFixed(2));
}
