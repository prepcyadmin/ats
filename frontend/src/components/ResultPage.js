import React, { useState } from 'react';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import { API_ENDPOINTS, normalizeApiUrl } from '../config/api';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  BarController
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  BarController
);

// Speedometer Gauge Component - Improved and Fixed
const SpeedometerGauge = ({ value, color, size = 220 }) => {
  const percentage = Math.min(100, Math.max(0, value || 0));
  const normalizedValue = isNaN(percentage) ? 0 : percentage;
  
  // Calculate angle: -90 to 90 degrees (half circle from left to right)
  const angle = (normalizedValue / 100) * 180 - 90;
  const radius = size / 2 - 25;
  const centerX = size / 2;
  const centerY = size / 2 + 15;
  
  // Calculate needle position
  const needleLength = radius * 0.75;
  const angleRad = (angle * Math.PI) / 180;
  const needleX = centerX + needleLength * Math.cos(angleRad);
  const needleY = centerY + needleLength * Math.sin(angleRad);
  
  // Helper function to create filled arc path (pie slice)
  const createArcPath = (startAngle, endAngle, r) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    const x1 = centerX + r * Math.cos(start);
    const y1 = centerY + r * Math.sin(start);
    const x2 = centerX + r * Math.cos(end);
    const y2 = centerY + r * Math.sin(end);
    const largeArcFlag = end - start > Math.PI ? 1 : 0;
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  // Create arc path for filled portion
  const filledArcPath = normalizedValue > 0 ? createArcPath(-90, angle, radius) : '';
  
  return (
    <div style={{ 
      position: 'relative', 
      width: size, 
      height: size / 2 + 50, 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg 
        width={size} 
        height={size / 2 + 20} 
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
        style={{ overflow: 'visible' }}
      >
        {/* Background arc (gray track) */}
        <path
          d={createArcPath(-90, 90, radius)}
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        
        {/* Colored zones background */}
        <path
          d={createArcPath(-90, -30, radius)}
          fill="#ff6384"
          opacity="0.15"
        />
        <path
          d={createArcPath(-30, 30, radius)}
          fill="#FFA500"
          opacity="0.15"
        />
        <path
          d={createArcPath(30, 90, radius)}
          fill="#00ff7f"
          opacity="0.15"
        />
        
        {/* Filled arc based on value */}
        {filledArcPath && (
          <path
            d={filledArcPath}
            fill={color}
            opacity="0.85"
            style={{ 
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'all 0.5s ease'
            }}
          />
        )}
        
        {/* Outer ring for better visibility */}
        <path
          d={createArcPath(-90, 90, radius)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2.5"
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = (tick / 100) * 180 - 90;
          const tickRad = (tickAngle * Math.PI) / 180;
          const tickStartX = centerX + (radius - 10) * Math.cos(tickRad);
          const tickStartY = centerY + (radius - 10) * Math.sin(tickRad);
          const tickEndX = centerX + (radius + 5) * Math.cos(tickRad);
          const tickEndY = centerY + (radius + 5) * Math.sin(tickRad);
          return (
            <line
              key={tick}
              x1={tickStartX}
              y1={tickStartY}
              x2={tickEndX}
              y2={tickEndY}
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ 
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: 'all 0.5s ease'
          }}
        />
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="12"
          fill={color}
          style={{ 
            filter: `drop-shadow(0 0 10px ${color})`
          }}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="7"
          fill="#fff"
        />
      </svg>
      
      {/* Value display */}
      <div style={{
        marginTop: '15px',
        fontSize: size / 5.5,
        fontWeight: 'bold',
        color: color,
        textShadow: `0 0 15px ${color}, 0 0 25px ${color}`,
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '2px'
      }}>
        {Math.round(normalizedValue)}%
      </div>
    </div>
  );
};

const ResultPage = ({ result, onReset }) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    React.useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowSize.width < 768;
    const isTablet = windowSize.width >= 768 && windowSize.width < 1024;

    if (!result) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>
                <p>No analysis result available.</p>
                {onReset && (
                    <button 
                        onClick={onReset}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Go Back
                    </button>
                )}
            </div>
        );
    }

    // Extract data with fallbacks - Use JD Match Analysis if available
    const jdBreakdown = result.jdMatchAnalysis?.breakdown || {};
    const semanticSimilarity = parseFloat(jdBreakdown.semanticSimilarity || result.semanticSimilarity || 0);
    const keywordMatch = parseFloat(jdBreakdown.keywordMatch || result.keywordMatchScore || 0);
    const skillRelevance = parseFloat(jdBreakdown.skillRelevance || result.skillRelevance || 0);
    const experienceMatch = parseFloat(jdBreakdown.experienceMatch || result.experienceMatch || 0);
    const educationMatch = parseFloat(jdBreakdown.educationMatch || result.educationMatch || 0);
    const cosineSimilarity = parseFloat(jdBreakdown.cosineSimilarity || result.cosineSimilarity || 0);
    const jaccardSimilarity = parseFloat(jdBreakdown.jaccardSimilarity || result.jaccardSimilarity || 0);
    
    // Get the two main scores with fallback calculation from breakdown
    const jdMatchScore = (() => {
      if (result.jdMatchScore && result.jdMatchScore > 0) return result.jdMatchScore;
      if (result.jdMatchAnalysis?.overallScore && result.jdMatchAnalysis.overallScore > 0) {
        return result.jdMatchAnalysis.overallScore;
      }
      // Calculate from breakdown if available
      if (jdBreakdown && Object.keys(jdBreakdown).length > 0) {
        const semantic = semanticSimilarity || 0;
        const keyword = keywordMatch || 0;
        const skills = skillRelevance || 0;
        const exp = experienceMatch || 0;
        const edu = educationMatch || 0;
        // Weighted average
        const calculated = (semantic * 0.30) + (keyword * 0.35) + (skills * 0.20) + (exp * 0.10) + (edu * 0.05);
        return Math.round(Math.max(0, Math.min(100, calculated)));
      }
      return 0;
    })();
    
    // ATS Readability Score - Use formattingAnalysis.atsReadabilityScore (same as PDF report)
    const atsReadabilityScore = (() => {
      // Primary: Use ATS Readability Score from formatting analysis (matches PDF report)
      if (result.formattingAnalysis?.atsReadabilityScore !== undefined) {
        return Math.round(result.formattingAnalysis.atsReadabilityScore);
      }
      // Fallback: Use ATS Best Practices overall score if formatting score not available
      if (result.atsScore && result.atsScore > 0) return result.atsScore;
      if (result.atsBestPractices?.overallScore && result.atsBestPractices.overallScore > 0) {
        return result.atsBestPractices.overallScore;
      }
      // Calculate from section scores if available
      if (result.atsBestPractices?.summary) {
        const summary = result.atsBestPractices.summary;
        const weights = {
          contactScore: 0.15,
          summaryScore: 0.15,
          experienceScore: 0.25,
          educationScore: 0.15,
          skillsScore: 0.15,
          locationScore: 0.05,
          lengthScore: 0.05
        };
        let weightedSum = 0;
        let totalWeight = 0;
        Object.entries(weights).forEach(([key, weight]) => {
          const score = summary[key];
          if (typeof score === 'number' && !isNaN(score)) {
            weightedSum += score * weight;
            totalWeight += weight;
          }
        });
        if (totalWeight > 0) {
          return Math.round(weightedSum / totalWeight);
        }
      }
      return 0;
    })();

    // Skills data - Use improved skillsMatch if available, otherwise fallback to skillsAnalysis
    const skillsMatch = result.skillsMatch || {};
    const jobSkills = skillsMatch.matchedSkills && skillsMatch.missingSkills 
        ? [...(skillsMatch.matchedSkills || []), ...(skillsMatch.missingSkills || [])]
        : (result.skillsAnalysis?.jobSkills || []);
    const matchingSkills = skillsMatch.matchedSkills || result.skillsAnalysis?.matchingSkills || [];
    const missingSkills = skillsMatch.missingSkills || jobSkills.filter(js => 
        !matchingSkills.some(ms => 
            ms.toLowerCase().includes(js.toLowerCase()) || 
            js.toLowerCase().includes(ms.toLowerCase())
        )
    );

    // Chart data
    const scoreBreakdownData = {
        labels: ['Semantic', 'Keyword', 'Skills', 'Experience', 'Education'],
        datasets: [{
            label: 'Score',
            data: [
                semanticSimilarity,
                keywordMatch,
                skillRelevance,
                experienceMatch,
                educationMatch
            ],
            backgroundColor: [
                'rgba(0, 255, 255, 0.7)',
                'rgba(139, 0, 139, 0.7)',
                'rgba(255, 165, 0, 0.7)',
                'rgba(0, 255, 127, 0.7)',
                'rgba(255, 20, 147, 0.7)'
            ],
            borderColor: [
                '#00ffff',
                '#8B008B',
                '#FFA500',
                '#00ff7f',
                '#ff1493'
            ],
            borderWidth: 2,
        }],
    };

    // ATS Score Breakdown Data
    const atsBreakdownData = {
        labels: ['Contact', 'Summary', 'Experience', 'Education', 'Skills', 'Location', 'Length'],
        datasets: [{
            label: 'ATS Section Scores',
            data: result.atsBestPractices?.summary ? [
                result.atsBestPractices.summary.contactScore || 0,
                result.atsBestPractices.summary.summaryScore || 0,
                result.atsBestPractices.summary.experienceScore || 0,
                result.atsBestPractices.summary.educationScore || 0,
                result.atsBestPractices.summary.skillsScore || 0,
                result.atsBestPractices.summary.locationScore || 0,
                result.atsBestPractices.summary.lengthScore || 0
            ] : [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(0, 255, 127, 0.7)',
            borderColor: '#00ff7f',
            borderWidth: 2,
        }],
    };

    const similarityComparisonData = {
        labels: ['Semantic', 'Jaccard', 'Cosine', 'Keyword', 'Skills', 'JD Match'],
        datasets: [{
            label: 'JD Match Scores',
            data: [
                semanticSimilarity,
                jaccardSimilarity,
                cosineSimilarity,
                keywordMatch,
                skillRelevance,
                jdMatchScore
            ],
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            borderColor: '#00ffff',
            borderWidth: 2,
            pointBackgroundColor: '#00ffff',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#00ffff',
        }],
    };

    // Get skills for chart - prioritize skillsMatch data, use all required skills
    const allRequiredSkills = skillsMatch.matchedSkills && skillsMatch.missingSkills
        ? [...(skillsMatch.matchedSkills || []), ...(skillsMatch.missingSkills || [])]
        : (jobSkills && jobSkills.length > 0 ? jobSkills : []);
    
    // If still empty, try to get from technicalMatch or skillsMatch categoryScores
    let topSkillsToShow = allRequiredSkills;
    if (topSkillsToShow.length === 0 && result.technicalMatch?.matches) {
        // Extract skills from technical match categories
        const technicalSkills = [];
        Object.values(result.technicalMatch.matches).forEach(match => {
            if (match.missing && Array.isArray(match.missing)) {
                technicalSkills.push(...match.missing);
            }
        });
        topSkillsToShow = technicalSkills.slice(0, 10);
    }
    if (topSkillsToShow.length === 0 && skillsMatch.categoryScores) {
        // Extract from category scores
        Object.keys(skillsMatch.categoryScores).forEach(category => {
            const categoryData = skillsMatch.categoryScores[category];
            if (categoryData.missing && Array.isArray(categoryData.missing)) {
                topSkillsToShow.push(...categoryData.missing);
            }
            if (categoryData.matched && Array.isArray(categoryData.matched)) {
                topSkillsToShow.push(...categoryData.matched);
            }
        });
    }
    
    // Limit to top 15 skills for display
    topSkillsToShow = topSkillsToShow.slice(0, 15);
    
    const skillsMatchData = {
        labels: topSkillsToShow.map(skill => {
            const skillStr = typeof skill === 'string' ? skill : (skill.term || skill.name || String(skill));
            return skillStr.length > 20 ? skillStr.substring(0, 20) + '...' : skillStr;
        }),
        datasets: [{
            label: 'Match Score',
            data: topSkillsToShow.map(skill => {
                const skillStr = typeof skill === 'string' ? skill : (skill.term || skill.name || String(skill));
                const isMatched = matchingSkills.some(ms => {
                    const msStr = typeof ms === 'string' ? ms : String(ms);
                    return msStr.toLowerCase().includes(skillStr.toLowerCase()) || 
                           skillStr.toLowerCase().includes(msStr.toLowerCase());
                });
                return isMatched ? 100 : 0;
            }),
            backgroundColor: topSkillsToShow.map(skill => {
                const skillStr = typeof skill === 'string' ? skill : (skill.term || skill.name || String(skill));
                const isMatched = matchingSkills.some(ms => {
                    const msStr = typeof ms === 'string' ? ms : String(ms);
                    return msStr.toLowerCase().includes(skillStr.toLowerCase()) || 
                           skillStr.toLowerCase().includes(msStr.toLowerCase());
                });
                return isMatched ? 'rgba(0, 255, 127, 0.7)' : 'rgba(255, 99, 132, 0.7)';
            }),
            borderColor: topSkillsToShow.map(skill => {
                const skillStr = typeof skill === 'string' ? skill : (skill.term || skill.name || String(skill));
                const isMatched = matchingSkills.some(ms => {
                    const msStr = typeof ms === 'string' ? ms : String(ms);
                    return msStr.toLowerCase().includes(skillStr.toLowerCase()) || 
                           skillStr.toLowerCase().includes(msStr.toLowerCase());
                });
                return isMatched ? '#00ff7f' : '#ff6384';
            }),
            borderWidth: 2,
        }],
    };

    // Remove misleading donut chart - scores are independent, not a distribution
    // Instead, we'll show individual score cards

    // Collect all recommendations and drawbacks
    const allRecommendations = [];
    const drawbacks = [];
    const boostTips = [];

    // ATS Best Practices recommendations (PRIMARY - shown first)
    if (result.atsBestPractices && result.recommendations?.atsBestPractices) {
        result.recommendations.atsBestPractices.forEach(rec => {
            allRecommendations.push({
                title: rec.title || rec.category || 'ATS Best Practice',
                message: rec.message,
                priority: rec.priority || 'high',
                category: rec.category,
                impact: rec.impact,
                source: 'ATS Best Practices'
            });
        });
    }
    
    // From recommendations
    if (result.recommendations) {
        if (result.recommendations.overall) {
            allRecommendations.push(...result.recommendations.overall.map(r => ({...r, source: 'JD Matching'})));
        }
        if (result.recommendations.technical) {
            result.recommendations.technical.forEach(r => {
                // Handle both string and object recommendations
                if (typeof r === 'string') {
                    allRecommendations.push({
                        title: r,
                        message: r,
                        priority: 'high',
                        source: 'JD Matching'
                    });
                } else if (typeof r === 'object' && r !== null) {
                    // It's already a recommendation object
                    allRecommendations.push({
                        title: r.title || r.message || 'Technical Recommendation',
                        message: r.message || r.title || '',
                        description: r.description || '',
                        action: r.action || '',
                        priority: r.priority || 'high',
                        category: r.category || 'technical',
                        impact: r.impact || 'Medium',
                        examples: Array.isArray(r.examples) ? r.examples : [],
                        source: 'JD Matching'
                    });
                }
            });
        }
        if (result.recommendations.keywords) {
            allRecommendations.push(...result.recommendations.keywords.map(r => ({...r, source: 'JD Matching'})));
        }
        if (result.recommendations.skills) {
            allRecommendations.push(...result.recommendations.skills.map(r => ({...r, source: 'JD Matching'})));
        }
    }

    // From skills match
    if (result.skillsMatch?.recommendations) {
        result.skillsMatch.recommendations.forEach(rec => {
            allRecommendations.push({
                ...rec,
                source: 'JD Matching'
            });
        });
    }

    // From formatting analysis
    if (result.formattingAnalysis) {
        if (result.formattingAnalysis.issues.length > 0) {
            drawbacks.push({
                category: 'Formatting',
                items: result.formattingAnalysis.issues,
                impact: 'High'
            });
        }
        if (result.formattingAnalysis.warnings.length > 0) {
            drawbacks.push({
                category: 'Formatting Warnings',
                items: result.formattingAnalysis.warnings,
                impact: 'Medium'
            });
        }
    }

    // From section analysis
    if (result.sectionAnalysis) {
        Object.values(result.sectionAnalysis.sections).forEach(section => {
            if (section.score < 70 && section.issues.length > 0) {
                drawbacks.push({
                    category: section.name,
                    items: section.issues,
                    impact: section.score < 50 ? 'High' : 'Medium'
                });
            }
        });
    }

    // From missing requirements
    if (result.technicalMatch?.missingRequirements) {
        const missing = result.technicalMatch.missingRequirements;
        if (missing.critical && missing.critical.length > 0) {
            drawbacks.push({
                category: 'Critical Missing Requirements',
                items: missing.critical.map(m => m.term),
                impact: 'Critical'
            });
        }
        if (missing.important && missing.important.length > 0) {
            drawbacks.push({
                category: 'Important Missing Requirements',
                items: missing.important.map(m => m.term),
                impact: 'High'
            });
        }
    }

    // From missing skills
    if (result.skillsMatch?.missingSkills && result.skillsMatch.missingSkills.length > 0) {
        drawbacks.push({
            category: 'Missing Skills',
            items: result.skillsMatch.missingSkills,
            impact: 'High'
        });
    }

    // Generate boost tips
    if (result.matchPercentage < 80) {
        boostTips.push({
            title: 'Add Missing Keywords',
            description: `You're missing ${result.keywordOptimization?.summary?.missingKeywords || 0} keywords from the job description. Add them to your resume.`,
            priority: 'High',
            impact: '+5-10 points'
        });
    }

    if (result.formattingAnalysis && result.formattingAnalysis.atsReadabilityScore < 80) {
        boostTips.push({
            title: 'Fix Formatting Issues',
            description: 'Improve ATS readability by fixing formatting issues. This can boost your score significantly.',
            priority: 'High',
            impact: '+5-15 points'
        });
    }

    if (result.achievementAnalysis && result.achievementAnalysis.totalAchievements < 3) {
        boostTips.push({
            title: 'Add Quantifiable Achievements',
            description: 'Add more metrics and numbers to your achievements. Resumes with quantifiable results score higher.',
            priority: 'Medium',
            impact: '+3-8 points'
        });
    }

    if (result.skillsMatch && result.skillsMatch.missing > 0) {
        boostTips.push({
            title: 'Add Missing Skills',
            description: `Add ${result.skillsMatch.missing} missing skills to your resume. Focus on critical ones first.`,
            priority: 'High',
            impact: '+5-12 points'
        });
    }

    if (result.sectionAnalysis && result.sectionAnalysis.completeness.percentage < 100) {
        boostTips.push({
            title: 'Complete Missing Sections',
            description: `Add missing sections: ${result.sectionAnalysis.completeness.missing.join(', ')}`,
            priority: 'Medium',
            impact: '+3-7 points'
        });
    }

    const containerStyle = {
        maxWidth: '1400px',
        margin: isMobile ? '10px auto' : '30px auto',
        padding: isMobile ? '10px' : '20px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        width: '100%',
        boxSizing: 'border-box',
    };


    const panelStyle = {
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: isMobile ? '10px' : '15px',
        padding: isMobile ? '15px' : '25px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        color: '#fff',
        width: '100%',
        boxSizing: 'border-box',
    };

    const panelHeader = {
        fontSize: isMobile ? '16px' : '20px',
        fontWeight: 'bold',
        marginBottom: isMobile ? '15px' : '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: isMobile ? 'wrap' : 'nowrap'
    };

    const recommendationCard = {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: isMobile ? '8px' : '10px',
        padding: isMobile ? '12px' : '15px',
        marginBottom: isMobile ? '12px' : '15px',
        borderLeft: '4px solid',
    };

    const drawbackCard = {
        background: 'rgba(255, 99, 132, 0.2)',
        borderRadius: isMobile ? '8px' : '10px',
        padding: isMobile ? '12px' : '15px',
        marginBottom: isMobile ? '12px' : '15px',
        borderLeft: '4px solid #ff6384',
    };

    const boostTipCard = {
        background: 'rgba(0, 255, 127, 0.2)',
        borderRadius: isMobile ? '8px' : '10px',
        padding: isMobile ? '12px' : '15px',
        marginBottom: isMobile ? '12px' : '15px',
        borderLeft: '4px solid #00ff7f',
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{ ...panelStyle, marginBottom: isMobile ? '15px' : '20px', textAlign: 'center' }}>
                <h1 style={{ 
                    margin: '0 0 20px 0', 
                    fontSize: isMobile ? '18px' : '28px',
                    wordBreak: 'break-word'
                }}>
                    📊 AI ATS Scanner - AI Graph Analysis Report
                </h1>
                {isMobile && (
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px', wordBreak: 'break-word' }}>
                        {result.resumeName}
                    </div>
                )}
            </div>

            {/* Action Buttons - At the Top */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '15px',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: isMobile ? '20px' : '25px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={async () => {
                        try {
                            const API_URL = normalizeApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');
                            const response = await fetch(`${API_URL}/resumes/export`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ result }),
                            });
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ATS_Resume_Report_${result.resumeName?.replace(/\.[^/.]+$/, '') || 'Resume'}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        } catch (error) {
                            console.error('Export failed:', error);
                            alert('Failed to export report. Please try again.');
                        }
                    }}
                    style={{
                        background: '#00ff7f',
                        color: '#000',
                        padding: isMobile ? '10px 20px' : '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: 'bold',
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: isMobile ? '300px' : 'none'
                    }}
                >
                    📥 Export PDF Report
                </button>
                {onReset && (
                    <button 
                        onClick={onReset}
                        style={{
                            background: 'transparent',
                            color: '#00ffff',
                            padding: isMobile ? '10px 20px' : '12px 24px',
                            borderRadius: '8px',
                            border: '2px solid #00ffff',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold',
                            width: isMobile ? '100%' : 'auto',
                            maxWidth: isMobile ? '300px' : 'none'
                        }}
                    >
                        Analyze Another Resume
                    </button>
                )}
            </div>

            {/* Professional Speedometer Gauges - Side by Side */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '20px' : '30px',
                marginBottom: isMobile ? '25px' : '35px',
                width: '100%'
            }}>
                {/* ATS Readability Speedometer - Professional Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.12) 0%, rgba(0, 214, 255, 0.08) 100%)',
                    border: '1px solid rgba(0, 255, 127, 0.3)',
                    borderRadius: '20px',
                    padding: isMobile ? '25px 20px' : '35px 30px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0, 255, 127, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Decorative corner accent */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(0, 255, 127, 0.2) 0%, transparent 70%)',
                        borderRadius: '0 20px 0 100%'
                    }} />
                    
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: isMobile ? '20px' : '25px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.3), rgba(0, 214, 255, 0.3))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            boxShadow: '0 4px 15px rgba(0, 255, 127, 0.3)'
                        }}>
                            ✅
                        </div>
                        <div>
                            <div style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '700',
                                color: '#ffffff',
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 10px rgba(0, 255, 127, 0.5)'
                            }}>
                                ATS Readability
                            </div>
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginTop: '4px',
                                fontWeight: '500'
                            }}>
                                Resume Structure & Format
                            </div>
                        </div>
                    </div>
                    
                    {/* Speedometer */}
                    <div style={{ margin: isMobile ? '15px 0' : '20px 0' }}>
                        <SpeedometerGauge 
                            value={atsReadabilityScore}
                            color={atsReadabilityScore >= 80 ? '#00ff7f' : atsReadabilityScore >= 60 ? '#FFA500' : '#ff6384'}
                            size={isMobile ? 200 : 240}
                        />
                    </div>
                    
                    {/* Footer info */}
                    <div style={{
                        marginTop: isMobile ? '15px' : '20px',
                        padding: isMobile ? '12px' : '15px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ 
                            fontSize: isMobile ? '11px' : '12px', 
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.6',
                            fontWeight: '500'
                        }}>
                            Measures resume formatting, structure completeness, and ATS system compatibility
                        </div>
                    </div>
                </div>

                {/* JD Match Score Speedometer - Professional Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 214, 255, 0.12) 0%, rgba(138, 43, 226, 0.08) 100%)',
                    border: '1px solid rgba(0, 214, 255, 0.3)',
                    borderRadius: '20px',
                    padding: isMobile ? '25px 20px' : '35px 30px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0, 214, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Decorative corner accent */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(0, 214, 255, 0.2) 0%, transparent 70%)',
                        borderRadius: '0 20px 0 100%'
                    }} />
                    
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: isMobile ? '20px' : '25px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(0, 214, 255, 0.3), rgba(138, 43, 226, 0.3))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            boxShadow: '0 4px 15px rgba(0, 214, 255, 0.3)'
                        }}>
                            🎯
                        </div>
                        <div>
                            <div style={{
                                fontSize: isMobile ? '16px' : '20px',
                                fontWeight: '700',
                                color: '#ffffff',
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 10px rgba(0, 214, 255, 0.5)'
                            }}>
                                JD Match Score
                            </div>
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginTop: '4px',
                                fontWeight: '500'
                            }}>
                                Job Description Alignment
                            </div>
                        </div>
                    </div>
                    
                    {/* Speedometer */}
                    <div style={{ margin: isMobile ? '15px 0' : '20px 0' }}>
                        <SpeedometerGauge 
                            value={jdMatchScore}
                            color={jdMatchScore >= 80 ? '#00ff7f' : jdMatchScore >= 60 ? '#FFA500' : '#ff6384'}
                            size={isMobile ? 200 : 240}
                        />
                    </div>
                    
                    {/* Footer info */}
                    <div style={{
                        marginTop: isMobile ? '15px' : '20px',
                        padding: isMobile ? '12px' : '15px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ 
                            fontSize: isMobile ? '11px' : '12px', 
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.6',
                            fontWeight: '500'
                        }}>
                            Analyzes how well your resume matches the job description requirements
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout - Responsive */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1fr 1fr',
                gap: isMobile ? '15px' : '20px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* LEFT COLUMN: Reports & Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* ATS Best Practices Section Scores */}
                    {result.atsBestPractices && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>✅ ATS Best Practices Analysis</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
                                {result.atsBestPractices.summary && Object.entries(result.atsBestPractices.summary).map(([key, score]) => {
                                    const sectionName = key.replace('Score', '').replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <div key={key} style={{
                                            padding: '10px',
                                            background: score >= 80 ? 'rgba(0, 255, 127, 0.2)' : score >= 60 ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 99, 132, 0.2)',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#ccc', marginBottom: '5px' }}>
                                                {sectionName}
                                            </div>
                                            <div style={{ 
                                                fontSize: isMobile ? '18px' : '24px', 
                                                fontWeight: 'bold',
                                                color: score >= 80 ? '#00ff7f' : score >= 60 ? '#FFA500' : '#ff6384'
                                            }}>
                                                {score}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {result.atsBestPractices.strengths && result.atsBestPractices.strengths.length > 0 && (
                                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0, 255, 127, 0.1)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold', marginBottom: '8px' }}>✨ Strengths:</div>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: isMobile ? '11px' : '12px' }}>
                                        {result.atsBestPractices.strengths.slice(0, 3).map((strength, idx) => (
                                            <li key={idx}>{strength.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>📈 JD Match Breakdown</span>
                        </div>
                        <Bar 
                            data={scoreBreakdownData}
                            key={`bar-score-${result.resumeName}`}
                            redraw={true}
                            options={{
                                responsive: true,
                                maintainAspectRatio: !isMobile,
                                aspectRatio: isMobile ? 1.5 : 2,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.parsed.y.toFixed(1) + '%';
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            color: '#fff',
                                            callback: function(value) {
                                                return value + '%';
                                            }
                                        },
                                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                    },
                                    x: {
                                        ticks: { color: '#fff' },
                                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>🎯 AI Similarity Analysis</span>
                        </div>
                        <Radar 
                            data={similarityComparisonData} 
                            key={`radar-similarity-${result.resumeName}`}
                            redraw={true}
                            options={{
                                responsive: true,
                                maintainAspectRatio: !isMobile,
                                aspectRatio: isMobile ? 1 : 1.5,
                                plugins: {
                                    legend: {
                                        labels: { color: '#fff' }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return context.parsed.r.toFixed(1) + '%';
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    r: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            color: '#fff',
                                            backdropColor: 'transparent',
                                            stepSize: 20,
                                            callback: function(value) {
                                                return value + '%';
                                            }
                                        },
                                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                                        pointLabels: {
                                            color: '#fff',
                                            font: { size: 11 }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Required Skills Match - Always show if we have any skills data */}
                    {(topSkillsToShow.length > 0 || result.skillsMatch || result.technicalMatch) && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>🛠️ Required Skills Match</span>
                            </div>
                            {topSkillsToShow.length > 0 ? (
                                <Bar 
                                    data={skillsMatchData}
                                    key={`bar-skills-${result.resumeName}`}
                                    redraw={true}
                                    options={{
                                        indexAxis: 'y',
                                        responsive: true,
                                        maintainAspectRatio: !isMobile,
                                        aspectRatio: isMobile ? 1.2 : Math.max(1.5, topSkillsToShow.length * 0.15),
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const skill = topSkillsToShow[context.dataIndex];
                                                        const skillStr = typeof skill === 'string' ? skill : (skill.term || skill.name || String(skill));
                                                        const isMatched = context.parsed.x === 100;
                                                        return `${skillStr}: ${isMatched ? '✓ Matched' : '✗ Missing'}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                max: 100,
                                                ticks: {
                                                    color: '#fff',
                                                    stepSize: 50,
                                                    callback: function(value) {
                                                        return value + '%';
                                                    }
                                                },
                                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                            },
                                            y: {
                                                ticks: { 
                                                    color: '#fff',
                                                    font: { size: isMobile ? 10 : 12 }
                                                },
                                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#ccc' }}>
                                    <p>No skills data available for matching.</p>
                                    {result.skillsMatch && (
                                        <div style={{ marginTop: '10px', fontSize: '12px' }}>
                                            Matched: {skillsMatch.matched || 0} / Total: {skillsMatch.totalRequired || 0}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ATS Score Breakdown */}
                    {result.atsBestPractices && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>✅ ATS Score Breakdown</span>
                            </div>
                            <Bar 
                                data={atsBreakdownData}
                                key={`bar-ats-${result.resumeName}`}
                                redraw={true}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: !isMobile,
                                    aspectRatio: isMobile ? 1.5 : 2,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    return context.parsed.y.toFixed(1) + '%';
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100,
                                            ticks: {
                                                color: '#fff',
                                                callback: function(value) {
                                                    return value + '%';
                                                }
                                            },
                                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                        },
                                        x: {
                                            ticks: { color: '#fff', maxRotation: 45, minRotation: 45 },
                                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                        }
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Score Comparison - Side by Side (Not a distribution) */}
                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>📊 Score Comparison</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '15px',
                            marginTop: '15px'
                        }}>
                            {/* JD Match Score Card */}
                            <div style={{
                                padding: '20px',
                                background: 'rgba(0, 214, 255, 0.2)',
                                borderRadius: '12px',
                                border: '2px solid rgba(0, 214, 255, 0.4)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#00d2ff', marginBottom: '10px' }}>
                                    🎯 JD Match Score
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '36px' : '48px',
                                    fontWeight: 'bold',
                                    color: jdMatchScore >= 80 ? '#00ff7f' : jdMatchScore >= 60 ? '#FFA500' : '#ff6384',
                                    marginBottom: '5px'
                                }}>
                                    {jdMatchScore}%
                                </div>
                                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#ccc' }}>
                                    Job Description Match
                                </div>
                            </div>

                            {/* ATS Readability Score Card */}
                            <div style={{
                                padding: '20px',
                                background: 'rgba(0, 255, 127, 0.2)',
                                borderRadius: '12px',
                                border: '2px solid rgba(0, 255, 127, 0.4)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#00ff7f', marginBottom: '10px' }}>
                                    ✅ ATS Readability
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '36px' : '48px',
                                    fontWeight: 'bold',
                                    color: atsReadabilityScore >= 80 ? '#00ff7f' : atsReadabilityScore >= 60 ? '#FFA500' : '#ff6384',
                                    marginBottom: '5px'
                                }}>
                                    {atsReadabilityScore}%
                                </div>
                                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#ccc' }}>
                                    Resume Structure & Format
                                </div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '15px',
                            padding: '10px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            fontSize: isMobile ? '10px' : '11px',
                            color: '#d0d0d0',
                            textAlign: 'center'
                        }}>
                            💡 These are independent scores - not parts of a distribution
                        </div>
                    </div>

                    {/* Technical Match */}
                    {result.technicalMatch && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>⚙️ Technical Requirements</span>
                                <span style={{ marginLeft: 'auto', fontSize: '24px', fontWeight: 'bold', color: result.technicalMatch.score >= 70 ? '#00ff7f' : '#ff6384' }}>
                                    {result.technicalMatch.score}%
                                </span>
                            </div>
                                {result.technicalMatch.matches && Object.entries(result.technicalMatch.matches).slice(0, 3).map(([category, match]) => (
                                <div key={category} style={{ 
                                    marginBottom: isMobile ? '12px' : '15px', 
                                    padding: isMobile ? '8px' : '10px', 
                                    background: 'rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '8px' 
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        marginBottom: '5px',
                                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                                        gap: isMobile ? '5px' : '10px'
                                    }}>
                                        <span style={{ 
                                            textTransform: 'capitalize',
                                            fontSize: isMobile ? '12px' : '14px',
                                            wordBreak: 'break-word'
                                        }}>
                                            {category.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: match.matchRate >= 70 ? '#00ff7f' : '#ff6384',
                                            fontSize: isMobile ? '14px' : '16px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {match.matchRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Recommendations & Improvements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Recommendations Panel */}
                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>💡 Recommendations</span>
                        </div>
                        <div style={{ /* Removed maxHeight and overflowY - show all recommendations */ }}>
                            {allRecommendations.map((rec, idx) => {
                                // Safely extract string values from recommendation object
                                const getStringValue = (value) => {
                                    if (!value) return '';
                                    if (typeof value === 'string') return value;
                                    if (typeof value === 'object') {
                                        // If it's an object, try to extract meaningful string
                                        if (Array.isArray(value)) {
                                            return value.map(v => typeof v === 'string' ? v : String(v)).join(', ');
                                        }
                                        // If object has a message or title property, use that
                                        if (value.message) return String(value.message);
                                        if (value.title) return String(value.title);
                                        // Last resort: don't stringify, return empty to avoid showing JSON
                                        console.warn('Recommendation value is an object without message/title:', value);
                                        return '';
                                    }
                                    return String(value);
                                };

                                // Ensure rec is an object, not a stringified JSON
                                let recommendation = rec;
                                if (typeof rec === 'string') {
                                    try {
                                        recommendation = JSON.parse(rec);
                                    } catch (e) {
                                        recommendation = { message: rec, title: 'Recommendation' };
                                    }
                                }

                                const title = getStringValue(recommendation.title || recommendation.category || 'Recommendation');
                                const message = getStringValue(recommendation.message || '');
                                const description = getStringValue(recommendation.description || '');
                                const action = getStringValue(recommendation.action || '');
                                const priority = getStringValue(recommendation.priority || 'medium');
                                const impact = getStringValue(recommendation.impact || '');
                                const examples = Array.isArray(recommendation.examples) ? recommendation.examples : [];

                                return (
                                    <div key={idx} style={{
                                        ...recommendationCard,
                                        borderLeftColor: priority === 'critical' ? '#ff0000' : priority === 'high' ? '#ff6384' : '#00ffff',
                                        borderLeftWidth: priority === 'critical' ? '5px' : '4px'
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            marginBottom: '10px',
                                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                                            gap: isMobile ? '5px' : '10px'
                                        }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: priority === 'critical' ? '#ff0000' : priority === 'high' ? '#ff6384' : priority === 'medium' ? '#FFA500' : '#00ffff',
                                                borderRadius: '4px',
                                                fontSize: isMobile ? '9px' : '10px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap',
                                                color: '#fff'
                                            }}>
                                                {priority}
                                            </span>
                                            <h4 style={{ 
                                                margin: 0, 
                                                fontSize: isMobile ? '13px' : '15px',
                                                flex: 1,
                                                wordBreak: 'break-word',
                                                fontWeight: 'bold'
                                            }}>{title}</h4>
                                        </div>
                                        
                                        {message && (
                                            <div style={{ 
                                                marginBottom: '8px',
                                                padding: '8px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '6px'
                                            }}>
                                                <p style={{ 
                                                    margin: 0, 
                                                    fontSize: isMobile ? '11px' : '12px', 
                                                    color: '#fff',
                                                    fontWeight: '500',
                                                    wordBreak: 'break-word'
                                                }}>{message}</p>
                                            </div>
                                        )}
                                        
                                        {description && (
                                            <p style={{ 
                                                margin: '8px 0', 
                                                fontSize: isMobile ? '11px' : '12px', 
                                                color: '#d0d0d0',
                                                lineHeight: '1.5',
                                                wordBreak: 'break-word'
                                            }}>{description}</p>
                                        )}
                                        
                                        {action && (
                                            <div style={{ 
                                                marginTop: '10px',
                                                padding: '10px',
                                                background: 'rgba(0, 255, 255, 0.15)',
                                                borderRadius: '6px',
                                                borderLeft: '3px solid #00ffff'
                                            }}>
                                                <div style={{ 
                                                    fontSize: isMobile ? '10px' : '11px', 
                                                    color: '#00ffff', 
                                                    fontWeight: 'bold',
                                                    marginBottom: '5px'
                                                }}>
                                                    💡 Action Required:
                                                </div>
                                                <div style={{ 
                                                    fontSize: isMobile ? '11px' : '12px', 
                                                    color: '#e0e0e0',
                                                    wordBreak: 'break-word',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {action}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {examples && examples.length > 0 && (
                                            <div style={{ 
                                                marginTop: '10px',
                                                padding: '10px',
                                                background: 'rgba(0, 255, 127, 0.1)',
                                                borderRadius: '6px'
                                            }}>
                                                <div style={{ 
                                                    fontSize: isMobile ? '10px' : '11px', 
                                                    color: '#00ff7f', 
                                                    fontWeight: 'bold',
                                                    marginBottom: '8px'
                                                }}>
                                                    📝 Examples:
                                                </div>
                                                {examples.map((example, exIdx) => (
                                                    <div key={exIdx} style={{
                                                        fontSize: isMobile ? '10px' : '11px',
                                                        color: '#d0d0d0',
                                                        marginBottom: '4px',
                                                        fontFamily: 'monospace',
                                                        wordBreak: 'break-word',
                                                        paddingLeft: example.startsWith('•') || example.startsWith('-') ? '0' : '10px'
                                                    }}>
                                                        {example}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {impact && (
                                            <div style={{ 
                                                marginTop: '8px',
                                                fontSize: isMobile ? '10px' : '11px',
                                                color: '#FFA500',
                                                fontStyle: 'italic'
                                            }}>
                                                ⚠️ Impact: {impact}
                                            </div>
                                        )}
                                        
                                        {recommendation.keywords && Array.isArray(recommendation.keywords) && recommendation.keywords.length > 0 && (
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#ccc', marginBottom: '5px' }}>Keywords to add:</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {recommendation.keywords.slice(0, 8).map((kw, kIdx) => (
                                                        <span key={kIdx} style={{
                                                            padding: '4px 10px',
                                                            background: 'rgba(0, 255, 255, 0.25)',
                                                            borderRadius: '12px',
                                                            fontSize: isMobile ? '9px' : '10px',
                                                            border: '1px solid rgba(0, 255, 255, 0.4)'
                                                        }}>
                                                            {typeof kw === 'string' ? kw : String(kw)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {recommendation.skills && Array.isArray(recommendation.skills) && recommendation.skills.length > 0 && (
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#ccc', marginBottom: '5px' }}>Skills to add:</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {recommendation.skills.slice(0, 8).map((skill, sIdx) => (
                                                        <span key={sIdx} style={{
                                                            padding: '4px 10px',
                                                            background: 'rgba(0, 255, 127, 0.25)',
                                                            borderRadius: '12px',
                                                            fontSize: isMobile ? '9px' : '10px',
                                                            border: '1px solid rgba(0, 255, 127, 0.4)'
                                                        }}>
                                                            {typeof skill === 'string' ? skill : String(skill)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {allRecommendations.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>
                                    ✅ No recommendations - Your resume looks good!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawbacks Panel */}
                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>⚠️ Drawbacks & Issues</span>
                        </div>
                        <div style={{ /* Show all drawbacks - no scroll limit */ }}>
                            {drawbacks.map((drawback, idx) => (
                                <div key={idx} style={drawbackCard}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        marginBottom: '8px',
                                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                                        gap: isMobile ? '5px' : '10px'
                                    }}>
                                        <span style={{
                                            padding: '3px 8px',
                                            background: drawback.impact === 'Critical' ? '#ff0000' : '#ff6384',
                                            borderRadius: '4px',
                                            fontSize: isMobile ? '9px' : '10px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {drawback.impact}
                                        </span>
                                        <h4 style={{ 
                                            margin: 0, 
                                            fontSize: isMobile ? '12px' : '14px',
                                            flex: 1,
                                            wordBreak: 'break-word'
                                        }}>{drawback.category}</h4>
                                    </div>
                                    <ul style={{ 
                                        margin: '5px 0 0 0', 
                                        paddingLeft: '20px', 
                                        fontSize: isMobile ? '11px' : '12px' 
                                    }}>
                                        {drawback.items.map((item, i) => (
                                            <li key={i} style={{ 
                                                marginBottom: '3px',
                                                wordBreak: 'break-word'
                                            }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            {drawbacks.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>
                                    ✅ No major drawbacks found!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Boost ATS Score Panel */}
                    <div style={panelStyle}>
                        <div style={panelHeader}>
                            <span>🚀 How to Boost Your ATS Score</span>
                        </div>
                        <div style={{ /* Show all boost tips - no scroll limit */ }}>
                            {boostTips.map((tip, idx) => (
                                <div key={idx} style={boostTipCard}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        marginBottom: '8px',
                                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                                        gap: isMobile ? '5px' : '10px'
                                    }}>
                                        <h4 style={{ 
                                            margin: 0, 
                                            fontSize: isMobile ? '12px' : '14px',
                                            flex: 1,
                                            wordBreak: 'break-word'
                                        }}>{tip.title}</h4>
                                        <span style={{
                                            padding: '3px 8px',
                                            background: 'rgba(0, 255, 127, 0.5)',
                                            borderRadius: '4px',
                                            fontSize: isMobile ? '10px' : '11px',
                                            fontWeight: 'bold',
                                            color: '#000',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {tip.impact}
                                        </span>
                                    </div>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: isMobile ? '11px' : '12px', 
                                        color: '#e0e0e0',
                                        wordBreak: 'break-word'
                                    }}>{tip.description}</p>
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '5px 10px',
                                        background: 'rgba(0, 255, 127, 0.2)',
                                        borderRadius: '4px',
                                        fontSize: isMobile ? '9px' : '10px',
                                        display: 'inline-block'
                                    }}>
                                        Priority: {tip.priority}
                                    </div>
                                </div>
                            ))}
                            {boostTips.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>
                                    ✅ Your resume is already optimized!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Missing Skills Quick View */}
                    {result.skillsMatch && result.skillsMatch.missingSkills.length > 0 && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>❌ Missing Skills ({result.skillsMatch.missingSkills.length})</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px' : '8px' }}>
                                {result.skillsMatch.missingSkills.slice(0, 12).map((skill, idx) => (
                                    <span key={idx} style={{
                                        padding: isMobile ? '4px 8px' : '6px 12px',
                                        background: 'rgba(255, 99, 132, 0.3)',
                                        borderRadius: '12px',
                                        fontSize: isMobile ? '10px' : '12px',
                                        color: '#fff',
                                        wordBreak: 'break-word'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matched Skills Quick View */}
                    {result.skillsMatch && result.skillsMatch.matchedSkills.length > 0 && (
                        <div style={panelStyle}>
                            <div style={panelHeader}>
                                <span>✅ Matched Skills ({result.skillsMatch.matchedSkills.length})</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px' : '8px' }}>
                                {result.skillsMatch.matchedSkills.slice(0, 12).map((skill, idx) => (
                                    <span key={idx} style={{
                                        padding: isMobile ? '4px 8px' : '6px 12px',
                                        background: 'rgba(0, 255, 127, 0.3)',
                                        borderRadius: '12px',
                                        fontSize: isMobile ? '10px' : '12px',
                                        color: '#fff',
                                        wordBreak: 'break-word'
                                    }}>
                                        ✓ {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ResultPage;
