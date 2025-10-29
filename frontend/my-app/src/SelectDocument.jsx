
import React, { useState, useEffect } from 'react';
import logoLight from './assets/AppLogoLightTheme.png';
import logoDark from './assets/AppLogoDarkTheme.png';
import ad1 from './assets/ads/Ad1.jpeg';
import ad2 from './assets/ads/Ad2.jpeg';

export default function SelectDocument({ onSelect, isDarkMode }) {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAd, setCurrentAd] = useState(0);

  const ads = [ad1, ad2];

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    fetch(`${apiBaseUrl}/journals`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch journals');
        return res.json();
      })
      .then(data => {
        setJournals(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  return (
    <div className="landing-page">
      {/* Advertisement Banner */}
      <div className={`ad-banner ${isDarkMode ? 'dark' : ''}`}>
        <div className="ad-container">
          <img 
            src={ads[currentAd]} 
            alt="Advertisement" 
            className="ad-image"
          />
        </div>
      </div>
      
      {/* Centered Logo and Subtitle */}
      <div className="logo-section">
        <img src={isDarkMode ? logoDark : logoLight} alt="App Logo" className="app-logo" />
        {/* <h1 className="tagline">MEDICAL INTERACTIONS MADE SIMPLE</h1> */}
      </div>
      
      
      <p className="description-text">Ask questions to any document</p>
      {loading ? (
        <div className="loading-text">Loading journals...</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : (
        <div className="document-cards">
          {journals.map(doc => (
            <div key={doc.id} className="document-card">
              <img src={doc.img} alt={doc.title} />
              <h2>{doc.title}</h2>
              <p>{doc.desc}</p>
              <button onClick={() => onSelect(doc.id)} className={!isDarkMode ? 'light-theme-button' : ''}>SELECT</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
