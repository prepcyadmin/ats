/**
 * Analyze quantifiable achievements in resume
 * @param {string} resumeText - Resume text
 * @returns {Object} Achievement analysis
 */
export function analyzeAchievements(resumeText) {
  const achievements = [];
  const impactStatements = [];
  const metrics = [];
  
  // Pattern for quantifiable achievements
  const achievementPatterns = [
    // Increased/decreased by X%
    /(increased|decreased|improved|reduced|boosted|enhanced|grew|expanded)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/gi,
    // X% increase/decrease
    /(\d+(?:\.\d+)?)\s*%\s+(?:increase|decrease|improvement|reduction|growth|boost)/gi,
    // Numbers with units (dollars, users, etc.)
    /(\$?\d+(?:,\d{3})*(?:\.\d+)?[KMB]?)\s+(?:dollars?|users?|customers?|revenue|sales|projects?|team\s+members?)/gi,
    // Saved/reduced X amount
    /(saved|reduced|cut|decreased)\s+(\$?\d+(?:,\d{3})*(?:\.\d+)?[KMB]?)/gi,
    // Managed/led X people/team
    /(managed|led|supervised|oversaw)\s+(?:a\s+)?(?:team\s+of\s+)?(\d+)\s+(?:people|employees|team\s+members?|developers?)/gi,
    // Completed X projects/tasks
    /(completed|delivered|executed|implemented)\s+(\d+)\s+(?:projects?|tasks?|features?|applications?)/gi,
    // Years of experience
    /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/gi
  ];
  
  const lines = resumeText.split('\n').filter(line => line.trim().length > 10);
  
  lines.forEach((line, index) => {
    // Check each pattern
    achievementPatterns.forEach((pattern, patternIndex) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const fullMatch = match[0];
        const value = match[1] || match[2];
        
        if (fullMatch && value) {
          achievements.push({
            statement: line.trim(),
            metric: value,
            type: getAchievementType(patternIndex, fullMatch),
            lineNumber: index + 1
          });
          
          // Extract impact statements
          if (isImpactStatement(line)) {
            impactStatements.push({
              statement: line.trim(),
              metric: value
            });
          }
          
          // Extract metrics
          if (!metrics.includes(value)) {
            metrics.push(value);
          }
        }
      }
    });
  });
  
  // Calculate achievement score
  const achievementScore = calculateAchievementScore(achievements.length, lines.length);
  
  // Generate recommendations
  const recommendations = generateAchievementRecommendations(achievements.length, impactStatements.length);
  
  return {
    totalAchievements: achievements.length,
    impactStatements: impactStatements.length,
    metrics: metrics.length,
    achievements: achievements.slice(0, 20), // Limit to 20
    achievementScore,
    recommendations,
    hasQuantifiableResults: achievements.length > 0,
    averageAchievementsPerSection: calculateAveragePerSection(achievements, lines.length)
  };
}

/**
 * Determine achievement type
 */
function getAchievementType(patternIndex, match) {
  const types = [
    'percentage_change',
    'percentage',
    'monetary_value',
    'cost_savings',
    'team_size',
    'project_count',
    'experience_years'
  ];
  
  return types[patternIndex] || 'other';
}

/**
 * Check if statement is an impact statement
 */
function isImpactStatement(line) {
  const impactVerbs = [
    'increased', 'decreased', 'improved', 'reduced', 'boosted',
    'enhanced', 'grew', 'expanded', 'saved', 'cut', 'delivered',
    'achieved', 'accomplished', 'exceeded', 'surpassed'
  ];
  
  const lineLower = line.toLowerCase();
  return impactVerbs.some(verb => lineLower.includes(verb));
}

/**
 * Calculate achievement score (0-100)
 */
function calculateAchievementScore(achievementCount, totalLines) {
  if (totalLines === 0) return 0;
  
  const achievementsPerLine = achievementCount / totalLines;
  
  // Optimal: 1 achievement per 5-10 lines
  if (achievementsPerLine >= 0.1 && achievementsPerLine <= 0.2) {
    return 100;
  } else if (achievementsPerLine >= 0.05 && achievementsPerLine < 0.1) {
    return 80;
  } else if (achievementsPerLine >= 0.2 && achievementsPerLine <= 0.3) {
    return 90; // Good but could be more concise
  } else if (achievementsPerLine > 0.3) {
    return 70; // Too many, may seem inflated
  } else if (achievementsPerLine > 0 && achievementsPerLine < 0.05) {
    return 50; // Too few achievements
  } else {
    return 20; // No quantifiable achievements
  }
}

/**
 * Generate recommendations
 */
function generateAchievementRecommendations(achievementCount, impactCount) {
  const recommendations = [];
  
  if (achievementCount === 0) {
    recommendations.push({
      priority: 'high',
      message: 'Add quantifiable achievements to your resume',
      examples: [
        'Increased sales by 30%',
        'Reduced costs by $50K',
        'Led a team of 5 developers',
        'Completed 10+ projects'
      ]
    });
  } else if (achievementCount < 3) {
    recommendations.push({
      priority: 'medium',
      message: 'Add more quantifiable achievements - aim for 3-5 per role',
      examples: [
        'Include metrics like percentages, dollar amounts, or counts',
        'Focus on impact and results, not just responsibilities'
      ]
    });
  } else if (impactCount < achievementCount * 0.5) {
    recommendations.push({
      priority: 'low',
      message: 'Convert more achievements to impact statements with action verbs',
      examples: [
        'Instead of "Worked on projects" → "Delivered 5 projects that increased revenue by 20%"',
        'Use action verbs: increased, reduced, improved, delivered'
      ]
    });
  } else {
    recommendations.push({
      priority: 'info',
      message: '✅ Good use of quantifiable achievements!',
      examples: []
    });
  }
  
  return recommendations;
}

/**
 * Calculate average achievements per section
 */
function calculateAveragePerSection(achievements, totalLines) {
  if (totalLines === 0 || achievements.length === 0) return 0;
  
  // Estimate sections (rough approximation)
  const estimatedSections = Math.max(1, Math.floor(totalLines / 10));
  return parseFloat((achievements.length / estimatedSections).toFixed(1));
}
