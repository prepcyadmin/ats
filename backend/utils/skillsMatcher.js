import natural from 'natural';
import { extractTechnicalRequirements } from './technicalExtractor.js';

const { WordTokenizer } = natural;

/**
 * Comprehensive skills matching - checks resume text directly, not just extracted lists
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} Skills matching analysis
 */
export function matchSkills(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract technical requirements from job description
  const jobTechnical = extractTechnicalRequirements(jobDescription);
  
  // Get all required skills from job description
  const requiredSkills = getAllRequiredSkills(jobDescription, jobTechnical);
  
  // Check each required skill in resume text directly
  const skillMatches = requiredSkills.map(skill => {
    const found = checkSkillInResume(skill, resumeText, resumeLower);
    return {
      skill: skill.term,
      category: skill.category,
      required: true,
      found: found.found,
      confidence: found.confidence,
      variations: found.variations,
      context: found.context
    };
  });
  
  // Calculate match scores
  const matchedSkills = skillMatches.filter(s => s.found);
  const missingSkills = skillMatches.filter(s => !s.found);
  
  const overallMatchScore = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;
  
  // Category breakdown
  const categoryScores = calculateCategoryScores(skillMatches);
  
  return {
    overallMatchScore,
    totalRequired: requiredSkills.length,
    matched: matchedSkills.length,
    missing: missingSkills.length,
    skillMatches,
    matchedSkills: matchedSkills.map(s => s.skill),
    missingSkills: missingSkills.map(s => s.skill),
    categoryScores,
    recommendations: generateSkillsRecommendations(matchedSkills, missingSkills, requiredSkills.length)
  };
}

/**
 * Get all required skills from job description
 */
function getAllRequiredSkills(jobDescription, jobTechnical) {
  const skills = [];
  
  // Add technical requirements
  jobTechnical.categories.programmingLanguages.forEach(lang => {
    skills.push({ term: lang, category: 'programmingLanguage', priority: 'critical' });
  });
  
  jobTechnical.categories.frameworks.forEach(fw => {
    skills.push({ term: fw, category: 'framework', priority: 'high' });
  });
  
  jobTechnical.categories.tools.forEach(tool => {
    skills.push({ term: tool, category: 'tool', priority: 'medium' });
  });
  
  jobTechnical.categories.databases.forEach(db => {
    skills.push({ term: db, category: 'database', priority: 'high' });
  });
  
  jobTechnical.categories.platforms.forEach(platform => {
    skills.push({ term: platform, category: 'platform', priority: 'medium' });
  });
  
  jobTechnical.categories.methodologies.forEach(method => {
    skills.push({ term: method, category: 'methodology', priority: 'medium' });
  });
  
  // Also extract skills mentioned in text (not just from technical extractor)
  const additionalSkills = extractSkillsFromText(jobDescription);
  additionalSkills.forEach(skill => {
    // Avoid duplicates
    if (!skills.some(s => s.term.toLowerCase() === skill.toLowerCase())) {
      skills.push({ term: skill, category: 'other', priority: 'medium' });
    }
  });
  
  return skills;
}

/**
 * Check if a skill exists in resume with variations and fuzzy matching
 */
function checkSkillInResume(skill, resumeText, resumeLower) {
  const skillLower = skill.term.toLowerCase();
  
  // Get skill variations
  const variations = getSkillVariations(skill.term);
  
  // Check exact match
  let found = false;
  let confidence = 0;
  let matchedVariation = null;
  let context = null;
  
  // Check each variation
  for (const variation of variations) {
    const variationLower = variation.toLowerCase();
    
    // Exact word match
    const exactRegex = new RegExp(`\\b${escapeRegex(variationLower)}\\b`, 'i');
    if (exactRegex.test(resumeText)) {
      found = true;
      confidence = 1.0;
      matchedVariation = variation;
      context = getContext(resumeText, variation, 50);
      break;
    }
    
    // Partial match (e.g., "react" in "react.js" or "reactjs")
    const partialRegex = new RegExp(`\\b${escapeRegex(variationLower)}[.\\s]?[a-z]*\\b`, 'i');
    if (partialRegex.test(resumeText)) {
      found = true;
      confidence = 0.9;
      matchedVariation = variation;
      context = getContext(resumeText, variation, 50);
      break;
    }
  }
  
  // If not found, try fuzzy matching
  if (!found) {
    const fuzzyMatch = fuzzyMatchSkill(skillLower, resumeText);
    if (fuzzyMatch) {
      found = true;
      confidence = fuzzyMatch.confidence;
      matchedVariation = fuzzyMatch.term;
      context = fuzzyMatch.context;
    }
  }
  
  return {
    found,
    confidence,
    variations: variations,
    matchedVariation,
    context
  };
}

/**
 * Get skill variations (e.g., "JavaScript" -> ["javascript", "js", "jsx", "ecmascript"])
 */
