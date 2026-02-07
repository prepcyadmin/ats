import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import ResultPage from './components/ResultPage';
import AdminDashboard from './components/AdminDashboard';
import { normalizeApiUrl } from './config/api.js';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check window size for mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if admin page should be shown (only via URL routes)
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Only show admin if explicitly in URL (hash, path, or query param)
    if (hash === '#admin' || path === '/admin' || params.get('page') === 'admin') {
      setShowAdmin(true);
    } else {
      setShowAdmin(false);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setShowAdmin(true);
      } else {
        setShowAdmin(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = async () => {
    if (!file || !jobDescription) {
      alert('Please upload a resume and enter job description');
      return;
    }

    if (jobDescription.length < 50) {
      alert('Job description must be at least 50 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const API_URL = normalizeApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');
      
      const response = await fetch(`${API_URL}/resumes/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze resume');
      }
      
      // Get the first (and only) result
      if (data.data && data.data.result) {
        setResult(data.data.result);
      } else if (data.data && data.data.results && data.data.results.length > 0) {
        setResult(data.data.results[0]);
      } else {
        throw new Error('No analysis result received');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  // Show admin dashboard if requested
  if (showAdmin) {
    return <AdminDashboard />;
  }

  // If we have results, show the report
  if (result) {
    return (
      <div>
        <ResultPage result={result} onReset={handleReset} />
      </div>
    );
  }

  // Show upload form
  return (
    <div className="upload-container">
      <div style={{
        textAlign: 'center',
        marginBottom: isMobile ? '20px' : '35px',
        padding: isMobile ? '0 10px' : '0 20px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '18px' : 'clamp(24px, 4vw, 36px)',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: isMobile ? '8px' : '12px',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          letterSpacing: isMobile ? '0.3px' : '0.5px',
          lineHeight: isMobile ? '1.3' : '1.4'
        }}>
          AI ATS Scanner - AI Graph Analysis
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontSize: isMobile ? '11px' : 'clamp(12px, 1.8vw, 16px)',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          maxWidth: isMobile ? '100%' : '600px',
          margin: '0 auto',
          lineHeight: isMobile ? '1.4' : '1.6',
          padding: isMobile ? '0 5px' : '0'
        }}>
          Upload your resume and job description to get an instant ATS analysis
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '12px' : '20px',
        maxWidth: isMobile ? '100%' : '1100px',
        margin: isMobile ? '0 auto 20px' : '0 auto 30px',
        width: '100%',
        padding: isMobile ? '0 10px' : '0 20px',
        boxSizing: 'border-box'
      }} className="inputs-grid">
        <ResumeUpload onFileChange={setFile} />
        <JobDescription onJobDescriptionChange={setJobDescription} />
      </div>
      
      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          textAlign: 'center', 
          margin: '0 auto 30px',
          padding: '15px 20px',
          background: 'rgba(255, 107, 107, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 107, 107, 0.4)',
          maxWidth: '600px',
          backdropFilter: 'blur(10px)'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        textAlign: 'center',
        marginTop: '30px',
        padding: '0 20px'
      }}>
        <button
          onClick={handleSubmit}
          className="compare-btn"
          disabled={loading || !file || !jobDescription || jobDescription.length < 50}
          style={{
            opacity: (loading || !file || !jobDescription || jobDescription.length < 50) ? 0.6 : 1,
            cursor: (loading || !file || !jobDescription || jobDescription.length < 50) ? 'not-allowed' : 'pointer',
            minWidth: isMobile ? '100%' : '200px',
            maxWidth: isMobile ? '100%' : 'none',
            padding: isMobile ? '12px 24px' : '14px 32px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '700',
            letterSpacing: isMobile ? '0.3px' : '0.5px',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
}

export default App;
