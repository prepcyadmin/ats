import React from 'react';
import { Link } from 'react-router-dom';

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 20px',
};

const titleStyle = {
  color: '#fff',
  fontSize: '32px',
  marginBottom: '30px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
};

const cardStyle = {
  width: '100%',
  maxWidth: '600px',
  margin: '15px 0',
  padding: '25px 30px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.15)', // Slight transparent background
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.2)',
  backdropFilter: 'blur(15px)',  // Optional: You can adjust or remove the blur effect if necessary
  WebkitBackdropFilter: 'blur(15px)', // For Safari support
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#fff',
};

const linkStyle = {
  display: 'inline-block',
  marginTop: '12px',
  color: '#00ffff',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'color 0.3s',
};

const backStyle = {
  ...linkStyle,
  marginTop: '40px',
};

const Result = ({ results }) => {
  if (!results || results.length === 0)
    return (
      <div style={pageStyle}>
        <p style={{ color: '#fff' }}>No results found.</p>
        <Link to="/" style={backStyle}>← Go back</Link>
      </div>
    );

  const sortedResults = [...results].sort(
    (a, b) => b.matchPercentage - a.matchPercentage
  );

  return (
    <div style={pageStyle}>
      <h2 style={titleStyle}>Ranked Results</h2>

      {sortedResults.map((result, index) => (
        <div key={index} style={cardStyle}>
          <p style={{ fontSize: '18px', marginBottom: '6px' }}>
            <strong>{result.resumeName}</strong>
          </p>
          <p style={{ margin: 0 }}>Score: {result.matchPercentage !== undefined ? result.matchPercentage : 'N/A'}</p>
          <p style={{ margin: 0 }}>
            Cosine Similarity: {result.cosineSimilarity !== undefined ? result.cosineSimilarity : 'N/A'}
          </p>
          <p style={{ margin: 0 }}>
            Keyword Match Score: {result.keywordMatchScore !== undefined ? result.keywordMatchScore : 'N/A'}%
          </p>

          <Link
            to={`/result/${index}`}
            style={linkStyle}
            onMouseOver={(e) => (e.target.style.color = '#ffffff')}
            onMouseOut={(e) => (e.target.style.color = '#00ffff')}
          >
            View Details →
          </Link>
        </div>
      ))}

      <Link
        to="/"
        style={backStyle}
        onMouseOver={(e) => (e.target.style.color = '#ffffff')}
        onMouseOut={(e) => (e.target.style.color = '#00ffff')}
      >
        ← Go back
      </Link>
    </div>
  );
};

export default Result;
