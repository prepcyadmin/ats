import natural from 'natural';
import stopword from 'stopword';
import nlp from 'compromise';

const { WordTokenizer, PorterStemmer } = natural;

/**
 * Extract technical requirements from job description
 * Filters out common English words and focuses on technical terms
 * @param {string} jobDescription - Job description text
 * @returns {Object} Technical requirements analysis
 */
export function extractTechnicalRequirements(jobDescription) {
  const text = jobDescription.toLowerCase();
  
  // Technical categories
  const technicalCategories = {
    programmingLanguages: extractProgrammingLanguages(text),
    frameworks: extractFrameworks(text),
    tools: extractTools(text),
    platforms: extractPlatforms(text),
    databases: extractDatabases(text),
    methodologies: extractMethodologies(text),
    certifications: extractCertifications(text),
    softSkills: extractSoftSkills(text),
    experience: extractExperienceRequirements(text),
    education: extractEducationRequirements(text)
  };
  
  // Filter out common English words and get only technical terms
  const allTechnicalTerms = [
    ...technicalCategories.programmingLanguages,
    ...technicalCategories.frameworks,
    ...technicalCategories.tools,
    ...technicalCategories.platforms,
    ...technicalCategories.databases,
    ...technicalCategories.methodologies
  ];
  
  // Extract technical keywords using NLP (excluding common words)
  const technicalKeywords = extractTechnicalKeywords(jobDescription, allTechnicalTerms);
  
  return {
    categories: technicalCategories,
    technicalKeywords: technicalKeywords,
    allTechnicalTerms: [...new Set(allTechnicalTerms)], // Remove duplicates
    summary: {
      totalTechnicalTerms: [...new Set(allTechnicalTerms)].length,
      programmingLanguages: technicalCategories.programmingLanguages.length,
      frameworks: technicalCategories.frameworks.length,
      tools: technicalCategories.tools.length,
      platforms: technicalCategories.platforms.length,
      databases: technicalCategories.databases.length
    }
  };
}

/**
 * Extract programming languages
 */
