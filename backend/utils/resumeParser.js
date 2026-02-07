import nlp from 'compromise';

/**
 * Structured resume parsing - extract structured data from resume text
 * @param {string} resumeText - Resume text content
 * @returns {Object} Structured resume data
 */
export function parseStructuredResume(resumeText) {
  const text = resumeText.trim();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  return {
    contactInfo: extractContactInfo(text),
    workExperience: extractWorkExperience(text, lines),
    education: extractEducation(text, lines),
    skills: extractSkills(text),
    certifications: extractCertifications(text),
    projects: extractProjects(text, lines),
    summary: extractSummary(text, lines)
  };
}

/**
 * Extract contact information
 */
function extractContactInfo(text) {
  const contact = {
    name: null,
    email: null,
    phone: null,
    address: null,
    linkedin: null,
    github: null,
    website: null
  };
  
  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    contact.email = emailMatch[0];
  }
  
  // Extract phone (various formats)
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /(\+?\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      contact.phone = match[0].trim();
      break;
    }
  }
  
  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }
  
  // Extract GitHub
  const githubMatch = text.match(/(?:github\.com\/)([a-zA-Z0-9-]+)/i);
  if (githubMatch) {
    contact.github = `github.com/${githubMatch[1]}`;
  }
  
  // Extract website
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
    contact.website = websiteMatch[0];
  }
  
  // Extract name (usually first 2-3 words at the start, capitalized)
  const firstLines = text.split('\n').slice(0, 5).join(' ');
  const nameMatch = firstLines.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
  if (nameMatch && !nameMatch[1].includes('@') && !nameMatch[1].includes('http')) {
    contact.name = nameMatch[1].trim();
  }
  
  // Extract address (look for city, state patterns)
  const addressPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s+[A-Z]{2}\s+\d{5})/;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) {
    contact.address = addressMatch[0];
  }
  
  return contact;
}

/**
 * Extract work experience
 */
function extractWorkExperience(text, lines) {
  const experience = [];
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience', 'career'];
  
  // Find experience section
  let experienceStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => lineLower.includes(keyword))) {
      experienceStart = i;
      break;
    }
  }
  
  if (experienceStart === -1) {
    // Try to find by job title patterns
    const jobTitlePattern = /(?:^|\n)((?:Senior|Junior|Lead|Principal|Staff|Associate|Manager|Director|VP|President|Engineer|Developer|Designer|Analyst|Consultant|Specialist|Coordinator|Assistant|Executive|Intern)[\w\s]+)/i;
    const matches = text.match(new RegExp(jobTitlePattern, 'gi'));
    if (matches) {
      matches.forEach(match => {
        experience.push({
          title: match.trim(),
          company: null,
          dates: null,
          description: null
        });
      });
    }
    return experience;
  }
  
  // Extract experience entries (look for date patterns and company names)
  const datePattern = /(\d{4}|\w+\s+\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Now)/i;
  const companyPattern = /([A-Z][a-zA-Z0-9\s&.,-]+(?:Inc|LLC|Corp|Ltd|Company|Co\.)?)/;
  
  let currentEntry = null;
  for (let i = experienceStart + 1; i < Math.min(experienceStart + 50, lines.length); i++) {
    const line = lines[i];
    const dateMatch = line.match(datePattern);
    const companyMatch = line.match(companyPattern);
    
    if (dateMatch) {
      if (currentEntry) {
        experience.push(currentEntry);
      }
      currentEntry = {
        title: null,
        company: companyMatch ? companyMatch[1].trim() : null,
        dates: `${dateMatch[1]} - ${dateMatch[2]}`,
        description: []
      };
    } else if (currentEntry && line.length > 10) {
      if (!currentEntry.title && line.length < 100) {
        currentEntry.title = line;
      } else {
        currentEntry.description.push(line);
      }
    }
  }
  
  if (currentEntry) {
    experience.push(currentEntry);
  }
  
  return experience.slice(0, 10); // Limit to 10 most recent
}

/**
 * Extract education
 */
