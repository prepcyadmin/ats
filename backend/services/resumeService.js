import { extractTextFromFile } from '../utils/fileExtractor.js';
import { getImportantKeywords, getSkillFrequency, normalize } from '../utils/textProcessor.js';
import { analyzeResume } from './atsService.js';
import { analyzeFormatting } from '../utils/formattingAnalyzer.js';
import { parseStructuredResume } from '../utils/resumeParser.js';
import { analyzeKeywordDensity } from '../utils/keywordOptimizer.js';
import { analyzeAchievements } from '../utils/achievementAnalyzer.js';
import { analyzeSections } from '../utils/sectionAnalyzer.js';
import { generateRecommendations } from './recommendationService.js';
import { analyzeATSBestPractices } from '../utils/atsBestPracticesAnalyzer.js';
import { config } from '../config/index.js';
import natural from 'natural';

const { WordTokenizer } = natural;

/**
 * Process a single resume with comprehensive analysis
 * @param {Object} file - Uploaded file object
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Comprehensive analysis result
 */
export async function processResume(file, jobDescription) {
  // Extract job description keywords
  const jobKeywords = getImportantKeywords(jobDescription, config.ats.keywordCount);
  
  // Extract text from file (supports PDF, DOCX, TXT)
  const resumeText = await extractTextFromFile(
    file.data,
    file.mimetype || file.mimeType,
    file.name
  );
  
  if (!resumeText) {
    throw new Error('Failed to extract text from file.');
  }
  
  // Core ATS analysis
  const analysis = analyzeResume(resumeText, jobDescription, jobKeywords);
  
  // NEW: Formatting analysis
  const formattingAnalysis = await analyzeFormatting(file.data, resumeText);
  
  // NEW: Structured parsing
  const structuredData = parseStructuredResume(resumeText);
  
  // Debug: Log if structuredData is empty (helps identify parsing issues)
  if (!structuredData || (!structuredData.contactInfo && !structuredData.workExperience && !structuredData.education)) {
    console.warn('Warning: Structured data parsing may have failed or resume is empty');
  }
  
  // NEW: ATS Best Practices Analysis (Primary Analysis - Not JD Dependent)
  const atsBestPractices = analyzeATSBestPractices(resumeText, structuredData);
  
  // Ensure atsBestPractices has a valid overallScore
  if (!atsBestPractices.overallScore && atsBestPractices.overallScore !== 0) {
    console.warn('Warning: ATS Best Practices overallScore is missing');
  }
  
  // NEW: Section analysis
  const sectionAnalysis = analyzeSections(resumeText, structuredData);
  
  // NEW: Keyword density optimization
  const keywordOptimization = analyzeKeywordDensity(
    resumeText,
    jobKeywords,
    analysis.resumeKeywords
  );
  
  // NEW: Quantifiable achievements analysis
  const achievementAnalysis = analyzeAchievements(resumeText);
  
  // NEW: Generate recommendations (combine ATS best practices + JD matching)
  const atsRecommendations = atsBestPractices.recommendations || [];
  const jdRecommendations = generateRecommendations(
    resumeText,
    jobDescription,
    {
      jobKeywords,
      topKeywords: analysis.resumeKeywords,
      breakdown: analysis.breakdown
    },
    structuredData
  );
  
  // Combine recommendations (prioritize ATS best practices)
  // Ensure all recommendation values are properly formatted
  const combinedRecommendations = {
    ...jdRecommendations,
    atsBestPractices: atsRecommendations.map(rec => ({
      title: rec.title || rec.message || rec.category || 'ATS Best Practice',
      message: rec.message || '',
      description: rec.description || '',
      action: rec.action || '',
      priority: rec.priority || 'medium',
      category: rec.category || '',
      impact: rec.impact || '',
      examples: Array.isArray(rec.examples) ? rec.examples : (rec.examples ? [rec.examples] : [])
    }))
  };
  
  // Calculate keyword counts (legacy support)
  const keywordsCount = {};
  const tokenizer = new WordTokenizer();
  
  analysis.resumeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = resumeText.toLowerCase().match(regex);
    keywordsCount[keyword] = matches ? matches.length : 0;
  });
  
  // Calculate skills frequency (legacy support)
  const skills = {
    javascript: normalize(getSkillFrequency(resumeText, 'javascript')),
    python: normalize(getSkillFrequency(resumeText, 'python')),
    react: normalize(getSkillFrequency(resumeText, 'react')),
    teamwork: normalize(getSkillFrequency(resumeText, 'teamwork')),
    leadership: normalize(getSkillFrequency(resumeText, 'leadership')),
  };
  
  return {
    // Basic info
    resumeName: file.name,
    
    // SEPARATE SCORES - Two distinct scores
    // 1. JD Match Score (Job Description Matching) - SEPARATE
    jdMatchScore: (() => {
      if (analysis.boostedScore && analysis.boostedScore > 0) {
        return Math.round(analysis.boostedScore);
      }
      if (analysis.rawATS && analysis.rawATS > 0) {
        return Math.round(analysis.rawATS);
      }
      // Calculate from breakdown components if overall score is missing
      if (analysis.breakdown) {
        const semantic = parseFloat(analysis.breakdown.semanticSimilarity || 0);
        const keyword = parseFloat(analysis.breakdown.keywordMatch || 0);
        const skills = parseFloat(analysis.breakdown.skillRelevance || 0);
        const experience = parseFloat(analysis.breakdown.experienceMatch || 0);
        const education = parseFloat(analysis.breakdown.educationMatch || 0);
        // Weighted average: semantic 30%, keyword 35%, skills 20%, experience 10%, education 5%
        const calculated = (semantic * 0.30) + (keyword * 0.35) + (skills * 0.20) + (experience * 0.10) + (education * 0.05);
        return Math.round(Math.max(0, Math.min(100, calculated)));
      }
      return 0;
    })(),
    
    // 2. Overall ATS Score (ATS Readability & Best Practices) - SEPARATE, NOT COMBINED
    // This is the ATS readability/compatibility score only
    atsScore: (() => {
      // Use ATS Best Practices score (resume structure, completeness, ATS compatibility)
      const score = atsBestPractices.overallScore || 0;
      // If score is 0, try to calculate from section scores
      if (score === 0 && atsBestPractices.sections) {
        const sections = atsBestPractices.sections;
        const weights = {
          contact: 0.15,
          summary: 0.15,
          experience: 0.25,
          education: 0.15,
          skills: 0.15,
          location: 0.05,
          length: 0.05
        };
        let weightedSum = 0;
        let totalWeight = 0;
        Object.entries(weights).forEach(([key, weight]) => {
          const section = sections[key];
          if (section && typeof section.score === 'number') {
            weightedSum += section.score * weight;
            totalWeight += weight;
          }
        });
        if (totalWeight > 0) {
          return Math.round(weightedSum / totalWeight);
        }
      }
      return score;
    })(),
    
    // Legacy matchPercentage - Now uses ATS Score only (for backward compatibility)
    matchPercentage: (() => {
      const ats = atsBestPractices.overallScore || 0;
      return ats > 0 ? ats : 0;
    })(),
    cosineSimilarity: analysis.breakdown?.cosineSimilarity || (analysis.cosine * 100).toFixed(1),
    keywordMatchScore: analysis.keywordMatchScore.toFixed(1),
    semanticSimilarity: analysis.breakdown?.semanticSimilarity || '0.0',
    jaccardSimilarity: analysis.breakdown?.jaccardSimilarity || '0.0',
    skillRelevance: analysis.breakdown?.skillRelevance || '0.0',
    experienceMatch: analysis.breakdown?.experienceMatch || '0.0',
    educationMatch: analysis.breakdown?.educationMatch || '0.0',
    
    // Keywords (legacy - common words)
    topKeywords: analysis.resumeKeywords,
    jobKeywords: jobKeywords,
    keywordsCount,
    
    // NEW: Technical keywords only (no common English words)
    technicalKeywords: {
      job: analysis.technicalMatch.jobTechnical,
      resume: analysis.technicalMatch.resumeTechnical,
      matchScore: analysis.technicalKeywordMatch
    },
    
    // Skills (legacy + new structured)
    skills,
    structuredSkills: structuredData.skills,
    
    // Text content
    resumeText: resumeText,
    
    // Analysis breakdowns
    skillsAnalysis: analysis.skillsAnalysis || {},
    breakdown: analysis.breakdown || {},
    
    // NEW FEATURES:
    // Formatting analysis
    formattingAnalysis: {
      atsReadabilityScore: formattingAnalysis.atsReadabilityScore,
      fontScore: formattingAnalysis.fontScore,
      pageCount: formattingAnalysis.pageCount,
      issues: formattingAnalysis.issues,
      warnings: formattingAnalysis.warnings,
      recommendations: formattingAnalysis.recommendations,
      hasImages: formattingAnalysis.hasImages,
      hasTables: formattingAnalysis.hasTables,
      missingSections: formattingAnalysis.missingSections,
      contactInfoComplete: formattingAnalysis.contactInfoComplete
    },
    
    // Structured data
    structuredData: {
      contactInfo: structuredData.contactInfo,
      workExperience: structuredData.workExperience,
      education: structuredData.education,
      skills: structuredData.skills,
      certifications: structuredData.certifications,
      projects: structuredData.projects,
      summary: structuredData.summary
    },
    
    // Section analysis
    sectionAnalysis: {
      sections: sectionAnalysis.sections,
      overallScore: sectionAnalysis.overallScore,
      completeness: sectionAnalysis.completeness,
      recommendations: sectionAnalysis.recommendations
    },
    
    // Keyword optimization
    keywordOptimization: {
      keywordAnalysis: keywordOptimization.keywordAnalysis,
      recommendations: keywordOptimization.recommendations,
      optimizationScore: keywordOptimization.optimizationScore,
      summary: keywordOptimization.summary
    },
    
    // Achievement analysis
    achievementAnalysis: {
      totalAchievements: achievementAnalysis.totalAchievements,
      impactStatements: achievementAnalysis.impactStatements,
      metrics: achievementAnalysis.metrics,
      achievements: achievementAnalysis.achievements,
      achievementScore: achievementAnalysis.achievementScore,
      recommendations: achievementAnalysis.recommendations,
      hasQuantifiableResults: achievementAnalysis.hasQuantifiableResults
    },
    
    // Recommendations (combine ATS best practices + JD matching)
    recommendations: {
      keywords: combinedRecommendations.keywords,
      skills: combinedRecommendations.skills,
      sections: combinedRecommendations.sections,
      achievements: combinedRecommendations.achievements,
      actionVerbs: combinedRecommendations.actionVerbs,
      overall: combinedRecommendations.overall,
      // NEW: Technical requirements recommendations
      technical: analysis.technicalMatch.recommendations,
      // NEW: ATS Best Practices recommendations (primary)
      atsBestPractices: combinedRecommendations.atsBestPractices
    },
    
    // NEW: Technical Requirements Matching
    technicalMatch: {
      score: analysis.technicalMatch.score,
      matches: analysis.technicalMatch.matches,
      missingRequirements: analysis.technicalMatch.missingRequirements,
      relatedMatches: analysis.technicalMatch.relatedMatches
    },
    
    // NEW: Improved Skills Matching
    skillsMatch: analysis.skillsMatch || null,
    
    // NEW: ATS Best Practices Analysis (Overall ATS Score)
    atsBestPractices: {
      overallScore: atsBestPractices.overallScore,
      sections: atsBestPractices.sections,
      strengths: atsBestPractices.strengths,
      atsCompatibility: atsBestPractices.atsCompatibility,
      summary: {
        contactScore: atsBestPractices.sections.contact?.score || 0,
        summaryScore: atsBestPractices.sections.summary?.score || 0,
        experienceScore: atsBestPractices.sections.experience?.score || 0,
        educationScore: atsBestPractices.sections.education?.score || 0,
        skillsScore: atsBestPractices.sections.skills?.score || 0,
        locationScore: atsBestPractices.sections.location?.score || 0,
        lengthScore: atsBestPractices.sections.length?.score || 0,
        keywordScore: atsBestPractices.sections.keywords?.score || 0,
        achievementScore: atsBestPractices.sections.achievements?.score || 0,
        actionVerbScore: atsBestPractices.sections.actionVerbs?.score || 0,
        formatScore: atsBestPractices.sections.format?.score || 0
      }
    },
    
    // NEW: JD Match Analysis (Keyword/JD Match Score)
    jdMatchAnalysis: {
      overallScore: Math.round(analysis.boostedScore || analysis.rawATS || 0),
      breakdown: {
        semanticSimilarity: parseFloat(analysis.breakdown?.semanticSimilarity || 0),
        keywordMatch: parseFloat(analysis.keywordMatchScore || 0),
        technicalKeywordMatch: parseFloat(analysis.technicalKeywordMatch || 0),
        skillRelevance: parseFloat(analysis.skillRelevance || 0),
        experienceMatch: parseFloat(analysis.experienceMatch || 0),
        educationMatch: parseFloat(analysis.educationMatch || 0),
        cosineSimilarity: parseFloat(analysis.breakdown?.cosineSimilarity || (analysis.cosine * 100) || 0),
        jaccardSimilarity: parseFloat(analysis.breakdown?.jaccardSimilarity || 0)
      },
      technicalMatch: analysis.technicalMatch,
      skillsMatch: analysis.skillsMatch
    }
  };
}
