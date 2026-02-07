import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Define styles at the top
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const statCardStyle = {
    ...cardStyle,
    textAlign: 'center',
    padding: '25px'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #ff00a8, #00d2ff)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setLastRefresh(new Date());
      } else {
        setError(data.error?.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      return;
    }
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/v1/admin/reset`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('Statistics reset successfully');
        fetchStats();
      } else {
        alert('Failed to reset statistics');
      }
    } catch (err) {
      alert('Error resetting statistics: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#ff6b6b' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>Error: {error}</div>
          <button onClick={fetchStats} style={buttonStyle}>Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Prepare chart data
  const last30DaysData = {
    labels: stats.last30Days.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Searches',
        data: stats.last30Days.map(d => d.searches),
        backgroundColor: 'rgba(0, 255, 127, 0.6)',
        borderColor: '#00ff7f',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Users',
        data: stats.last30Days.map(d => d.users),
        backgroundColor: 'rgba(0, 214, 255, 0.6)',
        borderColor: '#00d2ff',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const last24HoursData = {
    labels: stats.last24Hours.map(d => `${d.hour}:00`),
    datasets: [{
      label: 'Searches per Hour',
      data: stats.last24Hours.map(d => d.searches),
      backgroundColor: 'rgba(138, 43, 226, 0.6)',
      borderColor: '#8a2be2',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  const fileTypesData = {
    labels: Object.keys(stats.fileTypes),
    datasets: [{
      data: Object.values(stats.fileTypes),
      backgroundColor: [
        'rgba(0, 255, 127, 0.8)',
        'rgba(0, 214, 255, 0.8)',
        'rgba(138, 43, 226, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 165, 0, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ ...cardStyle, marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <a 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = '';
                    window.location.reload();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ← Back to Home
                </a>
              </div>
              <h1 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '36px', fontWeight: '700' }}>
                📊 Admin Dashboard
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button onClick={fetchStats} style={buttonStyle}>
                🔄 Refresh
              </button>
              <button onClick={handleReset} style={{ ...buttonStyle, background: 'linear-gradient(135deg, #ff6384, #ffa500)' }}>
                🔁 Reset Stats
              </button>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
              {stats.totalUsers.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Users</div>
          </div>

          <div style={statCardStyle}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
              {stats.totalSearches.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Total Searches</div>
          </div>

          <div style={statCardStyle}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
              {stats.averageScores.ats}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Avg ATS Score</div>
          </div>

          <div style={statCardStyle}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
              {stats.averageScores.jd}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Avg JD Match Score</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          {/* Last 30 Days Chart */}
          <div style={cardStyle}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>Last 30 Days Activity</h2>
            <Line 
              data={last30DaysData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    labels: { color: '#fff' }
                  }
                },
                scales: {
                  x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                }
              }}
            />
          </div>

          {/* Last 24 Hours Chart */}
          <div style={cardStyle}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>Last 24 Hours Traffic</h2>
            <Bar 
              data={last24HoursData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* File Types Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          <div style={cardStyle}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>File Types Distribution</h2>
            {Object.keys(stats.fileTypes).length > 0 ? (
              <Doughnut 
                data={fileTypesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#fff', padding: 15 }
                    }
                  }
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '40px' }}>
                No file type data available yet
              </div>
            )}
          </div>

          {/* File Types List */}
          <div style={cardStyle}>
            <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>File Types Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(stats.fileTypes).map(([type, count]) => (
                <div key={type} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px'
                }}>
                  <span style={{ color: '#fff', fontSize: '18px', fontWeight: '600', textTransform: 'uppercase' }}>
                    {type}
                  </span>
                  <span style={{ color: '#00ff7f', fontSize: '20px', fontWeight: 'bold' }}>
                    {count}
                  </span>
                </div>
              ))}
              {Object.keys(stats.fileTypes).length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '20px' }}>
                  No file type data available yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
