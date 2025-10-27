import React from 'react';
import { Chart } from 'react-google-charts';

export default function Reports({ sidebarExpanded, toggleSidebar, isDarkMode }) {
  // Dummy data for monthly questions asked
  const queryData = [
    ['Month', 'Questions Asked'],
    ['Jan', 120],
    ['Feb', 135],
    ['Mar', 150],
    ['Apr', 165],
    ['May', 180],
    ['Jun', 195],
  ];

  // Dummy data for document popularity
  const popularityData = [
    ['Document', 'Views'],
    ['Medical Guidelines', 450],
    ['Research Papers', 380],
    ['Clinical Studies', 320],
    ['Patient Records', 290],
    ['Drug Information', 250],
    ['Lab Results', 200],
  ];
  const theme = isDarkMode ? {
    backgroundColor: '#1a1a1a',
    chartAreaBg: '#1a1a1a',
    titleColor: '#ffffff',
    textColor: '#cccccc',
    borderColor: '#333',
    containerBg: '#1a1a1a',
    pageBg: '#0f0f0f',
    pageText: '#ffffff',
    footerText: '#cccccc'
  } : {
    backgroundColor: '#ffffff',
    chartAreaBg: '#ffffff',
    titleColor: '#212529',
    textColor: '#6c757d',
    borderColor: '#dee2e6',
    containerBg: '#ffffff',
    pageBg: '#ffffff',
    pageText: '#212529',
    footerText: '#6c757d'
  };

  const queryOptions = {
    title: 'Questions Asked Month Wise',
    titleTextStyle: { color: theme.titleColor, fontSize: 16, fontWeight: 'normal' },
    hAxis: { 
      title: 'Month', 
      titleTextStyle: { color: theme.titleColor, fontWeight: 'normal' },
      textStyle: { color: theme.textColor, fontWeight: 'normal' }
    },
    vAxis: { 
      title: 'Number of Questions', 
      titleTextStyle: { color: theme.titleColor, fontWeight: 'normal' },
      textStyle: { color: theme.textColor, fontWeight: 'normal' }
    },
    colors: ['#007bff'],
    legend: { position: 'none' },
    backgroundColor: theme.backgroundColor,
    chartArea: { backgroundColor: theme.chartAreaBg },
  };

  const popularityOptions = {
    title: 'Document Popularity Distribution',
    titleTextStyle: { color: theme.titleColor, fontSize: 16, fontWeight: 'normal' },
    is3D: true,
    pieSliceText: 'percentage',
    pieSliceTextStyle: { color: theme.titleColor, fontSize: 14, fontWeight: 'normal' },
    colors: ['#ff6b35', '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
    legend: { 
      position: 'right', 
      textStyle: { color: theme.titleColor, fontWeight: 'normal' }
    },
    backgroundColor: theme.backgroundColor,
    chartArea: { backgroundColor: theme.chartAreaBg },
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', backgroundColor: theme.pageBg, color: theme.pageText, minHeight: '100vh' }}>
      {!sidebarExpanded && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: theme.pageText, fontWeight: 'normal' }}>Reports Dashboard</h1>

      <div style={{ 
        display: sidebarExpanded ? 'grid' : 'flex', 
        gridTemplateColumns: sidebarExpanded ? '1fr' : undefined, 
        flexWrap: sidebarExpanded ? undefined : 'wrap',
        justifyContent: sidebarExpanded ? undefined : 'center',
        gap: '2rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          border: `1px solid ${theme.borderColor}`, 
          borderRadius: '8px', 
          padding: '1rem', 
          backgroundColor: theme.containerBg,
          minHeight: '400px'
        }}>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="350px"
            data={queryData}
            options={queryOptions}
          />
        </div>

        <div style={{ 
          border: `1px solid ${theme.borderColor}`, 
          borderRadius: '8px', 
          padding: '1rem', 
          backgroundColor: theme.containerBg,
          minHeight: '400px'
        }}>
          <Chart
            chartType="PieChart"
            width="100%"
            height="350px"
            data={popularityData}
            options={popularityOptions}
          />
        </div>

        <div style={{ 
          border: `1px solid ${theme.borderColor}`, 
          borderRadius: '8px', 
          padding: '1rem', 
          backgroundColor: theme.containerBg,
          minHeight: '400px'
        }}>
          <div style={{ height: '350px', overflowY: 'auto', fontSize: '0.8rem', color: theme.textColor }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: theme.titleColor }}>Top 10 Asked Questions</h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>1. What is the main indication or clinical use of the product?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>2. Are there any recent clinical studies supporting the product's efficacy?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>3. What are the primary advantages of this product over competitors?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>4. What is the recommended dosage, route, and duration for this medication?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>5. What are the most common side effects and safety warnings I should know about?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>6. What are the first-line antibiotics recommended for common bacterial infections in India?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>7. What are the diagnostic criteria and recommended management for acute rheumatic fever?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>8. What principles should be followed for starting empirical antibiotic treatment when the diagnosis is unclear?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>9. What are the protocols for antimicrobial prophylaxis in surgical procedures or specific diseases?</li>
              <li style={{ fontSize: '1rem', color: theme.textColor }}>10. How do the guidelines address the rational use of antimicrobials to combat antimicrobial resistance?</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: theme.footerText, fontSize: '0.9rem', fontWeight: 'normal' }}>
      </div>
    </div>
  );
}