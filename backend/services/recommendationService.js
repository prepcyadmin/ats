import { extractAdvancedKeywords } from '../utils/advancedNLP.js';
import { config } from '../config/index.js';

/**
 * Generate actionable recommendations for resume improvement
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description
 * @param {Object} analysis - Existing analysis results
 * @param {Object} structuredData - Parsed resume data
 * @returns {Object} Recommendations
 */
export function generateRecommendations(resumeText, jobDescription, analysis, structuredData) {
  const recommendations = {
    keywords: generateKeywordRecommendations(resumeText, jobDescription, analysis),
    skills: generateSkillsRecommendations(resumeText, jobDescription, analysis, structuredData),
    sections: generateSectionRecommendations(structuredData),
    achievements: generateAchievementRecommendations(resumeText),
    actionVerbs: generateActionVerbRecommendations(resumeText),
    overall: []
  };
  
  // Generate overall priority recommendations
  recommendations.overall = prioritizeRecommendations(recommendations);
  
  return recommendations;
}

/**
 * Generate keyword recommendations
 */
function generateKeywordRecommendations(resumeText, jobDescription, analysis) {
  const recommendations = [];
  const resumeLower = resumeText.toLowerCase();
  
  // Get missing keywords
  const jobKeywords = analysis.jobKeywords || [];
  const resumeKeywords = analysis.topKeywords || [];
  const resumeKeywordsLower = resumeKeywords.map(k => k.toLowerCase());
  
  const missingKeywords = jobKeywords.filter(jobKw => {
    const jobKwLower = jobKw.toLowerCase();
    return !resumeKeywordsLower.some(resKw => 
      resKw.includes(jobKwLower) || jobKwLower.includes(resKw)
    ) && !resumeLower.includes(jobKwLower);
  });
  
  if (missingKeywords.length > 0) {
    recommendations.push({
      type: 'missing_keywords',
      priority: 'high',
      title: 'Add Missing Keywords',
      message: `Add these ${missingKeywords.length} important keywords from the job description`,
      keywords: missingKeywords.slice(0, 10),
      suggestions: missingKeywords.slice(0, 5).map(keyword => ({
        keyword,
        locations: suggestKeywordLocations(resumeText, keyword)
      }))
    });
  }
  
  // Related keyword suggestions
  const relatedKeywords = suggestRelatedKeywords(jobKeywords, resumeKeywords);
  if (relatedKeywords.length > 0) {
    recommendations.push({
      type: 'related_keywords',
      priority: 'medium',
      title: 'Consider Adding Related Keywords',
      message: 'These related keywords may strengthen your resume',
      keywords: relatedKeywords.slice(0, 8)
    });
  }
  
  return recommendations;
}

/**
 * Generate skills recommendations
 */
function generateSkillsRecommendations(resumeText, jobDescription, analysis, structuredData) {
  const recommendations = [];
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract skills from job description
  const jobSkills = extractSkillsFromText(jobDescription);
  const resumeSkills = structuredData?.skills || {};
  const allResumeSkills = [
    ...(resumeSkills.technical || []),
    ...(resumeSkills.soft || []),
    ...(resumeSkills.tools || [])
  ].map(s => s.toLowerCase());
  
  // Find missing skills
  const missingSkills = jobSkills.filter(skill => 
    !allResumeSkills.some(rs => 
      rs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rs)
    ) && !resumeLower.includes(skill.toLowerCase())
  );
  
  if (missingSkills.length > 0) {
    recommendations.push({
      type: 'missing_skills',
      priority: 'high',
      title: 'Add Missing Skills',
      message: `The job description mentions these skills that aren't in your resume`,
      skills: missingSkills.slice(0, 10),
      action: 'Add these skills to your Skills section and mention them in relevant work experience'
    });
  }
  
  // Skills gap analysis
  const skillsGap = calculateSkillsGap(jobSkills, allResumeSkills);
  if (skillsGap.percentage > 30) {
    recommendations.push({
      type: 'skills_gap',
      priority: 'high',
      title: 'Significant Skills Gap',
      message: `Your resume matches only ${100 - skillsGap.percentage}% of required skills`,
      gap: skillsGap,
      action: 'Focus on acquiring or highlighting the missing skills'
    });
  }
  
  return recommendations;
}

/**
 * Generate section recommendations
 */
function generateSectionRecommendations(structuredData) {
  const recommendations = [];
  
  // Contact info recommendations
  if (!structuredData.contactInfo?.email) {
    recommendations.push({
      type: 'missing_contact',
      priority: 'high',
      title: 'Add Email Address',
      message: 'Email address is required for job applications',
      action: 'Add your email address to the contact section'
    });
  }
  
  if (!structuredData.contactInfo?.phone) {
    recommendations.push({
      type: 'missing_phone',
      priority: 'high',
      title: 'Add Phone Number',
      message: 'Phone number helps recruiters contact you',
      action: 'Add your phone number to the contact section'
    });
  }
  
  // Experience recommendations
  if (!structuredData.workExperience || structuredData.workExperience.length === 0) {
    recommendations.push({
      type: 'missing_experience',
      priority: 'critical',
      title: 'Add Work Experience',
      message: 'Work experience section is essential',
      action: 'Add your work history with company names, titles, dates, and descriptions'
    });
  } else if (structuredData.workExperience.length < 2) {
    recommendations.push({
      type: 'limited_experience',
      priority: 'medium',
      title: 'Add More Experience',
      message: 'Consider adding more work experience entries',
      action: 'Include internships, projects, or volunteer work if applicable'
    });
  }
  
  // Education recommendations
  if (!structuredData.education || structuredData.education.length === 0) {
    recommendations.push({
      type: 'missing_education',
      priority: 'high',
      title: 'Add Education',
      message: 'Education section is important for most positions',
      action: 'Add your educational background including degree and institution'
    });
  }
  
  return recommendations;
}