function getSkillVariations(skill) {
  const variations = [skill.toLowerCase()];
  
  // Common variations mapping
  const variationMap = {
    'javascript': ['js', 'jsx', 'ecmascript', 'es6', 'es2015', 'node.js', 'nodejs'],
    'typescript': ['ts', 'tsx'],
    'python': ['py', 'python3', 'python2'],
    'react': ['react.js', 'reactjs', 'reactjs', 'react native'],
    'angular': ['angularjs', 'angular.js', 'angular 2'],
    'vue': ['vue.js', 'vuejs'],
    'node.js': ['node', 'nodejs'],
    'express': ['express.js', 'expressjs'],
    'html': ['html5', 'xhtml'],
    'css': ['css3', 'scss', 'sass', 'less'],
    'sql': ['mysql', 'postgresql', 'sqlite'],
    'git': ['github', 'gitlab', 'bitbucket'],
    'aws': ['amazon web services', 'amazon aws'],
    'docker': ['docker container', 'dockerfile'],
    'kubernetes': ['k8s', 'kube'],
    'machine learning': ['ml', 'deep learning', 'ai'],
    'artificial intelligence': ['ai', 'machine learning'],
    'ci/cd': ['continuous integration', 'continuous deployment', 'cicd'],
    'rest': ['rest api', 'restful', 'restful api'],
    'graphql': ['gql'],
    'mongodb': ['mongo', 'mongo db'],
    'postgresql': ['postgres', 'postgres db'],
    'redis': ['redis cache'],
    'elasticsearch': ['elastic search', 'es'],
    'microservices': ['micro service', 'micro-service'],
    'agile': ['scrum', 'kanban'],
    'devops': ['dev ops', 'sre']
  };
  
  const skillLower = skill.toLowerCase();
  if (variationMap[skillLower]) {
    variations.push(...variationMap[skillLower]);
  }
  
  // Add common patterns
  if (skillLower.includes('.')) {
    variations.push(skillLower.replace(/\./g, ''));
    variations.push(skillLower.replace(/\./g, ' '));
  }
  
  if (skillLower.includes(' ')) {
    variations.push(skillLower.replace(/\s+/g, ''));
    variations.push(skillLower.replace(/\s+/g, '-'));
  }
  
  return [...new Set(variations)];
}

/**
 * Fuzzy match skill in resume text
 */
function fuzzyMatchSkill(skill, resumeText) {
  const resumeLower = resumeText.toLowerCase();
  const words = resumeText.toLowerCase().split(/\s+/);
  
  // Check for similar words
  for (const word of words) {
    if (word.length < 3) continue;
    
    const similarity = calculateSimilarity(skill, word);
    if (similarity > 0.7) {
      return {
        term: word,
        confidence: similarity,
        context: getContext(resumeText, word, 50)
      };
    }
  }
  
  // Check for partial matches
  if (skill.length > 4) {
    for (const word of words) {
      if (word.includes(skill) || skill.includes(word)) {
        return {
          term: word,
          confidence: 0.75,
          context: getContext(resumeText, word, 50)
        };
      }
    }
  }
  
  return null;
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / longer.length);
}

/**
 * Levenshtein distance
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
 * Get context around a matched term
 */
function getContext(text, term, length) {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return null;
  
  const start = Math.max(0, index - length);
  const end = Math.min(text.length, index + term.length + length);
  return text.substring(start, end).trim();
}

/**
 * Extract skills from text (comprehensive)
 */
function extractSkillsFromText(text) {
  const skills = [];
  const textLower = text.toLowerCase();
  
  // Comprehensive skill list
  const allSkills = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'sql', 'html', 'css',
    // Frameworks
    'react', 'angular', 'vue', 'svelte', 'ember', 'node.js', 'express', 'nestjs',
    'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', '.net',
    'next.js', 'nuxt.js', 'gatsby', 'graphql',
    // Tools
    'git', 'github', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp',
    'terraform', 'ansible', 'jira', 'slack', 'postman', 'webpack', 'vite',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
    // Methodologies
    'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'microservices',
    // Other
    'machine learning', 'deep learning', 'ai', 'data science', 'big data'
  ];
  
  allSkills.forEach(skill => {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
    if (regex.test(text)) {
      skills.push(skill);
    }
  });
  
  return skills;
}

/**
 * Calculate category scores
 */
function calculateCategoryScores(skillMatches) {
  const categories = {};
  
  skillMatches.forEach(match => {
    if (!categories[match.category]) {
      categories[match.category] = { total: 0, matched: 0 };
    }
    categories[match.category].total++;
    if (match.found) {
      categories[match.category].matched++;
    }
  });
  
  const scores = {};
  Object.entries(categories).forEach(([category, data]) => {
    scores[category] = {
      matchRate: data.total > 0 ? Math.round((data.matched / data.total) * 100) : 0,
      matched: data.matched,
      total: data.total
    };
  });
  
  return scores;
}

/**
 * Generate skills recommendations
 */
function generateSkillsRecommendations(matchedSkills, missingSkills, totalRequired) {
  const recommendations = [];
  
  if (missingSkills.length > 0) {
    const criticalMissing = missingSkills.filter(s => s.priority === 'critical');
    const highMissing = missingSkills.filter(s => s.priority === 'high');
    
    if (criticalMissing.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Missing Critical Skills',
        message: `You're missing ${criticalMissing.length} critical skill(s) required for this position`,
        skills: criticalMissing.map(s => s.skill),
        action: `Focus on learning or highlighting: ${criticalMissing.slice(0, 3).map(s => s.skill).join(', ')}`
      });
    }
    
    if (highMissing.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Missing Important Skills',
        message: `Add ${highMissing.length} important skill(s) to improve your match`,
        skills: highMissing.map(s => s.skill),
        action: `Consider adding: ${highMissing.slice(0, 5).map(s => s.skill).join(', ')}`
      });
    }
  }
  
  return recommendations;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
