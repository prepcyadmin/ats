import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

/**
 * Analyze resume formatting for ATS compatibility
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} resumeText - Extracted text from resume
 * @returns {Object} Formatting analysis results
 */
export async function analyzeFormatting(fileBuffer, resumeText) {
  const issues = [];
  const warnings = [];
  
  // Start with a base score that varies based on resume quality
  let atsReadabilityScore = 50; // Start lower, build up based on quality

  let pageCount = 1; // Default page count
  let isPDF = false;

  try {
    // Try to load PDF for layout analysis (only if it's a PDF)
    try {
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      pageCount = pages.length;
      isPDF = true;
    } catch (pdfError) {
      // Not a PDF or PDF parsing failed - estimate page count from text
      const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
      // Rough estimate: ~250-300 words per page
      pageCount = Math.max(1, Math.ceil(wordCount / 275));
    }
    
    // Basic checks using text analysis
    const textLower = resumeText.toLowerCase();
    const textLines = resumeText.split('\n').filter(line => line.trim().length > 0);
    const wordCount = resumeText.split(/\s+/).filter(w => w.length > 0).length;
    
    // Base score calculation - start from quality indicators
    let qualityPoints = 0;
    let penaltyPoints = 0;
    
    // 1. Font compatibility check (basic - check for common ATS-unfriendly fonts in text)
    const atsFriendlyFonts = ['arial', 'calibri', 'times new roman', 'georgia', 'verdana', 'helvetica'];
    const suspiciousFonts = ['comic', 'papyrus', 'wingdings', 'symbol', 'webdings'];
    
    let fontScore = 100;
    suspiciousFonts.forEach(font => {
      if (textLower.includes(font)) {
        warnings.push(`Potentially problematic font detected: ${font}`);
        fontScore -= 10;
        penaltyPoints += 5;
      }
    });
    
    // 2. Table detection (look for tab-separated content or aligned columns)
    const tabCount = (resumeText.match(/\t/g) || []).length;
    if (tabCount > 10) {
      issues.push('Multiple tabs detected - may cause ATS parsing issues');
      penaltyPoints += 15;
    } else if (tabCount > 5) {
      warnings.push('Some tabs detected - may cause minor parsing issues');
      penaltyPoints += 5;
    }
    
    // 3. Header/Footer detection (check for repeated content at start/end)
    const firstLines = textLines.slice(0, 3).join(' ').toLowerCase();
    const lastLines = textLines.slice(-3).join(' ').toLowerCase();
    if (firstLines === lastLines && firstLines.length > 20) {
      warnings.push('Potential header/footer detected - may interfere with ATS parsing');
      penaltyPoints += 5;
    }
    
    // 4. Image/Graphic detection (check for image indicators in text)
    const imageKeywords = ['[image]', '[graphic]', '[photo]', 'image:', 'graphic:'];
    let hasImages = false;
    imageKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        hasImages = true;
        issues.push('Images or graphics detected - ATS cannot read image content');
        penaltyPoints += 20;
      }
    });
    
    // 5. Section structure validation (CRITICAL - major impact)
    const requiredSections = ['experience', 'education', 'skills', 'contact'];
    const foundSections = [];
    requiredSections.forEach(section => {
      const sectionPattern = new RegExp(`\\b${section}\\b`, 'i');
      if (sectionPattern.test(resumeText)) {
        foundSections.push(section);
        // Vary points based on section importance
        if (section === 'experience') qualityPoints += 15; // Most important
        else if (section === 'education') qualityPoints += 12;
        else if (section === 'skills') qualityPoints += 10;
        else if (section === 'contact') qualityPoints += 8;
      }
    });
    
    const missingSections = requiredSections.filter(s => !foundSections.includes(s));
    if (missingSections.length > 0) {
      warnings.push(`Missing recommended sections: ${missingSections.join(', ')}`);
      // Higher penalty for critical missing sections
      missingSections.forEach(section => {
        if (section === 'experience') penaltyPoints += 20;
        else if (section === 'education') penaltyPoints += 15;
        else if (section === 'skills') penaltyPoints += 12;
        else if (section === 'contact') penaltyPoints += 10;
      });
    }
    
    // 6. Special characters check (may cause parsing issues)
    const specialChars = /[^\x00-\x7F]/g;
    const specialCharCount = (resumeText.match(specialChars) || []).length;
    if (specialCharCount > 100) {
      issues.push('Many special characters detected - may cause ATS parsing issues');
      penaltyPoints += 15;
    } else if (specialCharCount > 50) {
      warnings.push('Some special characters detected - may cause minor parsing issues');
      penaltyPoints += 8;
    }
    
    // 7. Page count (optimal is 1-2 pages) - More nuanced scoring
    if (pageCount === 1) {
      qualityPoints += 8; // Perfect - 1 page
    } else if (pageCount === 2) {
      qualityPoints += 5; // Good - 2 pages
    } else if (pageCount > 2) {
      warnings.push(`Resume is ${pageCount} pages - optimal length is 1-2 pages`);
      penaltyPoints += (pageCount - 2) * 5; // Higher penalty for each page over 2
    } else if (pageCount < 1 || wordCount < 200) {
      warnings.push('Resume appears too short - may seem incomplete');
      penaltyPoints += 15;
    }
    
    // 12. File format bonus (PDF is most ATS-friendly)
    if (isPDF) {
      qualityPoints += 3; // Small bonus for PDF
    } else {
      // No penalty for non-PDF, just a warning
      warnings.push('Consider using PDF format for better ATS compatibility');
    }
    
    // 8. Contact information format check (CRITICAL)
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    const hasEmail = emailPattern.test(resumeText);
    const hasPhone = phonePattern.test(resumeText);
    
    if (hasEmail) {
      qualityPoints += 8; // Email is important but not everything
    } else {
      issues.push('Email address not found or improperly formatted');
      penaltyPoints += 20; // Higher penalty for missing email
    }
    
    if (hasPhone) {
      qualityPoints += 4; // Phone is nice to have
    } else {
      warnings.push('Phone number not found or may be improperly formatted');
      penaltyPoints += 10;
    }
    
    // Bonus for having both contact methods
    if (hasEmail && hasPhone) {
      qualityPoints += 3;
    }
    
    // 9. Bullet point consistency (important for readability)
    const bulletPatterns = [
      /[•·▪▫◦‣⁃]/g,  // Various bullet characters
      /[-*]/g         // Dash and asterisk bullets
    ];
    
    let bulletCount = 0;
    bulletPatterns.forEach(pattern => {
      bulletCount += (resumeText.match(pattern) || []).length;
    });
    
    // More nuanced bullet scoring
    if (bulletCount >= 15) {
      qualityPoints += 4; // Excellent use of bullets
    } else if (bulletCount >= 10) {
      qualityPoints += 2; // Good use of bullets
    } else if (bulletCount >= 5) {
      qualityPoints += 1; // Some bullets
    } else if (bulletCount === 0) {
      warnings.push('No bullet points detected - consider using bullets for better readability');
      penaltyPoints += 8; // Higher penalty for no bullets
    }
    
    // 10. Resume length/content quality - More granular
    if (wordCount >= 400 && wordCount <= 700) {
      qualityPoints += 4; // Optimal word count range
    } else if (wordCount >= 300 && wordCount < 400) {
      qualityPoints += 2; // Good but could be more detailed
    } else if (wordCount >= 700 && wordCount <= 900) {
      qualityPoints += 2; // Good but getting long
    } else if (wordCount < 200) {
      penaltyPoints += 15; // Too short - significant issue
    } else if (wordCount > 1200) {
      penaltyPoints += 10; // Too long - may lose reader attention
    }
    
    // 11. Check for proper formatting indicators - More strict
    const hasProperStructure = foundSections.length >= 3 && hasEmail && wordCount >= 300;
    if (hasProperStructure && foundSections.length === 4) {
      qualityPoints += 5; // Perfect structure bonus
    } else if (hasProperStructure) {
      qualityPoints += 2; // Good structure
    }
    
    // Additional quality checks
    // Check for action verbs (indicates well-written resume)
    const actionVerbs = /\b(developed|created|implemented|managed|led|improved|designed|built|achieved|increased|reduced|optimized)\b/gi;
    const actionVerbCount = (resumeText.match(actionVerbs) || []).length;
    if (actionVerbCount >= 10) {
      qualityPoints += 3; // Good use of action verbs
    } else if (actionVerbCount < 3) {
      penaltyPoints += 5; // Lacks action verbs
    }
    
    // Calculate final score: base + quality - penalties
    atsReadabilityScore = 50 + qualityPoints - penaltyPoints;
    
    // Ensure score is within bounds
    atsReadabilityScore = Math.max(0, Math.min(100, atsReadabilityScore));
    
    // ALWAYS log for debugging (helps identify why scores are the same)
    console.log(`[Formatting Analysis] Base: 50, Quality: +${qualityPoints}, Penalties: -${penaltyPoints}, Final: ${atsReadabilityScore}`);
    console.log(`[Formatting Analysis] Sections found: ${foundSections.length}/4, Email: ${emailPattern.test(resumeText)}, Phone: ${phonePattern.test(resumeText)}, Pages: ${pageCount}, WordCount: ${wordCount}`);
    
    return {
      atsReadabilityScore: Math.round(atsReadabilityScore),
      fontScore: Math.round(fontScore),
      pageCount,
      issues,
      warnings,
      recommendations: generateFormattingRecommendations(issues, warnings, atsReadabilityScore),
      hasImages,
      hasTables: tabCount > 10,
      missingSections,
      contactInfoComplete: emailPattern.test(resumeText) && phonePattern.test(resumeText)
    };
  } catch (error) {
    console.error('Formatting analysis error:', error);
    // Return basic analysis based on text only
    return {
      atsReadabilityScore: 70,
      fontScore: 100,
      pageCount: 1,
      issues: ['Could not perform full formatting analysis'],
      warnings: [],
      recommendations: ['Ensure resume uses ATS-friendly fonts (Arial, Calibri, Times New Roman)'],
      hasImages: false,
      hasTables: false,
      missingSections: [],
      contactInfoComplete: false
    };
  }
}

/**
 * Generate formatting recommendations
 */
function generateFormattingRecommendations(issues, warnings, score) {
  const recommendations = [];
  
  if (score < 70) {
    recommendations.push('⚠️ Critical: Resume has significant formatting issues that may cause ATS rejection');
  }
  
  if (issues.some(i => i.includes('tabs'))) {
    recommendations.push('Remove tab characters - use spaces or proper formatting instead');
  }
  
  if (issues.some(i => i.includes('Images'))) {
    recommendations.push('Remove images and graphics - ATS systems cannot read image content');
  }
  
  if (warnings.some(w => w.includes('sections'))) {
    recommendations.push('Add missing recommended sections (Experience, Education, Skills, Contact)');
  }
  
  if (score < 80) {
    recommendations.push('Use ATS-friendly fonts: Arial, Calibri, or Times New Roman');
    recommendations.push('Avoid headers and footers - they may interfere with ATS parsing');
    recommendations.push('Keep resume to 1-2 pages for optimal ATS compatibility');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Resume formatting looks good for ATS compatibility!');
  }
  
  return recommendations;
}