/**
 * Generate achievement recommendations
 */
function generateAchievementRecommendations(resumeText) {
  const recommendations = [];
  
  // Check for quantifiable achievements
  const achievementPatterns = [
    /\d+%/g,
    /\$\d+/g,
    /\d+\s+(?:years?|people|projects?|users?|customers?)/gi
  ];
  
  let achievementCount = 0;
  achievementPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) achievementCount += matches.length;
  });
  
  if (achievementCount === 0) {
    recommendations.push({
      type: 'no_achievements',
      priority: 'high',
      title: 'Add Quantifiable Achievements',
      message: 'Resumes with numbers and metrics perform better',
      examples: [
        'Increased sales by 30%',
        'Reduced costs by $50K',
        'Led a team of 5 developers',
        'Completed 10+ projects'
      ],
      action: 'Add specific numbers, percentages, and metrics to your achievements'
    });
  } else if (achievementCount < 3) {
    recommendations.push({
      type: 'few_achievements',
      priority: 'medium',
      title: 'Add More Quantifiable Achievements',
      message: `You have ${achievementCount} quantifiable achievement(s) - aim for 3-5 per role`,
      action: 'Include more metrics, percentages, and specific numbers'
    });
  }
  
  return recommendations;
}

/**
 * Generate action verb recommendations
 */
function generateActionVerbRecommendations(resumeText) {
  const recommendations = [];
  
  const strongActionVerbs = [
    'achieved', 'delivered', 'developed', 'implemented', 'improved',
    'increased', 'led', 'managed', 'optimized', 'reduced', 'created',
    'designed', 'executed', 'launched', 'established', 'transformed'
  ];
  
  const weakVerbs = ['worked', 'did', 'helped', 'assisted', 'participated'];
  
  const resumeLower = resumeText.toLowerCase();
  const strongVerbCount = strongActionVerbs.filter(verb => 
    resumeLower.includes(verb)
  ).length;
  
  const weakVerbCount = weakVerbs.filter(verb => 
    resumeLower.includes(verb)
  ).length;
  
  if (weakVerbCount > strongVerbCount) {
    recommendations.push({
      type: 'weak_verbs',
      priority: 'medium',
      title: 'Use Stronger Action Verbs',
      message: 'Replace weak verbs with more impactful action verbs',
      weakVerbs: weakVerbs.filter(v => resumeLower.includes(v)),
      suggestions: strongActionVerbs.slice(0, 10),
      action: 'Replace weak verbs like "worked" or "helped" with stronger verbs like "developed" or "achieved"'
    });
  }
  
  return recommendations;
}

/**
 * Suggest keyword locations
 */
function suggestKeywordLocations(resumeText, keyword) {
  const suggestions = [];
  const sections = {
    'Skills': /(skills|technical skills|competencies)/i,
    'Experience': /(experience|employment|work history)/i,
    'Summary': /(summary|objective|profile|about)/i
  };
  
  const lines = resumeText.split('\n');
  let currentSection = 'Experience';
  
  for (const line of lines) {
    for (const [section, pattern] of Object.entries(sections)) {
      if (pattern.test(line)) {
        currentSection = section;
        break;
      }
    }
  }
  
  suggestions.push(`Add to ${currentSection} section`);
  suggestions.push('Include in relevant work experience descriptions');
  
  return suggestions;
}

/**
 * Suggest related keywords
 */
function suggestRelatedKeywords(jobKeywords, resumeKeywords) {
  const related = [];
  const keywordGroups = {
    'javascript': ['typescript', 'node.js', 'react', 'angular', 'vue'],
    'python': ['django', 'flask', 'pandas', 'numpy', 'machine learning'],
    'aws': ['cloud', 'azure', 'gcp', 'devops', 'infrastructure'],
    'sql': ['database', 'mysql', 'postgresql', 'mongodb', 'nosql'],
    'agile': ['scrum', 'kanban', 'sprint', 'jira', 'project management']
  };
  
  jobKeywords.forEach(jobKw => {
    const jobKwLower = jobKw.toLowerCase();
    for (const [key, group] of Object.entries(keywordGroups)) {
      if (jobKwLower.includes(key) || key.includes(jobKwLower)) {
        group.forEach(relatedKw => {
          if (!resumeKeywords.some(rk => rk.toLowerCase().includes(relatedKw))) {
            if (!related.includes(relatedKw)) {
              related.push(relatedKw);
            }
          }
        });
      }
    }
  });
  
  return related;
}

/**
 * Extract skills from text
 */
function extractSkillsFromText(text) {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
    'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'agile',
    'scrum', 'leadership', 'communication', 'teamwork', 'problem-solving'
  ];
  
  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => textLower.includes(skill));
}

/**
 * Calculate skills gap
 */
function calculateSkillsGap(jobSkills, resumeSkills) {
  if (jobSkills.length === 0) return { percentage: 0, missing: [] };
  
  const missing = jobSkills.filter(js => 
    !resumeSkills.some(rs => 
      rs.includes(js.toLowerCase()) || js.toLowerCase().includes(rs)
    )
  );
  
  return {
    percentage: Math.round((missing.length / jobSkills.length) * 100),
    missing: missing.slice(0, 10)
  };
}

/**
 * Prioritize recommendations
 */
function prioritizeRecommendations(recommendations) {
  const all = [
    ...recommendations.keywords,
    ...recommendations.skills,
    ...recommendations.sections,
    ...recommendations.achievements,
    ...recommendations.actionVerbs
  ];
  
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return all
    .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
    .slice(0, 10); // Top 10 recommendations
}
