/**
 * Analyze resume against ATS best practices
 * Checks resume structure, completeness, and ATS compatibility
 * @param {string} resumeText - Resume text
 * @param {Object} structuredData - Parsed structured resume data
 * @returns {Object} ATS best practices analysis
 */
export function analyzeATSBestPractices(resumeText, structuredData) {
  const analysis = {
    overallScore: 0,
    sections: {},
    issues: [],
    recommendations: [],
    strengths: [],
    atsCompatibility: {
      score: 0,
      factors: []
    }
  };

  // 1. Check Required Sections (basic check)
  const sectionAnalysis = analyzeRequiredSections(resumeText, structuredData);
  
  // 2. Check Contact Information Completeness (detailed)
  const contactAnalysis = analyzeContactInformation(structuredData.contactInfo);
  // Merge: use detailed analysis but preserve basic structure
  analysis.sections.contact = {
    ...sectionAnalysis.contact,
    ...contactAnalysis,
    score: contactAnalysis.score || sectionAnalysis.contact.score || 0
  };

  // 3. Check Professional Summary (detailed)
  const summaryAnalysis = analyzeProfessionalSummary(resumeText, structuredData.summary);
  analysis.sections.summary = {
    ...sectionAnalysis.summary,
    ...summaryAnalysis,
    score: summaryAnalysis.score || sectionAnalysis.summary.score || 0
  };

  // 4. Check Work Experience Structure (detailed)
  const experienceAnalysis = analyzeWorkExperience(structuredData.workExperience, resumeText);
  analysis.sections.experience = {
    ...sectionAnalysis.experience,
    ...experienceAnalysis,
    score: experienceAnalysis.score || sectionAnalysis.experience.score || 0
  };

  // 5. Check Education Section (detailed)
  const educationAnalysis = analyzeEducation(structuredData.education, resumeText);
  analysis.sections.education = {
    ...sectionAnalysis.education,
    ...educationAnalysis,
    score: educationAnalysis.score || sectionAnalysis.education.score || 0
  };

  // 6. Check Skills Section (detailed)
  const skillsAnalysis = analyzeSkillsSection(structuredData.skills, resumeText);
  analysis.sections.skills = {
    ...sectionAnalysis.skills,
    ...skillsAnalysis,
    score: skillsAnalysis.score || sectionAnalysis.skills.score || 0
  };

  // 7. Check Location/Address
  const locationAnalysis = analyzeLocation(structuredData.contactInfo, resumeText);
  analysis.sections.location = locationAnalysis;

  // 8. Check Resume Length
  const lengthAnalysis = analyzeResumeLength(resumeText);
  analysis.sections.length = lengthAnalysis;

  // 9. Check Keywords and Optimization
  const keywordAnalysis = analyzeKeywordOptimization(resumeText);
  analysis.sections.keywords = keywordAnalysis;

  // 10. Check Quantifiable Achievements
  const achievementAnalysis = analyzeAchievements(resumeText);
  analysis.sections.achievements = achievementAnalysis;

  // 11. Check Action Verbs
  const actionVerbAnalysis = analyzeActionVerbs(resumeText);
  analysis.sections.actionVerbs = actionVerbAnalysis;

  // 12. Check File Format and Structure
  const formatAnalysis = analyzeFormatAndStructure(resumeText);
  analysis.sections.format = formatAnalysis;

  // Calculate overall ATS score
  analysis.overallScore = calculateOverallATSScore(analysis.sections);

  // Generate comprehensive recommendations
  analysis.recommendations = generateATSRecommendations(analysis.sections, analysis.overallScore);

  // Identify strengths
  analysis.strengths = identifyStrengths(analysis.sections);

  // ATS Compatibility Score
  analysis.atsCompatibility = calculateATSCompatibility(analysis.sections);

  return analysis;
}

/**
 * Analyze required sections
 */
function analyzeRequiredSections(resumeText, structuredData) {
  const requiredSections = {
    contact: { present: false, score: 0, issues: [] },
    summary: { present: false, score: 0, issues: [] },
    experience: { present: false, score: 0, issues: [] },
    education: { present: false, score: 0, issues: [] },
    skills: { present: false, score: 0, issues: [] }
  };

  const textLower = resumeText.toLowerCase();

  // Check for contact section
  if (structuredData.contactInfo && (structuredData.contactInfo.email || structuredData.contactInfo.phone)) {
    requiredSections.contact.present = true;
    requiredSections.contact.score = 100;
  } else {
    requiredSections.contact.issues.push('Missing contact information (email or phone)');
    requiredSections.contact.score = 0;
  }

  // Check for summary
  if (structuredData.summary && structuredData.summary.length > 50) {
    requiredSections.summary.present = true;
    requiredSections.summary.score = structuredData.summary.length >= 100 ? 100 : 70;
    if (structuredData.summary.length < 100) {
      requiredSections.summary.issues.push('Professional summary is too brief (aim for 2-4 sentences)');
    }
  } else {
    requiredSections.summary.issues.push('Missing professional summary or objective');
    requiredSections.summary.score = 0;
  }

  // Check for experience
  if (structuredData.workExperience && structuredData.workExperience.length > 0) {
    requiredSections.experience.present = true;
    requiredSections.experience.score = structuredData.workExperience.length >= 2 ? 100 : 80;
    if (structuredData.workExperience.length < 2) {
      requiredSections.experience.issues.push('Consider adding more work experience entries');
    }
  } else {
    requiredSections.experience.issues.push('Missing work experience section');
    requiredSections.experience.score = 0;
  }

  // Check for education
  if (structuredData.education && structuredData.education.length > 0) {
    requiredSections.education.present = true;
    requiredSections.education.score = 100;
  } else {
    requiredSections.education.issues.push('Missing education section');
    requiredSections.education.score = 0;
  }

  // Check for skills
  const totalSkills = (structuredData.skills?.technical?.length || 0) + 
                      (structuredData.skills?.soft?.length || 0);
  if (totalSkills > 0) {
    requiredSections.skills.present = true;
    requiredSections.skills.score = totalSkills >= 5 ? 100 : 70;
    if (totalSkills < 5) {
      requiredSections.skills.issues.push('Skills section is too brief - add more skills');
    }
  } else {
    requiredSections.skills.issues.push('Missing skills section');
    requiredSections.skills.score = 0;
  }

  return requiredSections;
}