function extractEducation(text, lines) {
  const education = [];
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree', 'bachelor', 'master', 'phd'];
  
  // Find education section
  let educationStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => lineLower.includes(keyword) && lineLower.length < 50)) {
      educationStart = i;
      break;
    }
  }
  
  // Extract degree patterns
  const degreePattern = /(Bachelor|Master|PhD|Ph\.D\.|B\.S\.|B\.A\.|M\.S\.|M\.A\.|MBA|B\.Tech|M\.Tech)[\w\s]*/i;
  const degreeMatches = text.match(new RegExp(degreePattern, 'gi'));
  
  if (degreeMatches) {
    degreeMatches.forEach(degree => {
      education.push({
        degree: degree.trim(),
        institution: null,
        dates: null,
        gpa: null
      });
    });
  }
  
  // Try to find institution names
  const institutionPattern = /([A-Z][a-zA-Z\s&.,-]+(?:University|College|Institute|School|Academy))/;
  const institutionMatches = text.match(new RegExp(institutionPattern, 'g'));
  
  if (institutionMatches && education.length > 0) {
    institutionMatches.forEach((institution, index) => {
      if (education[index]) {
        education[index].institution = institution.trim();
      }
    });
  }
  
  // Extract GPA
  const gpaPattern = /(GPA|G\.P\.A\.):?\s*(\d\.\d+)/i;
  const gpaMatch = text.match(gpaPattern);
  if (gpaMatch && education.length > 0) {
    education[0].gpa = gpaMatch[2];
  }
  
  return education.slice(0, 5); // Limit to 5 entries
}

/**
 * Extract skills
 */
function extractSkills(text) {
  const skills = {
    technical: [],
    soft: [],
    tools: [],
    languages: []
  };
  
  // Common technical skills
  const technicalSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'react', 'angular', 'vue', 'node.js',
    'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'git', 'linux',
    'html', 'css', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
  ];
  
  // Common soft skills
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'collaboration',
    'time management', 'critical thinking', 'adaptability', 'creativity', 'analytical'
  ];
  
  // Common tools
  const tools = [
    'jira', 'confluence', 'slack', 'trello', 'asana', 'figma', 'sketch', 'photoshop',
    'excel', 'powerpoint', 'word', 'outlook'
  ];
  
  // Programming languages
  const languages = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese'];
  
  const textLower = text.toLowerCase();
  
  technicalSkills.forEach(skill => {
    if (textLower.includes(skill)) {
      skills.technical.push(skill);
    }
  });
  
  softSkills.forEach(skill => {
    if (textLower.includes(skill)) {
      skills.soft.push(skill);
    }
  });
  
  tools.forEach(tool => {
    if (textLower.includes(tool)) {
      skills.tools.push(tool);
    }
  });
  
  languages.forEach(lang => {
    if (textLower.includes(lang)) {
      skills.languages.push(lang);
    }
  });
  
  return skills;
}

/**
 * Extract certifications
 */
function extractCertifications(text) {
  const certifications = [];
  const certKeywords = ['certified', 'certification', 'certificate', 'license', 'licensed'];
  const certPattern = /([A-Z][a-zA-Z\s]+(?:Certified|Certification|Certificate|License|Licensed))/i;
  
  const matches = text.match(new RegExp(certPattern, 'g'));
  if (matches) {
    matches.forEach(match => {
      if (match.length < 100) {
        certifications.push(match.trim());
      }
    });
  }
  
  return [...new Set(certifications)].slice(0, 10);
}

/**
 * Extract projects
 */
function extractProjects(text, lines) {
  const projects = [];
  const projectKeywords = ['project', 'projects', 'portfolio'];
  
  let projectStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (projectKeywords.some(keyword => lineLower.includes(keyword) && lineLower.length < 30)) {
      projectStart = i;
      break;
    }
  }
  
  if (projectStart !== -1) {
    for (let i = projectStart + 1; i < Math.min(projectStart + 20, lines.length); i++) {
      const line = lines[i];
      if (line.length > 10 && line.length < 100 && !line.match(/^\d+\./)) {
        projects.push({
          name: line,
          description: null
        });
        if (projects.length >= 5) break;
      }
    }
  }
  
  return projects;
}

/**
 * Extract professional summary
 */
function extractSummary(text, lines) {
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const lineLower = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => lineLower.includes(keyword) && lineLower.length < 30)) {
      // Get next few lines as summary
      const summaryLines = lines.slice(i + 1, i + 4).filter(l => l.length > 20);
      if (summaryLines.length > 0) {
        return summaryLines.join(' ');
      }
    }
  }
  
  // If no summary section, use first paragraph
  const firstParagraph = lines.slice(0, 5).join(' ');
  if (firstParagraph.length > 50 && firstParagraph.length < 500) {
    return firstParagraph;
  }
  
  return null;
}
