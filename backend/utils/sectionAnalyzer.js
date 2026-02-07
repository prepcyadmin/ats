/**
 * Analyze resume sections for completeness and quality
 * @param {string} resumeText - Resume text
 * @param {Object} structuredData - Parsed structured resume data
 * @returns {Object} Section analysis
 */
export function analyzeSections(resumeText, structuredData) {
  const sections = {
    contact: analyzeContactSection(structuredData.contactInfo),
    summary: analyzeSummarySection(resumeText, structuredData.summary),
    experience: analyzeExperienceSection(structuredData.workExperience),
    education: analyzeEducationSection(structuredData.education),
    skills: analyzeSkillsSection(structuredData.skills),
    certifications: analyzeCertificationsSection(structuredData.certifications),
    projects: analyzeProjectsSection(structuredData.projects)
  };
  
  // Calculate overall section score
  const sectionScores = Object.values(sections).map(s => s.score || 0);
  const overallScore = sectionScores.length > 0
    ? Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length)
    : 0;
  
  return {
    sections,
    overallScore,
    completeness: calculateCompleteness(sections),
    recommendations: generateSectionRecommendations(sections)
  };
}

/**
 * Analyze contact section
 */
function analyzeContactSection(contactInfo) {
  const issues = [];
  const score = 100;
  
  if (!contactInfo.email) {
    issues.push('Missing email address');
  }
  
  if (!contactInfo.phone) {
    issues.push('Missing phone number');
  }
  
  if (!contactInfo.name) {
    issues.push('Name not clearly identified');
  }
  
  const penalty = issues.length * 20;
  const finalScore = Math.max(0, score - penalty);
  
  return {
    name: 'Contact Information',
    score: finalScore,
    completeness: calculateCompletenessPercentage(contactInfo, ['email', 'phone', 'name']),
    issues,
    strengths: getContactStrengths(contactInfo)
  };
}

/**
 * Analyze summary section
 */
function analyzeSummarySection(resumeText, summary) {
  const issues = [];
  let score = 100;
  
  if (!summary || summary.length < 50) {
    issues.push('Missing or too short professional summary');
    score -= 40;
  } else if (summary.length < 100) {
    issues.push('Professional summary is too brief - aim for 2-4 sentences');
    score -= 20;
  } else if (summary.length > 300) {
    issues.push('Professional summary is too long - keep it concise (2-4 sentences)');
    score -= 10;
  }
  
  // Check for action verbs
  const actionVerbs = ['developed', 'managed', 'led', 'created', 'improved', 'achieved', 'delivered'];
  const hasActionVerbs = actionVerbs.some(verb => 
    summary && summary.toLowerCase().includes(verb)
  );
  
  if (!hasActionVerbs && summary) {
    issues.push('Add action verbs to make summary more impactful');
    score -= 10;
  }
  
  return {
    name: 'Professional Summary',
    score: Math.max(0, score),
    completeness: summary ? 100 : 0,
    issues,
    strengths: summary && summary.length >= 100 && summary.length <= 300 
      ? ['Well-balanced length', 'Present'] 
      : summary ? ['Present'] : []
  };
}

/**
 * Analyze experience section
 */
function analyzeExperienceSection(experience) {
  const issues = [];
  let score = 100;
  
  if (!experience || experience.length === 0) {
    issues.push('Missing work experience section');
    score = 0;
  } else {
    if (experience.length < 2) {
      issues.push('Consider adding more work experience entries');
      score -= 15;
    }
    
    // Check for dates
    const entriesWithDates = experience.filter(e => e.dates).length;
    if (entriesWithDates < experience.length) {
      issues.push(`${experience.length - entriesWithDates} experience entries missing dates`);
      score -= (experience.length - entriesWithDates) * 10;
    }
    
    // Check for descriptions
    const entriesWithDescriptions = experience.filter(e => 
      e.description && e.description.length > 0
    ).length;
    if (entriesWithDescriptions < experience.length) {
      issues.push(`${experience.length - entriesWithDescriptions} experience entries missing descriptions`);
      score -= (experience.length - entriesWithDescriptions) * 15;
    }
  }
  
  return {
    name: 'Work Experience',
    score: Math.max(0, score),
    completeness: experience && experience.length > 0 ? 100 : 0,
    issues,
    strengths: experience && experience.length >= 2 
      ? [`${experience.length} experience entries`, 'Well-structured'] 
      : experience && experience.length > 0 
        ? ['Present'] 
        : []
  };
}

/**
 * Analyze education section
 */