/**
 * Analyze contact information
 */
function analyzeContactInformation(contactInfo) {
  const analysis = {
    score: 0,
    completeness: 0,
    issues: [],
    recommendations: []
  };

  if (!contactInfo) {
    analysis.issues.push('Contact information section is missing');
    return analysis;
  }

  let completeness = 0;
  const requiredFields = ['email', 'phone', 'name'];
  const optionalFields = ['linkedin', 'github', 'address'];

  // Check required fields
  if (contactInfo.email) completeness += 33.3;
  else analysis.issues.push('Missing email address');

  if (contactInfo.phone) completeness += 33.3;
  else analysis.issues.push('Missing phone number');

  if (contactInfo.name) completeness += 33.3;
  else analysis.issues.push('Name not clearly identified');

  // Check optional but recommended fields
  if (contactInfo.linkedin) completeness += 10;
  else analysis.recommendations.push('Consider adding LinkedIn profile');

  if (contactInfo.address) completeness += 10;
  else analysis.recommendations.push('Consider adding location/address');

  analysis.completeness = Math.min(100, Math.round(completeness));
  analysis.score = analysis.completeness;

  return analysis;
}

/**
 * Analyze professional summary
 */
function analyzeProfessionalSummary(resumeText, summary) {
  const analysis = {
    score: 0,
    present: false,
    quality: 0,
    issues: [],
    recommendations: []
  };

  if (!summary || summary.length < 50) {
    analysis.issues.push('Missing or too short professional summary');
    analysis.score = 0;
    return analysis;
  }

  analysis.present = true;

  // Check length (optimal: 100-300 characters)
  if (summary.length >= 100 && summary.length <= 300) {
    analysis.quality += 40;
  } else if (summary.length < 100) {
    analysis.quality += 20;
    analysis.issues.push('Professional summary is too brief - aim for 2-4 sentences');
  } else {
    analysis.quality += 30;
    analysis.issues.push('Professional summary is too long - keep it concise');
  }

  // Check for action verbs
  const actionVerbs = ['developed', 'managed', 'led', 'created', 'improved', 'achieved', 'delivered', 'designed'];
  const hasActionVerbs = actionVerbs.some(verb => summary.toLowerCase().includes(verb));
  if (hasActionVerbs) {
    analysis.quality += 30;
  } else {
    analysis.quality += 10;
    analysis.recommendations.push('Add action verbs to make summary more impactful');
  }

  // Check for keywords/skills
  const technicalTerms = ['experience', 'skills', 'expertise', 'proficient', 'knowledge'];
  const hasKeywords = technicalTerms.some(term => summary.toLowerCase().includes(term));
  if (hasKeywords) {
    analysis.quality += 30;
  } else {
    analysis.quality += 20;
    analysis.recommendations.push('Include relevant skills or expertise in summary');
  }

  analysis.score = Math.min(100, analysis.quality);

  return analysis;
}

/**
 * Analyze work experience
 */
function analyzeWorkExperience(experience, resumeText) {
  const analysis = {
    score: 0,
    present: false,
    quality: 0,
    issues: [],
    recommendations: []
  };

  if (!experience || experience.length === 0) {
    analysis.issues.push('Missing work experience section');
    analysis.score = 0;
    return analysis;
  }

  analysis.present = true;

  // Check number of entries
  if (experience.length >= 2) {
    analysis.quality += 30;
  } else {
    analysis.quality += 15;
    analysis.issues.push('Consider adding more work experience entries');
  }

  // Check for dates
  const entriesWithDates = experience.filter(e => e.dates).length;
  if (entriesWithDates === experience.length) {
    analysis.quality += 25;
  } else {
    analysis.quality += 10;
    analysis.issues.push(`${experience.length - entriesWithDates} experience entries missing dates`);
  }

  // Check for descriptions
  const entriesWithDescriptions = experience.filter(e => 
    e.description && Array.isArray(e.description) && e.description.length > 0
  ).length;
  
  if (entriesWithDescriptions === experience.length) {
    analysis.quality += 25;
  } else {
    analysis.quality += 10;
    analysis.issues.push(`${experience.length - entriesWithDescriptions} experience entries missing descriptions`);
  }

  // Check for quantifiable achievements
  const achievementPattern = /\d+%|\$\d+|\d+\s+(?:years?|people|projects?|users?)/gi;
  const hasAchievements = achievementPattern.test(resumeText);
  if (hasAchievements) {
    analysis.quality += 20;
  } else {
    analysis.quality += 5;
    analysis.recommendations.push('Add quantifiable achievements to work experience (numbers, percentages, metrics)');
  }

  analysis.score = Math.min(100, analysis.quality);

  return analysis;
}

