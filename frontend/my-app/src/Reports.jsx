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

  const queryOptions = {
    title: 'Questions Asked Month Wise',
    titleTextStyle: { color: 'var(--text-primary)', fontSize: 16, fontWeight: 'normal' },
    hAxis: { 
      title: 'Month', 
      titleTextStyle: { color: 'var(--text-primary)', fontWeight: 'normal' },
      textStyle: { color: 'var(--text-secondary)', fontWeight: 'normal' }
    },
    vAxis: { 
      title: 'Number of Questions', 
      titleTextStyle: { color: 'var(--text-primary)', fontWeight: 'normal' },
      textStyle: { color: 'var(--text-secondary)', fontWeight: 'normal' }
    },
    colors: ['#007bff'],
    legend: { position: 'none' },
    backgroundColor: 'var(--bg-secondary)',
    chartArea: { backgroundColor: 'var(--bg-secondary)' },
  };

  const popularityOptions = {
    title: 'Document Popularity Distribution',
    titleTextStyle: { color: 'var(--text-primary)', fontSize: 16, fontWeight: 'normal' },
    is3D: true,
    pieSliceText: 'percentage',
    pieSliceTextStyle: { color: 'var(--text-primary)', fontSize: 14, fontWeight: 'normal' },
    colors: ['#ff6b35', '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
    legend: { 
      position: 'right', 
      textStyle: { color: 'var(--text-primary)', fontWeight: 'normal' }
    },
    backgroundColor: 'var(--bg-secondary)',
    chartArea: { backgroundColor: 'var(--bg-secondary)' },
  };

  return (
    <div className="reports-container">
      {!sidebarExpanded && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      <h1 className="reports-header">Reports Dashboard</h1>

      <div className={`reports-grid ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <div className="reports-card">
          <div className="reports-card-content">
            <div className="reports-chart-container">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="100%"
                data={queryData}
                options={queryOptions}
              />
            </div>
          </div>
        </div>

        <div className="reports-card">
          <div className="reports-card-content">
            <div className="reports-chart-container">
              <Chart
                chartType="PieChart"
                width="100%"
                height="100%"
                data={popularityData}
                options={popularityOptions}
              />
            </div>
          </div>
        </div>

        <div className="reports-card">
          <div className="reports-card-content">
            <div className="reports-list-container">
              <h3 className="reports-list-title">Top 10 Asked Questions</h3>
              <ul className="reports-list">
                <li className="reports-list-item">1. What is the main indication or clinical use of the product?</li>
                <li className="reports-list-item">2. Are there any recent clinical studies supporting the product's efficacy?</li>
                <li className="reports-list-item">3. What are the primary advantages of this product over competitors?</li>
                <li className="reports-list-item">4. What is the recommended dosage, route, and duration for this medication?</li>
                <li className="reports-list-item">5. What are the most common side effects and safety warnings I should know about?</li>
                <li className="reports-list-item">6. What are the first-line antibiotics recommended for common bacterial infections in India?</li>
                <li className="reports-list-item">7. What are the diagnostic criteria and recommended management for acute rheumatic fever?</li>
                <li className="reports-list-item">8. What principles should be followed for starting empirical antibiotic treatment when the diagnosis is unclear?</li>
                <li className="reports-list-item">9. What are the protocols for antimicrobial prophylaxis in surgical procedures or specific diseases?</li>
                <li className="reports-list-item">10. How do the guidelines address the rational use of antimicrobials to combat antimicrobial resistance?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-footer">
        {/* Footer content can be added here */}
      </div>
    </div>
  );
}