function analyzeEducationSection(education) {
  const issues = [];
  let score = 100;
  
  if (!education || education.length === 0) {
    issues.push('Missing education section');
    score = 0;
  } else {
    // Check for degree information
    const entriesWithDegree = education.filter(e => e.degree).length;
    if (entriesWithDegree < education.length) {
      issues.push('Some education entries missing degree information');
      score -= 20;
    }
    
    // Check for institution
    const entriesWithInstitution = education.filter(e => e.institution).length;
    if (entriesWithInstitution < education.length) {
      issues.push('Some education entries missing institution name');
      score -= 15;
    }
  }
  
  return {
    name: 'Education',
    score: Math.max(0, score),
    completeness: education && education.length > 0 ? 100 : 0,
    issues,
    strengths: education && education.length > 0 
      ? [`${education.length} education entries`, 'Present'] 
      : []
  };
}

/**
 * Analyze skills section
 */
function analyzeSkillsSection(skills) {
  const issues = [];
  let score = 100;
  
  const totalSkills = (skills.technical?.length || 0) + 
                      (skills.soft?.length || 0) + 
                      (skills.tools?.length || 0);
  
  if (totalSkills === 0) {
    issues.push('Missing skills section');
    score = 0;
  } else {
    if (totalSkills < 5) {
      issues.push('Skills section is too brief - add more relevant skills');
      score -= 20;
    }
    
    if (!skills.technical || skills.technical.length === 0) {
      issues.push('Missing technical skills');
      score -= 30;
    }
    
    if (!skills.soft || skills.soft.length === 0) {
      issues.push('Consider adding soft skills');
      score -= 10;
    }
  }
  
  return {
    name: 'Skills',
    score: Math.max(0, score),
    completeness: totalSkills > 0 ? 100 : 0,
    issues,
    strengths: totalSkills >= 10 
      ? [`${totalSkills} skills listed`, 'Well-categorized'] 
      : totalSkills > 0 
        ? ['Present'] 
        : []
  };
}

/**
 * Analyze certifications section
 */
function analyzeCertificationsSection(certifications) {
  const issues = [];
  let score = 100;
  
  if (!certifications || certifications.length === 0) {
    // Not critical, but nice to have
    issues.push('Consider adding relevant certifications');
    score = 70;
  }
  
  return {
    name: 'Certifications',
    score: Math.max(0, score),
    completeness: certifications && certifications.length > 0 ? 100 : 0,
    issues,
    strengths: certifications && certifications.length > 0 
      ? [`${certifications.length} certifications listed`] 
      : []
  };
}

/**
 * Analyze projects section
 */
function analyzeProjectsSection(projects) {
  const issues = [];
  let score = 100;
  
  if (!projects || projects.length === 0) {
    // Not critical, but valuable
    issues.push('Consider adding a projects section to showcase your work');
    score = 60;
  } else if (projects.length < 2) {
    issues.push('Consider adding more projects to showcase your experience');
    score -= 15;
  }
  
  return {
    name: 'Projects',
    score: Math.max(0, score),
    completeness: projects && projects.length > 0 ? 100 : 0,
    issues,
    strengths: projects && projects.length >= 2 
      ? [`${projects.length} projects listed`] 
      : projects && projects.length > 0 
        ? ['Present'] 
        : []
  };
}

/**
 * Calculate completeness percentage
 */
function calculateCompletenessPercentage(data, requiredFields) {
  if (!data) return 0;
  
  const presentFields = requiredFields.filter(field => {
    const value = data[field];
    return value !== null && value !== undefined && value !== '';
  });
  
  return Math.round((presentFields.length / requiredFields.length) * 100);
}

/**
 * Calculate overall completeness
 */
function calculateCompleteness(sections) {
  const criticalSections = ['contact', 'experience', 'education', 'skills'];
  const presentSections = criticalSections.filter(section => 
    sections[section] && sections[section].completeness > 0
  );
  
  return {
    percentage: Math.round((presentSections.length / criticalSections.length) * 100),
    present: presentSections.length,
    total: criticalSections.length,
    missing: criticalSections.filter(s => !presentSections.includes(s))
  };
}

/**
 * Get contact strengths
 */
function getContactStrengths(contactInfo) {
  const strengths = [];
  
  if (contactInfo.email) strengths.push('Email present');
  if (contactInfo.phone) strengths.push('Phone present');
  if (contactInfo.linkedin) strengths.push('LinkedIn profile');
  if (contactInfo.github) strengths.push('GitHub profile');
  if (contactInfo.website) strengths.push('Personal website');
  
  return strengths;
}

/**
 * Generate section recommendations
 */
function generateSectionRecommendations(sections) {
  const recommendations = [];
  
  Object.values(sections).forEach(section => {
    if (section.score < 70) {
      recommendations.push({
        section: section.name,
        priority: section.score < 50 ? 'high' : 'medium',
        issues: section.issues,
        action: `Improve ${section.name} section`
      });
    }
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 2, medium: 1, low: 0 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