/**
 * Analyze education section
 */
function analyzeEducation(education, resumeText) {
  const analysis = {
    score: 0,
    present: false,
    quality: 0,
    issues: [],
    recommendations: []
  };

  if (!education || education.length === 0) {
    analysis.issues.push('Missing education section');
    analysis.score = 0;
    return analysis;
  }

  analysis.present = true;

  // Check for degree information
  const entriesWithDegree = education.filter(e => e.degree).length;
  if (entriesWithDegree === education.length) {
    analysis.quality += 40;
  } else {
    analysis.quality += 20;
    analysis.issues.push('Some education entries missing degree information');
  }

  // Check for institution
  const entriesWithInstitution = education.filter(e => e.institution).length;
  if (entriesWithInstitution === education.length) {
    analysis.quality += 40;
  } else {
    analysis.quality += 20;
    analysis.issues.push('Some education entries missing institution name');
  }

  // Check for dates
  const entriesWithDates = education.filter(e => e.dates).length;
  if (entriesWithDates > 0) {
    analysis.quality += 20;
  } else {
    analysis.recommendations.push('Consider adding dates to education entries');
  }

  analysis.score = Math.min(100, analysis.quality);

  return analysis;
}

/**
 * Analyze skills section
 */
function analyzeSkillsSection(skills, resumeText) {
  const analysis = {
    score: 0,
    present: false,
    quality: 0,
    issues: [],
    recommendations: []
  };

  const totalSkills = (skills?.technical?.length || 0) + 
                      (skills?.soft?.length || 0) + 
                      (skills?.tools?.length || 0);

  if (totalSkills === 0) {
    analysis.issues.push('Missing skills section');
    analysis.score = 0;
    return analysis;
  }

  analysis.present = true;

  // Check total number of skills
  if (totalSkills >= 10) {
    analysis.quality += 40;
  } else if (totalSkills >= 5) {
    analysis.quality += 30;
  } else {
    analysis.quality += 15;
    analysis.issues.push('Skills section is too brief - add more relevant skills');
  }

  // Check for technical skills
  if (skills.technical && skills.technical.length > 0) {
    analysis.quality += 30;
  } else {
    analysis.quality += 0;
    analysis.issues.push('Missing technical skills');
  }

  // Check for soft skills
  if (skills.soft && skills.soft.length > 0) {
    analysis.quality += 20;
  } else {
    analysis.quality += 10;
    analysis.recommendations.push('Consider adding soft skills');
  }

  // Check for tools
  if (skills.tools && skills.tools.length > 0) {
    analysis.quality += 10;
  }

  analysis.score = Math.min(100, analysis.quality);

  return analysis;
}

/**
 * Analyze location/address
 */
function analyzeLocation(contactInfo, resumeText) {
  const analysis = {
    score: 0,
    present: false,
    issues: [],
    recommendations: []
  };

  // Check if address is in contact info
  if (contactInfo && contactInfo.address) {
    analysis.present = true;
    analysis.score = 100;
  } else {
    // Check if location is mentioned in text
    const locationPatterns = [
      /[A-Z][a-z]+,\s*[A-Z]{2}/,  // City, State
      /[A-Z][a-z]+\s+[A-Z]{2}/,   // City State
      /\b(?:located|based|in)\s+[A-Z][a-z]+/i  // "located in City"
    ];

    const hasLocation = locationPatterns.some(pattern => pattern.test(resumeText));
    if (hasLocation) {
      analysis.present = true;
      analysis.score = 80;
      analysis.recommendations.push('Consider adding location to contact section for better ATS parsing');
    } else {
      analysis.issues.push('Location/address not found - ATS systems often filter by location');
      analysis.score = 50;
      analysis.recommendations.push('Add your location (city, state) to improve ATS compatibility');
    }
  }

  return analysis;
}

/**
 * Analyze resume length
 */
