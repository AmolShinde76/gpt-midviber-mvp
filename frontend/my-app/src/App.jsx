import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiSend } from 'react-icons/fi';
import './App.css';
import logoLight from './assets/AppLogoLightTheme.png';
import logoDark from './assets/AppLogoDarkTheme.png';
import AppLogoSidebarLightTheme from './assets/AppLogoSidebarLightTheme.png';
import { useNavigate, Routes, Route, useParams, useLocation } from 'react-router-dom';

// AnswerText component to make page number clickable
function AnswerText({ text, onPageClick }) {
  const match = text.match(/Page no: (\d+)/);
  if (match) {
    const pageNum = parseInt(match[1], 10);
    const textWithoutPage = text.replace(/Page no: \d+/, '');
    return (
      <>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {textWithoutPage}
        </ReactMarkdown>
        <span
          style={{ color: '#ff914d', cursor: 'pointer', fontWeight: 'bold', marginLeft: 8 }}
          onClick={() => onPageClick(pageNum)}
        >
          Page no: {pageNum}
        </span>
      </>
    );
  }
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
}

// Typing Animation Component
const TypingAnimation = ({ text, speed = 8 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayedText}
    </ReactMarkdown>
  );
};

// Main Chat Component
const ChatApp = ({ 
  selectedDoc, 
  onPageClick, 
  journals, 
  onDocumentSelect, 
  sidebarExpanded, 
  toggleSidebar, 
  isMobile,
  // Chat state props
  question,
  setQuestion,
  results,
  setResults,
  isLoading,
  setIsLoading,
  error,
  setError,
  hasAskedFirstQuestion,
  setHasAskedFirstQuestion,
  resultsEndRef,
  handleSubmit,
  handleCardClick,
  handleReferenceClick
}) => {

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {!sidebarExpanded && window.innerWidth > 767 && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}
      

      {/* Initial Welcome Panel */}
      {!hasAskedFirstQuestion && (
        <div className="welcome-container">
          <div className="welcome-message">
            <h2>Hi 👋 I'm your AI assistant</h2>
            <p>Feel free to ask me anything about this document!</p>
          </div>
          <div className="question-cards">
            {(() => {
              const currentJournal = journals.find(j => j.id === selectedDoc);
              const defaultQuestions = currentJournal?.defaultDocumentQuestions || [];
              return (
                <>
                  {defaultQuestions.map((q) => (
                    <button
                      key={q.id}
                      className="question-card"
                      onClick={() => handleCardClick(q.Question)}
                      disabled={isLoading}
                    >
                      {q.Question}
                    </button>
                  ))}
                  <button
                    className="question-card"
                    onClick={() => setHasAskedFirstQuestion(true)}
                    disabled={isLoading}
                  >
                    💬 Ask your own question
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="results-container">
          {/* Show completed Q&A pairs first */}
          {results.map((result) => (
            <div key={result.id} className="result-item">
              <div className="question">{result.question}</div>

              {/* Show references if any */}
              {result.references && result.references.length > 0 && (
                <div className="references-box">
                  <div className="references-title">📄 References</div>
                  <div className="references-list">
                    {result.references.map((ref, index) => (
                      <div
                        key={index}
                        className="reference-item clickable"
                        onClick={() => handleReferenceClick(ref.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="reference-name">{ref.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show answer */}
              <div className="answer">
                {result.isLoading ? (
                  <div className="thinking-animation">
                    <div className="thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                ) : result.id === results[results.length - 1]?.id && !isLoading ? (
                  <TypingAnimation text={result.answer} />
                ) : (
                  <AnswerText text={result.answer} onPageClick={onPageClick} />
                )}
              </div>

              {/* Show total tokens only when available */}
              {result.total_tokens !== 'N/A' && (
                <div className="tokens-info">
                  <span className="tokens-text">Total tokens used: {result.total_tokens}</span>
                </div>
              )}
            </div>
          ))}

          <div ref={resultsEndRef} />
        </div>
      )}

      {/* Sticky Search Form */}
      {hasAskedFirstQuestion && (
        <form className={`sticky-search-container ${sidebarExpanded ? 'sidebar-expanded' : ''}`} onSubmit={handleSubmit}>
          <textarea
            placeholder="Ask another question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={2}
            className="search-input"
            aria-label="Ask a question about your documents"
          />
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? '⏳' : <FiSend size={18} />}
          </button>
        </form>
      )}
    </>
  );
};
import SelectDocument from './SelectDocument';
import DocumentChat from './DocumentChat';
import Reports from './Reports';

// ChatPage component
const ChatPage = ({ journals, onPageClick, onDocumentSelect, sidebarExpanded, toggleSidebar, isMobile }) => {
  const { docId } = useParams();
  // Mobile section state: 'chat', 'pdf'
  const [mobileSection, setMobileSection] = useState('chat');
  // Chat state - lifted from ChatApp to persist across mobile section switches
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);

  const resultsEndRef = useRef(null);

  // Clear chat when document changes and ensure mobile view shows chat section
  useEffect(() => {
    console.log(`Document changed to: ${docId} - clearing chat history`);
    setResults([]);
    setHasAskedFirstQuestion(false);
    setQuestion('');
    setError('');
    if (isMobile) {
      setMobileSection('chat');
    }
  }, [docId, isMobile]);

  // Auto-scroll to bottom when new results are added
  useEffect(() => {
    if (resultsEndRef.current) {
      if (isMobile) {
        // For mobile, scroll to the very bottom of the page
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      } else {
        resultsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [results, isMobile]);

  const handleReferenceClick = (fileId) => {
    // Open the PDF in a new tab using the backend API
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    window.open(`${apiBaseUrl}/pdf/${fileId}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const questionText = question.trim();
    setQuestion('');
    setHasAskedFirstQuestion(true);
    setIsLoading(true);
    setError('');

    // Immediately add the question to results with a temporary answer
    const tempResult = {
      id: Date.now(),
      question: questionText,
      answer: '', // Will be filled when response comes
      references: [],
      total_tokens: 'N/A',
      isLoading: true
    };

    setResults(prev => [...prev, tempResult]);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: questionText, document_id: docId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = '';
      let references = [];
      let total_tokens = 'N/A';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'chunk') {
                accumulatedAnswer += data.content;
                // Update the result with the current accumulated answer
                setResults(prev => prev.map(result =>
                  result.id === tempResult.id
                    ? {
                        ...result,
                        answer: accumulatedAnswer,
                        isLoading: true // Keep loading until end
                      }
                    : result
                ));
              } else if (data.type === 'end') {
                references = data.references || [];
                total_tokens = data.total_tokens || 'N/A';
                // Update with final data
                setResults(prev => prev.map(result =>
                  result.id === tempResult.id
                    ? {
                        ...result,
                        answer: accumulatedAnswer,
                        references: references,
                        total_tokens: total_tokens,
                        isLoading: false
                      }
                    : result
                ));
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to get response: ${err.message}`);
      // Update the result to show error
      setResults(prev => prev.map(result =>
        result.id === tempResult.id
          ? { ...result, answer: `Error: ${err.message}`, isLoading: false }
          : result
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (cardQuestion) => {
    setHasAskedFirstQuestion(true);
    setIsLoading(true);
    setError('');

    // Immediately add the question to results with a temporary answer
    const tempResult = {
      id: Date.now(),
      question: cardQuestion,
      answer: '', // Will be filled when response comes
      references: [],
      total_tokens: 'N/A',
      isLoading: true
    };

    setResults(prev => [...prev, tempResult]);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: cardQuestion, document_id: docId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = '';
      let references = [];
      let total_tokens = 'N/A';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'chunk') {
                accumulatedAnswer += data.content;
                // Update the result with the current accumulated answer
                setResults(prev => prev.map(result =>
                  result.id === tempResult.id
                    ? {
                        ...result,
                        answer: accumulatedAnswer,
                        isLoading: true // Keep loading until end
                      }
                    : result
                ));
              } else if (data.type === 'end') {
                references = data.references || [];
                total_tokens = data.total_tokens || 'N/A';
                // Update with final data
                setResults(prev => prev.map(result =>
                  result.id === tempResult.id
                    ? {
                        ...result,
                        answer: accumulatedAnswer,
                        references: references,
                        total_tokens: total_tokens,
                        isLoading: false
                      }
                    : result
                ));
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to get response: ${err.message}`);
      // Update the result to show error
      setResults(prev => prev.map(result =>
        result.id === tempResult.id
          ? { ...result, answer: `Error: ${err.message}`, isLoading: false }
          : result
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile nav bar
  const mobileNavBar = isMobile ? (
    <div className="mobile-nav-bar">
      <button className={mobileSection === 'pdf' ? 'active' : ''} onClick={() => setMobileSection('pdf')}>PDF File</button>
      <button className={mobileSection === 'chat' ? 'active' : ''} onClick={() => setMobileSection('chat')}>Chat</button>
    </div>
  ) : null;

  // Render section based on mobileSection
  let sectionContent;
  if (!isMobile) {
    sectionContent = (
      <DocumentChat selectedDoc={docId} pageNumber={1}>
        <ChatApp 
          selectedDoc={docId} 
          onPageClick={onPageClick} 
          journals={journals}
          onDocumentSelect={onDocumentSelect}
          sidebarExpanded={sidebarExpanded}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          // Chat state props
          question={question}
          setQuestion={setQuestion}
          results={results}
          setResults={setResults}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
          hasAskedFirstQuestion={hasAskedFirstQuestion}
          setHasAskedFirstQuestion={setHasAskedFirstQuestion}
          resultsEndRef={resultsEndRef}
          handleSubmit={handleSubmit}
          handleCardClick={handleCardClick}
          handleReferenceClick={handleReferenceClick}
        />
      </DocumentChat>
    );
  } else {
    if (mobileSection === 'pdf') {
      sectionContent = (
        <div className="mobile-section-content">
          <DocumentChat selectedDoc={docId} pageNumber={1} pdfOnlyMobile={true} />
        </div>
      );
    } else {
      sectionContent = (
        <div className="mobile-section-content">
          <ChatApp 
            selectedDoc={docId} 
            onPageClick={onPageClick} 
            journals={journals}
            onDocumentSelect={onDocumentSelect}
            sidebarExpanded={sidebarExpanded}
            toggleSidebar={toggleSidebar}
            // Chat state props
            question={question}
            setQuestion={setQuestion}
            results={results}
            setResults={setResults}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            hasAskedFirstQuestion={hasAskedFirstQuestion}
            setHasAskedFirstQuestion={setHasAskedFirstQuestion}
            resultsEndRef={resultsEndRef}
            handleSubmit={handleSubmit}
            handleCardClick={handleCardClick}
            handleReferenceClick={handleReferenceClick}
          />
        </div>
      );
    }
  }

  return (
    <>
      {mobileNavBar}
      {sectionContent}
    </>
  );
};

export default function App() {
  const [pdfPage, setPdfPage] = useState(1);
  const [journals, setJournals] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(window.innerWidth > 767);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showJournalsList, setShowJournalsList] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    fetch(`${apiBaseUrl}/journals`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch journals');
        return res.json();
      })
      .then(data => setJournals(data))
      .catch(err => console.error('Error fetching journals:', err));
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      // Dark Theme with Orange accents
      root.style.setProperty('--bg-primary', '#0f0f0f');
      root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--bg-tertiary', '#2a2a2a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#cccccc');
      root.style.setProperty('--text-muted', '#888888');
      root.style.setProperty('--accent', '#ff6b35');        // Orange accent
      root.style.setProperty('--accent-hover', '#e55a2b');  // Darker shade of orange
      root.style.setProperty('--border', '#333333');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Light Theme with Blue accents
      root.style.setProperty('--bg-primary', '#ffffff');    // White background
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-tertiary', '#e9ecef');
      root.style.setProperty('--text-primary', '#212529');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--text-muted', '#adb5bd');
      root.style.setProperty('--accent', 'rgb(45, 50, 121)');        // Custom accent
      root.style.setProperty('--accent-hover', 'rgb(37, 40, 97)');  // Darker shade
      root.style.setProperty('--border', '#dee2e6');
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
    }
  }, [isDarkMode]);

  const handlePageClick = (pageNum) => setPdfPage(pageNum);

  const handleDocumentSelect = (docId) => {
    console.log(`Opening document: ${docId}`);
    setSidebarExpanded(false);
    navigate(`/chat/${docId}`);
  };

  // Get current document name for breadcrumb
  let currentDocName = '';
  if (location.pathname.startsWith('/chat/')) {
    const docId = location.pathname.split('/chat/')[1];
    const doc = journals.find(j => j.id === docId);
    currentDocName = doc ? doc.title : '';
  }

  return (
    <div className={`app-layout ${sidebarExpanded && location.pathname !== '/' ? 'sidebar-expanded' : ''}`}>
      {/* Mobile-friendly header with breadcrumb and document selector */}
      {/* Mobile header: show only on mobile view */}
      <div className="mobile-header">
        <div className="breadcrumb">
          <span className="breadcrumb-home" onClick={() => navigate('/')}>Home</span>
          {currentDocName && <span className="breadcrumb-sep">/</span>}
          {currentDocName && (
            <span className="breadcrumb-doc" title={currentDocName}>
              {currentDocName.length > 20 ? currentDocName.substring(0, 17) + '...' : currentDocName}
            </span>
          )}
        </div>
        {isMobile && location.pathname !== '/' && (
          <button className="mobile-menu-icon" onClick={toggleSidebar}>
            ☰
          </button>
        )}
      </div>

      {/* Sidebar remains for desktop/tablet */}
      {location.pathname !== '/' && (
        <div className={`sidebar ${sidebarExpanded ? 'expanded' : ''} ${isMobile ? 'mobile' : ''}`}>
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <img src={isDarkMode ? logoDark : AppLogoSidebarLightTheme} alt="App Logo" style={{ width: '100%', height: '30px' }} />
            </div>
            <button className="sidebar-close" onClick={toggleSidebar}>
              ✕
            </button>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item" onClick={() => { navigate('/'); setShowJournalsList(false); setSidebarExpanded(false); }}>Home</a>
            <a href="#" className={`nav-item ${showJournalsList ? 'active' : ''}`} onClick={() => setShowJournalsList(!showJournalsList)}>Documents</a>
            <a href="#" className="nav-item" onClick={() => { navigate('/reports'); setSidebarExpanded(false); }}>Reports</a>
          </nav>
          {showJournalsList && (
            <div className="sidebar-journals">
              <h3>Available Documents</h3>
              <div className="journals-list">
                {journals.map(doc => (
                  <div
                    key={doc.id}
                    className="journal-item"
                    onClick={() => {
                      console.log(`Clicked on journal: ${doc.title} (${doc.id})`);
                      handleDocumentSelect(doc.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="journal-title">{doc.title}</span>
                    <span className="journal-desc">{doc.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content routes */}
      <Routes>
        <Route path="/" element={<SelectDocument onSelect={handleDocumentSelect} isDarkMode={isDarkMode} />} />
        <Route path="/chat/:docId" element={<ChatPage journals={journals} onPageClick={handlePageClick} onDocumentSelect={handleDocumentSelect} sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />} />
        <Route path="/reports" element={<Reports sidebarExpanded={sidebarExpanded} toggleSidebar={toggleSidebar} isDarkMode={isDarkMode} />} />
      </Routes>
    </div>
  );
}
