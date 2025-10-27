
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
            <div style={{ textAlign: 'center', margin: '0 0 0.5rem 0', position: 'relative', backgroundColor: isDarkMode ? '#333' : '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
        <div style={{
          display: 'inline-block',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '728px',
          width: '100%'
        }}>
          <img 
            src={ads[currentAd]} 
            alt="Advertisement" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              display: 'block',
              transition: 'opacity 0.5s ease-in-out'
            }} 
          />
        </div>
      </div>
      
      {/* Centered Logo and Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
        <img src={isDarkMode ? logoDark : logoLight} alt="App Logo" style={{ maxWidth: '500px', height: 'auto', marginBottom: '0.5rem' }} />
        {/* <h1 style={{ fontWeight: 'bold', fontSize: '0.8rem', margin: '0', color: 'lightgray', position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'left', width: '400px' }}>MEDICAL INTERACTIONS MADE SIMPLE</h1> */}
      </div>
      
      
      <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Ask questions to any document</p>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading journals...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red', marginTop: '2rem' }}>{error}</div>
      ) : (
        <div className="document-cards">
          {journals.map(doc => (
            <div key={doc.id} className="document-card">
              <img src={doc.img} alt={doc.title} />
              <h2>{doc.title}</h2>
              <p>{doc.desc}</p>
              <button onClick={() => onSelect(doc.id)} style={ !isDarkMode ? { backgroundColor: '#2d3279', color: 'white' } : {} }>SELECT</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