function extractProgrammingLanguages(text) {
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'php',
    'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab',
    'perl', 'shell', 'bash', 'powershell', 'sql', 'html', 'css',
    'dart', 'lua', 'clojure', 'haskell', 'erlang', 'elixir'
  ];
  
  return languages.filter(lang => {
    // Escape special regex characters
    const escapedLang = lang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match whole word or as part of technology name
    const regex = new RegExp(`\\b${escapedLang}\\b|${escapedLang}\\.js|${escapedLang}script`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract frameworks and libraries
 */
function extractFrameworks(text) {
  const frameworks = [
    'react', 'angular', 'vue', 'svelte', 'ember', 'backbone',
    'node.js', 'express', 'nestjs', 'fastapi', 'django', 'flask',
    'spring', 'hibernate', 'struts', 'play framework',
    'laravel', 'symfony', 'codeigniter', 'rails', 'sinatra',
    '.net', 'asp.net', 'entity framework', 'nhibernate',
    'jquery', 'bootstrap', 'tailwind', 'material-ui', 'ant design',
    'next.js', 'nuxt.js', 'gatsby', 'remix', 'sveltekit',
    'graphql', 'apollo', 'relay', 'prisma',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy'
  ];
  
  return frameworks.filter(fw => {
    const regex = new RegExp(`\\b${fw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract tools and technologies
 */
function extractTools(text) {
  const tools = [
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'docker', 'kubernetes', 'jenkins', 'ci/cd', 'github actions',
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel',
    'terraform', 'ansible', 'chef', 'puppet',
    'jira', 'confluence', 'slack', 'trello', 'asana', 'monday',
    'postman', 'insomnia', 'swagger', 'api',
    'webpack', 'vite', 'rollup', 'parcel', 'babel',
    'eslint', 'prettier', 'jest', 'mocha', 'cypress', 'selenium',
    'figma', 'sketch', 'adobe xd', 'invision',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
    'kafka', 'rabbitmq', 'nginx', 'apache'
  ];
  
  return tools.filter(tool => {
    const regex = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract platforms
 */
function extractPlatforms(text) {
  const platforms = [
    'linux', 'windows', 'macos', 'unix',
    'ios', 'android', 'mobile',
    'web', 'desktop', 'cloud', 'saas', 'paas', 'iaas',
    'microservices', 'serverless', 'monolith'
  ];
  
  return platforms.filter(platform => {
    const regex = new RegExp(`\\b${platform}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract databases
 */
function extractDatabases(text) {
  const databases = [
    'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra',
    'oracle', 'sql server', 'sqlite', 'dynamodb',
    'elasticsearch', 'solr', 'neo4j', 'couchdb',
    'mariadb', 'firebase', 'supabase'
  ];
  
  return databases.filter(db => {
    const regex = new RegExp(`\\b${db.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract methodologies
 */
function extractMethodologies(text) {
  const methodologies = [
    'agile', 'scrum', 'kanban', 'waterfall', 'devops',
    'ci/cd', 'tdd', 'bdd', 'pair programming', 'code review',
    'microservices', 'rest', 'soap', 'graphql', 'api design'
  ];
  
  return methodologies.filter(method => {
    const regex = new RegExp(`\\b${method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract certifications
 */
function extractCertifications(text) {
  const certPatterns = [
    /aws\s+certified/i,
    /azure\s+certified/i,
    /google\s+cloud\s+certified/i,
    /pmp\s+certified/i,
    /scrum\s+master/i,
    /certified\s+([a-z\s]+)/gi
  ];
  
  const certifications = [];
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      certifications.push(...matches.map(m => m.trim()));
    }
  });
  
  return [...new Set(certifications)];
}

/**
 * Extract soft skills (limited - focus on technical)
 */
function extractSoftSkills(text) {
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'collaboration',
    'problem-solving', 'analytical', 'critical thinking', 'adaptability'
  ];
  
  return softSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract experience requirements
 */
function extractExperienceRequirements(text) {
  const experiencePatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/gi,
    /minimum\s+(\d+)\s+(?:years?|yrs?)/gi,
    /(\d+)\s*-\s*(\d+)\s+(?:years?|yrs?)/gi
  ];
  
  const requirements = [];
  experiencePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        requirements.push({
          type: 'years',
          value: parseInt(match[1]),
          text: match[0]
        });
      }
    }
  });
  
  return requirements;
}

/**
 * Extract education requirements
 */
function extractEducationRequirements(text) {
  const educationLevels = [
    'bachelor', "bachelor's", 'bachelor of science', 'bs', 'bsc',
    'master', "master's", 'master of science', 'ms', 'msc',
    'phd', 'doctorate', 'mba', 'btech', 'mtech', 'degree'
  ];
  
  return educationLevels.filter(level => {
    const regex = new RegExp(`\\b${level}\\b`, 'i');
    return regex.test(text);
  });
}

/**
 * Extract technical keywords from text, filtering common English words
 */
function extractTechnicalKeywords(text, knownTechnicalTerms) {
  const tokenizer = new WordTokenizer();
  let tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove stopwords (common English words)
  tokens = stopword.removeStopwords(tokens);
  
  // Filter for technical terms
  const technicalTerms = new Set(knownTechnicalTerms.map(t => t.toLowerCase()));
  
  // Also look for capitalized terms (often technical)
  const capitalizedTerms = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  capitalizedTerms.forEach(term => {
    const termLower = term.toLowerCase();
    // If it's not a common word and looks technical
    if (term.length > 2 && !isCommonWord(termLower)) {
      technicalTerms.add(termLower);
    }
  });
  
  // Extract terms that appear in text
  const foundTerms = [];
  technicalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      foundTerms.push(term);
    }
  });
  
  // Also extract compound technical terms (e.g., "machine learning", "cloud computing")
  const compoundTerms = extractCompoundTechnicalTerms(text);
  foundTerms.push(...compoundTerms);
  
  return [...new Set(foundTerms)];
}

/**
 * Check if word is a common English word
 */
function isCommonWord(word) {
  const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its',
    'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
    'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
    'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been',
    'being', 'has', 'had', 'does', 'did', 'doing', 'done', 'said', 'says',
    'saying', 'went', 'goes', 'going', 'gone', 'got', 'gotten', 'getting',
    'came', 'comes', 'coming', 'made', 'makes', 'making', 'took', 'takes',
    'taking', 'saw', 'sees', 'seeing', 'seen', 'found', 'finds', 'finding',
    'gave', 'gives', 'giving', 'given', 'told', 'tells', 'telling', 'asked',
    'asks', 'asking', 'worked', 'works', 'working', 'called', 'calls',
    'calling', 'tried', 'tries', 'trying', 'needed', 'needs', 'needing',
    'wanted', 'wants', 'wanting', 'seemed', 'seems', 'seeming', 'helped',
    'helps', 'helping', 'showed', 'shows', 'showing', 'shown', 'moved',
    'moves', 'moving', 'lived', 'lives', 'living', 'turned', 'turns',
    'turning', 'started', 'starts', 'starting', 'stopped', 'stops', 'stopping',
    'opened', 'opens', 'opening', 'closed', 'closes', 'closing', 'walked',
    'walks', 'walking', 'ran', 'runs', 'running', 'played', 'plays', 'playing',
    'studied', 'studies', 'studying', 'learned', 'learns', 'learning', 'taught',
    'teaches', 'teaching', 'thought', 'thinks', 'thinking', 'brought', 'brings',
    'bringing', 'bought', 'buys', 'buying', 'fought', 'fights', 'fighting',
    'caught', 'catches', 'catching', 'chose', 'chooses', 'choosing', 'chosen',
    'fell', 'falls', 'falling', 'felt', 'feels', 'feeling', 'flew', 'flies',
    'flying', 'forgot', 'forgets', 'forgetting', 'forgotten', 'forgave',
    'forgives', 'forgiving', 'forgiven', 'froze', 'freezes', 'freezing',
    'frozen', 'got', 'gets', 'getting', 'gotten', 'gave', 'gives', 'giving',
    'given', 'went', 'goes', 'going', 'gone', 'grew', 'grows', 'growing',
    'grown', 'hung', 'hangs', 'hanging', 'heard', 'hears', 'hearing', 'held',
    'holds', 'holding', 'hid', 'hides', 'hiding', 'hidden', 'hit', 'hits',
    'hitting', 'hurt', 'hurts', 'hurting', 'kept', 'keeps', 'keeping', 'knew',
    'knows', 'knowing', 'known', 'laid', 'lays', 'laying', 'led', 'leads',
    'leading', 'left', 'leaves', 'leaving', 'lent', 'lends', 'lending', 'let',
    'lets', 'letting', 'lay', 'lies', 'lying', 'lain', 'lost', 'loses',
    'losing', 'made', 'makes', 'making', 'meant', 'means', 'meaning', 'met',
    'meets', 'meeting', 'paid', 'pays', 'paying', 'put', 'puts', 'putting',
    'read', 'reads', 'reading', 'rode', 'rides', 'riding', 'ridden', 'rang',
    'rings', 'ringing', 'rung', 'rose', 'rises', 'rising', 'risen', 'ran',
    'runs', 'running', 'said', 'says', 'saying', 'saw', 'sees', 'seeing',
    'seen', 'sold', 'sells', 'selling', 'sent', 'sends', 'sending', 'set',
    'sets', 'setting', 'shook', 'shakes', 'shaking', 'shaken', 'shone',
    'shines', 'shining', 'shone', 'shot', 'shots', 'shooting', 'showed',
    'shows', 'showing', 'shown', 'shut', 'shuts', 'shutting', 'sang', 'sings',
    'singing', 'sung', 'sank', 'sinks', 'sinking', 'sunk', 'sat', 'sits',
    'sitting', 'slept', 'sleeps', 'sleeping', 'slid', 'slides', 'sliding',
    'spoke', 'speaks', 'speaking', 'spoken', 'spent', 'spends', 'spending',
    'spread', 'spreads', 'spreading', 'sprang', 'springs', 'springing',
    'sprung', 'stood', 'stands', 'standing', 'stole', 'steals', 'stealing',
    'stolen', 'stuck', 'sticks', 'sticking', 'stung', 'stings', 'stinging',
    'struck', 'strikes', 'striking', 'struck', 'swam', 'swims', 'swimming',
    'swum', 'swung', 'swings', 'swinging', 'took', 'takes', 'taking', 'taken',
    'taught', 'teaches', 'teaching', 'tore', 'tears', 'tearing', 'torn',
    'told', 'tells', 'telling', 'thought', 'thinks', 'thinking', 'threw',
    'throws', 'throwing', 'thrown', 'understood', 'understands', 'understanding',
    'woke', 'wakes', 'waking', 'woken', 'wore', 'wears', 'wearing', 'worn',
    'won', 'wins', 'winning', 'wrote', 'writes', 'writing', 'written'
  ];
  
  return commonWords.includes(word.toLowerCase());
}

/**
 * Extract compound technical terms
 */
function extractCompoundTechnicalTerms(text) {
  const compoundTerms = [
    'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml', 'dl',
    'cloud computing', 'cloud services', 'cloud infrastructure',
    'data science', 'data analytics', 'big data', 'data engineering',
    'software engineering', 'software development', 'web development',
    'mobile development', 'ios development', 'android development',
    'full stack', 'frontend', 'front end', 'backend', 'back end',
    'devops', 'site reliability', 'sre', 'infrastructure as code',
    'test driven development', 'tdd', 'behavior driven development', 'bdd',
    'continuous integration', 'continuous deployment', 'ci/cd',
    'application programming interface', 'rest api', 'graphql api',
    'user interface', 'ui', 'user experience', 'ux',
    'responsive design', 'progressive web app', 'pwa',
    'object oriented programming', 'oop', 'functional programming',
    'microservices architecture', 'service oriented architecture', 'soa',
    'domain driven design', 'ddd', 'model view controller', 'mvc',
    'representational state transfer', 'rest', 'simple object access protocol', 'soap'
  ];
  
  const found = [];
  compoundTerms.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      found.push(term);
    }
  });
  
  return found;
}
