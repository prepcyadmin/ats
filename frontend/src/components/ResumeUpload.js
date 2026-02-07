import React, { useState, useEffect } from 'react';

const ResumeUpload = ({ onFileChange }) => {
  const [file, setFile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const containerStyle = {
    width: '100%',
    padding: isMobile ? '8px' : '15px',
    borderRadius: isMobile ? '6px' : '12px',
    background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.12) 0%, rgba(0, 214, 255, 0.08) 100%)',
    boxShadow: '0 8px 32px rgba(0, 255, 127, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 255, 127, 0.3)',
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
    fontSize: isMobile ? '11px' : '16px',
    marginBottom: isMobile ? '6px' : '12px',
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
    textShadow: '0 2px 10px rgba(0, 255, 127, 0.5)',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  };

  const inputWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: isMobile ? '6px' : '15px',
    minHeight: isMobile ? '80px' : '160px'
  };

  const uploadButtonStyle = {
    background: 'linear-gradient(135deg, #00ff7f 0%, #00d2ff 100%)',
    color: '#000',
    padding: isMobile ? '6px 10px' : '12px 24px',
    borderRadius: isMobile ? '5px' : '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '10px' : '14px',
    fontWeight: '700',
    transition: 'all 0.3s ease-in-out',
    width: '100%',
    maxWidth: isMobile ? '100%' : '280px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 255, 127, 0.4)',
    letterSpacing: isMobile ? '0.05px' : '0.3px'
  };

  const listStyle = {
    listStyleType: 'none',
    paddingLeft: 0,
    textAlign: 'center',
  };

  const itemStyle = {
    padding: '6px 0',
    fontSize: '16px',
    color: '#e0e0e0',
  };

  return (
    <div style={containerStyle}>
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '90px',
          height: '90px',
          background: 'radial-gradient(circle, rgba(0, 255, 127, 0.2) 0%, transparent 70%)',
          borderRadius: '0 20px 0 100%'
        }} />
      )}
      
      <h2 style={headingStyle}>
        <span style={{
          width: isMobile ? '20px' : '36px',
          height: isMobile ? '20px' : '36px',
          borderRadius: isMobile ? '5px' : '10px',
          background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.3), rgba(0, 214, 255, 0.3))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '10px' : '18px',
          boxShadow: '0 4px 15px rgba(0, 255, 127, 0.3)'
        }}>📄</span>
        <span>Upload Resume</span>
      </h2>
      
      <div style={inputWrapperStyle}>
        <label 
          htmlFor="file-upload" 
          style={uploadButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 255, 127, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 255, 127, 0.4)';
          }}
        >
          Choose Resume (PDF, DOCX, TXT)
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {file && (
          <div style={{
            ...itemStyle,
            padding: '12px 20px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '100%',
            wordBreak: 'break-word',
            fontSize: isMobile ? '10px' : '14px',
            fontWeight: '500'
          }}>
            ✓ {file.name}
          </div>
        )}
        {!file && (
          <div style={{
            fontSize: isMobile ? '8px' : '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            marginTop: isMobile ? '3px' : '10px'
          }}>
            Supported formats: PDF, DOCX, TXT
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