function analyzeResumeLength(resumeText) {
  const analysis = {
    score: 0,
    wordCount: 0,
    pageEstimate: 0,
    issues: [],
    recommendations: []
  };

  const words = resumeText.split(/\s+/).filter(w => w.length > 0);
  analysis.wordCount = words.length;
  
  // Estimate pages (approximately 250-300 words per page)
  analysis.pageEstimate = Math.ceil(words.length / 275);

  // Optimal length: 1-2 pages (275-550 words per page, so 275-1100 words total)
  if (words.length >= 275 && words.length <= 1100) {
    analysis.score = 100;
  } else if (words.length < 275) {
    analysis.score = 60;
    analysis.issues.push('Resume is too short - aim for at least 1 page');
    analysis.recommendations.push('Add more details to work experience and skills');
  } else if (words.length <= 1650) { // 3 pages
    analysis.score = 80;
    analysis.issues.push('Resume is longer than optimal (2+ pages)');
    analysis.recommendations.push('Consider condensing to 1-2 pages for better ATS compatibility');
  } else {
    analysis.score = 50;
    analysis.issues.push('Resume is too long (3+ pages) - ATS systems prefer 1-2 pages');
    analysis.recommendations.push('Condense resume to 1-2 pages by removing less relevant information');
  }

  return analysis;
}

/**
 * Analyze keyword optimization
 */
function analyzeKeywordOptimization(resumeText) {
  const analysis = {
    score: 0,
    keywordDensity: 0,
    issues: [],
    recommendations: []
  };

  const words = resumeText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const totalWords = words.length;

  if (totalWords === 0) {
    analysis.score = 0;
    return analysis;
  }

  // Count technical keywords
  const technicalKeywords = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'sql',
    'aws', 'docker', 'kubernetes', 'git', 'html', 'css', 'typescript', 'api'
  ];

  let keywordCount = 0;
  technicalKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = resumeText.match(regex);
    if (matches) keywordCount += matches.length;
  });

  // Calculate keyword density (should be 1-3% for optimal ATS)
  analysis.keywordDensity = (keywordCount / totalWords) * 100;

  if (analysis.keywordDensity >= 1 && analysis.keywordDensity <= 3) {
    analysis.score = 100;
  } else if (analysis.keywordDensity < 1) {
    analysis.score = 60;
    analysis.issues.push('Low keyword density - add more relevant technical keywords');
    analysis.recommendations.push('Include more technical terms and skills throughout your resume');
  } else {
    analysis.score = 70;
    analysis.issues.push('High keyword density - may appear over-optimized');
    analysis.recommendations.push('Reduce keyword repetition - aim for natural language');
  }

  return analysis;
}

/**
 * Analyze achievements
 */
function analyzeAchievements(resumeText) {
  const analysis = {
    score: 0,
    achievementCount: 0,
    issues: [],
    recommendations: []
  };

  // Pattern for quantifiable achievements
  const achievementPatterns = [
    /\d+%/g,  // Percentages
    /\$\d+/g,  // Dollar amounts
    /\d+\s+(?:years?|people|projects?|users?|customers?|team\s+members?)/gi  // Counts
  ];

  let achievementCount = 0;
  achievementPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) achievementCount += matches.length;
  });

  analysis.achievementCount = achievementCount;

  // Optimal: 3-5 achievements per role
  if (achievementCount >= 3) {
    analysis.score = 100;
  } else if (achievementCount >= 1) {
    analysis.score = 70;
    analysis.issues.push('Add more quantifiable achievements');
    analysis.recommendations.push('Include more metrics, percentages, and numbers in your achievements');
  } else {
    analysis.score = 30;
    analysis.issues.push('No quantifiable achievements found');
    analysis.recommendations.push('Add specific numbers, percentages, and metrics to your work experience');
  }

  return analysis;
}

/**
 * Analyze action verbs
 */
function analyzeActionVerbs(resumeText) {
  const analysis = {
    score: 0,
    strongVerbCount: 0,
    weakVerbCount: 0,
    issues: [],
    recommendations: []
  };

  const strongActionVerbs = [
    'achieved', 'delivered', 'developed', 'implemented', 'improved', 'increased',
    'led', 'managed', 'optimized', 'reduced', 'created', 'designed', 'executed',
    'launched', 'established', 'transformed', 'built', 'enhanced', 'streamlined'
  ];

  const weakVerbs = ['worked', 'did', 'helped', 'assisted', 'participated', 'involved'];

  const resumeLower = resumeText.toLowerCase();
  
  strongActionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
    const matches = resumeText.match(regex);
    if (matches) analysis.strongVerbCount += matches.length;
  });

  weakVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
    const matches = resumeText.match(regex);
    if (matches) analysis.weakVerbCount += matches.length;
  });

  const totalVerbs = analysis.strongVerbCount + analysis.weakVerbCount;
  
  if (totalVerbs === 0) {
    analysis.score = 50;
    analysis.issues.push('No action verbs found');
    analysis.recommendations.push('Use action verbs to start your bullet points');
  } else {
    const strongVerbRatio = analysis.strongVerbCount / totalVerbs;
    if (strongVerbRatio >= 0.7) {
      analysis.score = 100;
    } else if (strongVerbRatio >= 0.5) {
      analysis.score = 80;
      analysis.recommendations.push('Replace some weak verbs with stronger action verbs');
    } else {
      analysis.score = 60;
      analysis.issues.push('Too many weak verbs (worked, helped, assisted)');
      analysis.recommendations.push('Replace weak verbs with strong action verbs (developed, achieved, delivered)');
    }
  }

  return analysis;
}

/**
 * Analyze format and structure
 */
