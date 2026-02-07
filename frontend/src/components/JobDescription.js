import React, { useState } from 'react';

const JobDescription = ({ onJobDescriptionChange }) => {
  const [jobDescription, setJobDescription] = useState("");

  const handleChange = (e) => {
    setJobDescription(e.target.value);
    onJobDescriptionChange(e.target.value);
  };

  const containerStyle = {
    width: '100%',
    padding: '25px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(0, 214, 255, 0.12) 0%, rgba(138, 43, 226, 0.08) 100%)',
    boxShadow: '0 8px 32px rgba(0, 214, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 214, 255, 0.3)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const headingStyle = {
    fontSize: '18px',
    marginBottom: '18px',
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
    textShadow: '0 2px 10px rgba(0, 214, 255, 0.5)',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '180px',
    padding: '14px',
    fontSize: '14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    resize: 'vertical',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
    outline: 'none',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s ease',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    flex: 1
  };

  return (
    <div style={containerStyle}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '90px',
        height: '90px',
        background: 'radial-gradient(circle, rgba(0, 214, 255, 0.2) 0%, transparent 70%)',
        borderRadius: '0 20px 0 100%'
      }} />
      
      <h2 style={headingStyle}>
        <span style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0, 214, 255, 0.3), rgba(138, 43, 226, 0.3))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 4px 15px rgba(0, 214, 255, 0.3)'
        }}>📋</span>
        <span>Job Description</span>
      </h2>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          placeholder="Paste or type the job description here..."
          value={jobDescription}
          onChange={handleChange}
          style={textareaStyle}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(0, 214, 255, 0.5)';
            e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(0, 214, 255, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.1)';
          }}
        />
        
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: jobDescription.length >= 50 ? 'rgba(0, 255, 127, 0.9)' : 'rgba(255, 255, 255, 0.7)',
          textAlign: 'right',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '5px'
        }}>
          {jobDescription.length > 0 ? (
            <>
              <span>{jobDescription.length} characters</span>
              {jobDescription.length >= 50 && <span>✓</span>}
            </>
          ) : (
            'Minimum 50 characters required'
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