function analyzeFormatAndStructure(resumeText) {
  const analysis = {
    score: 0,
    issues: [],
    recommendations: []
  };

  let score = 100;

  // Check for bullet points
  const bulletPatterns = [/[•·▪▫◦‣⁃]/g, /[-*]/g];
  let bulletCount = 0;
  bulletPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) bulletCount += matches.length;
  });

  if (bulletCount === 0) {
    score -= 10;
    analysis.issues.push('No bullet points detected - use bullets for better readability');
    analysis.recommendations.push('Use bullet points to list achievements and responsibilities');
  }

  // Check for consistent formatting
  const hasInconsistentFormatting = /[^\x00-\x7F]/.test(resumeText) && 
    (resumeText.match(/[^\x00-\x7F]/g) || []).length > 50;
  if (hasInconsistentFormatting) {
    score -= 15;
    analysis.issues.push('Many special characters detected - may cause ATS parsing issues');
    analysis.recommendations.push('Use standard characters and fonts for better ATS compatibility');
  }

  // Check for proper section headers
  const sectionHeaders = ['experience', 'education', 'skills', 'summary', 'objective', 'contact'];
  const foundHeaders = sectionHeaders.filter(header => {
    const regex = new RegExp(`\\b${header}\\b`, 'i');
    return regex.test(resumeText);
  });

  if (foundHeaders.length < 3) {
    score -= 20;
    analysis.issues.push('Missing clear section headers');
    analysis.recommendations.push('Use clear section headers (Experience, Education, Skills)');
  }

  analysis.score = Math.max(0, score);
  return analysis;
}

/**
 * Calculate overall ATS score
 */
function calculateOverallATSScore(sections) {
  const weights = {
    contact: 0.15,
    summary: 0.15,
    experience: 0.25,
    education: 0.15,
    skills: 0.15,
    location: 0.05,
    length: 0.05,
    keywords: 0.03,
    achievements: 0.02
  };

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([section, weight]) => {
    if (sections[section]) {
      // Handle both object with score property and direct score value
      const sectionScore = typeof sections[section] === 'number' 
        ? sections[section] 
        : (sections[section].score !== undefined ? sections[section].score : 0);
      
      if (typeof sectionScore === 'number' && !isNaN(sectionScore)) {
        weightedScore += sectionScore * weight;
        totalWeight += weight;
      }
    }
  });

  // Ensure we return a valid score
  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Generate detailed ATS recommendations with actionable guidance
 */
function generateATSRecommendations(sections, overallScore) {
  const recommendations = [];

  // Contact Information Recommendations
  if (sections.contact) {
    if (sections.contact.score < 70) {
      const missingItems = [];
      if (!sections.contact.completeness || sections.contact.completeness < 50) {
        missingItems.push('email address');
      }
      if (sections.contact.completeness < 70) {
        missingItems.push('phone number');
      }
      
      recommendations.push({
        priority: sections.contact.score < 50 ? 'critical' : 'high',
        category: 'contact',
        title: 'Complete Contact Information',
        message: missingItems.length > 0 
          ? `Missing ${missingItems.join(' and ')} - ATS systems require complete contact information to process your application`
          : 'Contact information is incomplete',
        description: 'ATS systems need your email and phone number to contact you. Without complete contact information, your resume may be automatically rejected.',
        action: `Add your ${missingItems.join(' and ')} to the top of your resume in a clear Contact section. Format: Email: your.email@example.com | Phone: (123) 456-7890`,
        impact: sections.contact.score < 50 ? 'Critical - Resume may be rejected' : 'High - Reduces chances of being contacted',
        examples: [
          'Email: john.doe@email.com',
          'Phone: (555) 123-4567',
          'Location: San Francisco, CA (optional but recommended)'
        ]
      });
    }
  }

  // Professional Summary Recommendations
  if (sections.summary) {
    if (sections.summary.score < 70) {
      if (!sections.summary.present) {
        recommendations.push({
          priority: 'high',
          category: 'summary',
          title: 'Add Professional Summary',
          message: 'Missing professional summary or objective - this is a critical section for ATS parsing',
          description: 'A professional summary (2-4 sentences) at the top of your resume helps ATS systems understand your background and qualifications. It should include your years of experience, key skills, and career focus.',
          action: 'Add a 2-4 sentence professional summary at the top of your resume, right after your contact information. Include: (1) Your years of experience and role, (2) Key technical skills, (3) Career focus or specialization.',
          impact: 'High - Improves ATS parsing and recruiter understanding',
          examples: [
            'Experienced Software Engineer with 5+ years developing scalable web applications using React, Node.js, and AWS. Specialized in full-stack development and cloud architecture.',
            'Results-driven Project Manager with expertise in Agile methodologies and cross-functional team leadership. Successfully delivered 20+ projects on time and within budget.'
          ]
        });
      } else if (sections.summary.quality < 70) {
        recommendations.push({
          priority: 'medium',
          category: 'summary',
          title: 'Improve Professional Summary',
          message: sections.summary.issues && sections.summary.issues.length > 0 
            ? sections.summary.issues[0]
            : 'Professional summary needs improvement',
          description: 'Your summary is present but could be more impactful. A strong summary includes action verbs, quantifiable achievements, and relevant keywords from the job description.',
          action: 'Expand your summary to 2-4 sentences. Add specific achievements (e.g., "Led team of 5 developers"), include relevant keywords, and use strong action verbs (developed, managed, achieved).',
          impact: 'Medium - Better keyword matching and stronger first impression',
          examples: [
            'Instead of: "Experienced developer"',
            'Use: "Senior Full-Stack Developer with 7+ years building enterprise applications, leading teams of 5-8 developers, and delivering solutions used by 100K+ users"'
          ]
        });
      }
    }
  }

  // Work Experience Recommendations
  if (sections.experience) {
    if (sections.experience.score < 70) {
      if (!sections.experience.present) {
        recommendations.push({
          priority: 'critical',
          category: 'experience',
          title: 'Add Work Experience Section',
          message: 'Missing work experience section - this is essential for most job applications',
          description: 'Work experience is the most important section of your resume. ATS systems and recruiters use this to evaluate your qualifications and career progression.',
          action: 'Add a Work Experience section with: (1) Company name, (2) Job title, (3) Employment dates (MM/YYYY format), (4) 3-5 bullet points describing achievements and responsibilities.',
          impact: 'Critical - Resume will likely be rejected without work experience',
          examples: [
            'Software Engineer | Tech Company Inc. | Jan 2020 - Present',
            '• Developed and maintained React applications serving 50K+ daily users',
            '• Led team of 3 junior developers, improving code quality by 30%',
            '• Implemented CI/CD pipeline reducing deployment time by 40%'
          ]
        });
      } else {
        const issues = sections.experience.issues || [];
        issues.forEach(issue => {
          if (issue.includes('missing dates')) {
            recommendations.push({
              priority: 'high',
              category: 'experience',
              title: 'Add Dates to Work Experience',
              message: issue,
              description: 'Employment dates help ATS systems and recruiters understand your career timeline and experience duration. Missing dates can cause your resume to be filtered out.',
              action: 'Add employment dates in MM/YYYY format for each position. Example: "Software Engineer | Company Name | Jan 2020 - Present" or "Jan 2018 - Dec 2019".',
              impact: 'High - Missing dates can cause ATS parsing errors',
              examples: [
                'Correct: "Software Engineer | ABC Corp | Jan 2020 - Present"',
                'Incorrect: "Software Engineer | ABC Corp" (missing dates)'
              ]
            });
          } else if (issue.includes('missing descriptions')) {
            recommendations.push({
              priority: 'high',
              category: 'experience',
              title: 'Add Descriptions to Work Experience',
              message: issue,
              description: 'Job descriptions with bullet points help ATS systems extract skills and achievements. Without descriptions, your experience appears incomplete.',
              action: 'Add 3-5 bullet points under each position describing: (1) Key responsibilities, (2) Achievements with numbers/metrics, (3) Technologies used, (4) Impact on business/team.',
              impact: 'High - Descriptions are essential for keyword matching',
              examples: [
                '• Developed RESTful APIs using Node.js and Express, handling 1M+ requests daily',
                '• Reduced application load time by 40% through database optimization',
                '• Collaborated with cross-functional teams to deliver 5 major features on schedule'
              ]
            });
          } else if (issue.includes('more work experience')) {
            recommendations.push({
              priority: 'medium',
              category: 'experience',
              title: 'Add More Work Experience Entries',
              message: issue,
              description: 'Having multiple work experience entries shows career progression and diverse experience. If you have limited work history, include internships, projects, or volunteer work.',
              action: 'Add additional entries including: (1) Previous full-time positions, (2) Internships or co-ops, (3) Significant freelance/project work, (4) Relevant volunteer positions.',
              impact: 'Medium - Shows career progression and experience depth',
              examples: [
                'If you have 1 job: Add internships, significant projects, or volunteer work',
                'Format each entry consistently with company, title, dates, and descriptions'
              ]
            });
          }
        });
      }
    }
  }

  // Education Recommendations
  if (sections.education) {
    if (sections.education.score < 70) {
      if (!sections.education.present) {
        recommendations.push({
          priority: 'high',
          category: 'education',
          title: 'Add Education Section',
          message: 'Missing education section - required for most professional positions',
          description: 'Education information helps ATS systems verify qualifications and match you to job requirements. Most positions require at least a high school diploma or equivalent.',
          action: 'Add an Education section with: (1) Degree name (e.g., "Bachelor of Science in Computer Science"), (2) Institution name, (3) Graduation date or "Expected [Date]" if in progress, (4) GPA if 3.5+ (optional).',
          impact: 'High - Many jobs filter by education level',
          examples: [
            'Bachelor of Science in Computer Science | University Name | May 2020',
            'Master of Business Administration | University Name | Dec 2018 | GPA: 3.8/4.0'
          ]
        });
      } else {
        const issues = sections.education.issues || [];
        issues.forEach(issue => {
          recommendations.push({
            priority: 'medium',
            category: 'education',
            title: 'Complete Education Information',
            message: issue,
            description: 'Complete education entries help ATS systems properly categorize and match your qualifications.',
            action: 'Ensure each education entry includes: (1) Full degree name, (2) Institution name, (3) Graduation date or expected date.',
            impact: 'Medium - Incomplete information may cause parsing errors',
            examples: [
              'Complete: "Bachelor of Science in Computer Science | MIT | May 2020"',
              'Incomplete: "Computer Science" (missing degree type, institution, date)'
            ]
          });
        });
      }
    }
  }

  // Skills Recommendations
  if (sections.skills) {
    if (sections.skills.score < 70) {
      if (!sections.skills.present) {
        recommendations.push({
          priority: 'high',
          category: 'skills',
          title: 'Add Skills Section',
          message: 'Missing skills section - critical for ATS keyword matching',
          description: 'A dedicated Skills section helps ATS systems quickly identify your technical and soft skills. This is one of the most important sections for keyword matching.',
          action: 'Add a Skills section with: (1) Technical skills (programming languages, frameworks, tools), (2) Soft skills (communication, leadership), (3) Industry-specific skills. List 10-15 relevant skills.',
          impact: 'High - Skills section is heavily weighted by ATS systems',
          examples: [
            'Technical Skills: JavaScript, Python, React, Node.js, AWS, Docker, Git',
            'Soft Skills: Leadership, Communication, Problem-solving, Agile',
            'Tools: Jira, Confluence, Jenkins, Kubernetes'
          ]
        });
      } else {
        const issues = sections.skills.issues || [];
        issues.forEach(issue => {
          recommendations.push({
            priority: 'medium',
            category: 'skills',
            title: 'Expand Skills Section',
            message: issue,
            description: 'A comprehensive skills section (10+ skills) improves keyword matching and shows your expertise breadth.',
            action: 'Add more relevant skills including: (1) Technologies mentioned in job descriptions you\'re targeting, (2) Industry-standard tools and frameworks, (3) Both technical and soft skills.',
            impact: 'Medium - More skills = better keyword matching',
            examples: [
              'Add skills from job descriptions you\'re applying to',
              'Include both hard skills (technical) and soft skills (interpersonal)',
              'Group by category: Programming Languages, Frameworks, Tools, etc.'
            ]
          });
        });
      }
    }
  }

  // Location Recommendations
  if (sections.location && sections.location.score < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'location',
      title: 'Add Location Information',
      message: sections.location.issues && sections.location.issues.length > 0 
        ? sections.location.issues[0]
        : 'Location not found',
      description: 'Many ATS systems filter candidates by location. Adding your city and state helps you appear in location-based searches and shows you\'re available for local positions.',
      action: 'Add your location (City, State) to your contact information section. Format: "San Francisco, CA" or "New York, NY". You can also add "Open to Remote" if applicable.',
      impact: 'Medium - Helps with location-based job matching',
      examples: [
        'Contact Section:',
        'Email: john@email.com',
        'Phone: (555) 123-4567',
        'Location: San Francisco, CA | Open to Remote'
      ]
    });
  }

  // Resume Length Recommendations
  if (sections.length) {
    const lengthIssues = sections.length.issues || [];
    lengthIssues.forEach(issue => {
      recommendations.push({
        priority: issue.includes('too long') ? 'medium' : 'low',
        category: 'length',
        title: 'Optimize Resume Length',
        message: issue,
        description: sections.length.pageEstimate > 2
          ? 'Resumes longer than 2 pages are often truncated by ATS systems. Focus on the most relevant and recent experience.'
          : 'Resumes shorter than 1 page may appear incomplete. Add more detail to your work experience and skills.',
        action: sections.length.pageEstimate > 2
          ? 'Condense your resume to 1-2 pages by: (1) Removing older/irrelevant positions, (2) Shortening bullet points, (3) Removing unnecessary sections, (4) Using concise language.'
          : 'Expand your resume by: (1) Adding more bullet points to each position, (2) Including more skills, (3) Adding projects or certifications, (4) Expanding your summary.',
        impact: sections.length.pageEstimate > 2 ? 'Medium - Long resumes may be cut off' : 'Low - Short resumes may seem incomplete',
        examples: [
          sections.length.pageEstimate > 2 
            ? 'Remove positions older than 10 years or not relevant to target role'
            : 'Add 2-3 more bullet points per position describing achievements'
        ]
      });
    });
  }

  // Keyword Optimization Recommendations
  if (sections.keywords && sections.keywords.score < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'keywords',
      title: 'Optimize Keyword Usage',
      message: sections.keywords.issues && sections.keywords.issues.length > 0
        ? sections.keywords.issues[0]
        : 'Keyword optimization needed',
      description: 'Proper keyword density (1-3%) helps ATS systems match your resume to job descriptions. Too few keywords reduce match scores; too many may appear over-optimized.',
      action: 'Review job descriptions for your target roles and naturally incorporate important keywords throughout your resume, especially in: (1) Professional summary, (2) Skills section, (3) Work experience descriptions.',
      impact: 'Medium - Improves ATS matching scores',
      examples: [
        'If job requires "React": Mention it in summary, skills, and work experience',
        'Use variations: "JavaScript" and "JS", "Machine Learning" and "ML"',
        'Include both acronyms and full terms: "API" and "Application Programming Interface"'
      ]
    });
  }

  // Achievements Recommendations
  if (sections.achievements && sections.achievements.score < 50) {
    recommendations.push({
      priority: 'medium',
      category: 'achievements',
      title: 'Add Quantifiable Achievements',
      message: sections.achievements.issues && sections.achievements.issues.length > 0
        ? sections.achievements.issues[0]
        : 'Add more quantifiable achievements',
      description: 'Resumes with specific numbers, percentages, and metrics perform better in ATS systems and impress recruiters. Quantifiable achievements show concrete impact.',
      action: 'Add metrics to your work experience bullet points. Include: (1) Numbers (increased sales by 20%), (2) Percentages (reduced costs by 15%), (3) Counts (managed team of 5), (4) Timeframes (delivered in 2 weeks).',
      impact: 'Medium - Quantifiable achievements significantly improve resume impact',
      examples: [
        'Instead of: "Improved application performance"',
        'Use: "Improved application performance by 40%, reducing load time from 5s to 3s"',
        '',
        'Instead of: "Led development team"',
        'Use: "Led team of 5 developers, delivering 10+ features in 6 months"'
      ]
    });
  }

  // Action Verbs Recommendations
  if (sections.actionVerbs && sections.actionVerbs.score < 70) {
    recommendations.push({
      priority: 'low',
      category: 'actionVerbs',
      title: 'Use Stronger Action Verbs',
      message: sections.actionVerbs.issues && sections.actionVerbs.issues.length > 0
        ? sections.actionVerbs.issues[0]
        : 'Replace weak verbs with strong action verbs',
      description: 'Strong action verbs (developed, achieved, delivered) make your resume more impactful than weak verbs (worked, helped, assisted).',
      action: 'Start each bullet point with a strong action verb. Replace: "worked on" → "developed", "helped with" → "collaborated on", "did" → "executed" or "implemented".',
      impact: 'Low - Improves resume readability and impact',
      examples: [
        'Weak: "Worked on improving the website"',
        'Strong: "Developed responsive website features, increasing user engagement by 25%"',
        '',
        'Weak: "Helped the team with projects"',
        'Strong: "Collaborated with cross-functional team to deliver 5 projects on schedule"'
      ]
    });
  }

  // Overall score recommendations
  if (overallScore < 70) {
    recommendations.push({
      priority: 'high',
      category: 'overall',
      title: 'Improve Overall ATS Score',
      message: `Your ATS score is ${overallScore}% - focus on completing missing sections and improving structure`,
      description: `Your resume has an ATS compatibility score of ${overallScore}%. To improve: (1) Complete all required sections (contact, summary, experience, education, skills), (2) Add missing information, (3) Improve formatting and structure.`,
      action: 'Prioritize fixing critical issues first (missing contact info, experience, education), then work on improving other sections.',
      impact: 'High - Higher ATS scores increase chances of passing initial screening',
      examples: [
        'Critical: Add missing contact information and work experience',
        'High Priority: Complete education section and add professional summary',
        'Medium Priority: Expand skills section and add quantifiable achievements'
      ]
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
}

/**
 * Identify strengths
 */
function identifyStrengths(sections) {
  const strengths = [];

  Object.entries(sections).forEach(([sectionName, section]) => {
    if (section.score >= 80) {
      strengths.push({
        section: sectionName,
        score: section.score,
        message: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section is well-structured`
      });
    }
  });

  return strengths;
}

/**
 * Calculate ATS compatibility
 */
function calculateATSCompatibility(sections) {
  const factors = [];
  let score = 100;

  // Check critical factors
  if (!sections.contact || sections.contact.score < 70) {
    score -= 20;
    factors.push({ factor: 'Contact Information', status: 'Missing or Incomplete', impact: 'High' });
  } else {
    factors.push({ factor: 'Contact Information', status: 'Complete', impact: 'High' });
  }

  if (!sections.experience || sections.experience.score < 70) {
    score -= 25;
    factors.push({ factor: 'Work Experience', status: 'Missing or Incomplete', impact: 'Critical' });
  } else {
    factors.push({ factor: 'Work Experience', status: 'Complete', impact: 'Critical' });
  }

  if (!sections.education || sections.education.score < 70) {
    score -= 15;
    factors.push({ factor: 'Education', status: 'Missing or Incomplete', impact: 'High' });
  } else {
    factors.push({ factor: 'Education', status: 'Complete', impact: 'High' });
  }

  if (!sections.skills || sections.skills.score < 70) {
    score -= 15;
    factors.push({ factor: 'Skills', status: 'Missing or Incomplete', impact: 'High' });
  } else {
    factors.push({ factor: 'Skills', status: 'Complete', impact: 'High' });
  }

  if (!sections.summary || sections.summary.score < 70) {
    score -= 10;
    factors.push({ factor: 'Professional Summary', status: 'Missing or Incomplete', impact: 'Medium' });
  } else {
    factors.push({ factor: 'Professional Summary', status: 'Complete', impact: 'Medium' });
  }

  if (!sections.location || sections.location.score < 70) {
    score -= 5;
    factors.push({ factor: 'Location', status: 'Missing', impact: 'Low' });
  } else {
    factors.push({ factor: 'Location', status: 'Present', impact: 'Low' });
  }

  return {
    score: Math.max(0, score),
    factors: factors
  };
}
