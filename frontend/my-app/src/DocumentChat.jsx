import React, { useState, useRef, useCallback } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?url';
import '@react-pdf-viewer/core/lib/styles/index.css';

export default function DocumentChat({ selectedDoc, children, pageNumber = 1, pdfOnlyMobile = false }) {
  const [splitRatio, setSplitRatio] = useState(50); // Percentage for PDF section (50% = equal split)
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const containerRef = useRef(null);
  const chatContentRef = useRef(null);

  console.log(`Loading PDF for document: ${selectedDoc}, page: ${pageNumber}`);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const pdfUrl = `${apiBaseUrl}/pdf/${selectedDoc}`;

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Check if we're in mobile mode (flex-direction: column)
    const isMobile = window.innerWidth <= 767;

    if (isMobile) {
      // Vertical resizing for mobile
      const y = e.clientY - rect.top;
      const percentage = (y / rect.height) * 100;
      const constrainedPercentage = Math.max(20, Math.min(80, percentage));
      setSplitRatio(constrainedPercentage);
    } else {
      // Horizontal resizing for desktop
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const constrainedPercentage = Math.max(20, Math.min(80, percentage));
      setSplitRatio(constrainedPercentage);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Scroll to top when new document is selected
  React.useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = 0;
    }
  }, [selectedDoc]);

  // If mobile and pdfOnlyMobile, show only PDF section
  if (isMobile && pdfOnlyMobile) {
    return (
      <div className="document-chat-container" ref={containerRef}>
        <div className="pdf-section" style={{ width: '100%', height: '80vh', flex: '1 1 100%' }}>
          <Worker workerUrl={pdfjsWorker}>
            <Viewer
              fileUrl={pdfUrl}
              defaultScale={0.9}
              initialPage={pageNumber - 1}
              page={pageNumber - 1}
              onDocumentLoad={(e) => console.log(`PDF loaded successfully: ${selectedDoc}`)}
              onLoadError={(error) => console.error(`PDF load error for ${selectedDoc}:`, error)}
            />
          </Worker>
        </div>
      </div>
    );
  }

  return (
    <div
      className="document-chat-container"
      ref={containerRef}
    >
      <div
        className="pdf-section"
        style={{
          flex: `0 0 ${splitRatio}%`,
          height: isMobile ? `${splitRatio}%` : 'auto'
        }}
      >
        <Worker workerUrl={pdfjsWorker}>
          <Viewer
            fileUrl={pdfUrl}
            defaultScale={isMobile ? 0.9 : 1.2}
            initialPage={pageNumber - 1}
            page={pageNumber - 1}
            onDocumentLoad={(e) => console.log(`PDF loaded successfully: ${selectedDoc}`)}
            onLoadError={(error) => console.error(`PDF load error for ${selectedDoc}:`, error)}
          />
        </Worker>
      </div>

      <div
        className="resizer"
        onMouseDown={handleMouseDown}
        style={{
          width: isMobile ? '100%' : '4px',
          height: isMobile ? '4px' : '100%'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: isMobile ? '50%' : '-4px',
            top: isMobile ? '-4px' : '50%',
            transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
            width: isMobile ? '40px' : '12px',
            height: isMobile ? '12px' : '40px',
            backgroundColor: 'var(--accent)',
            borderRadius: '2px',
            opacity: 0.7
          }}
        />
      </div>

      <div
        className="chat-section"
        style={{
          flex: `0 0 ${100 - splitRatio}%`,
          height: isMobile ? `${100 - splitRatio}%` : 'auto'
        }}
      >
        <div className="chat-content" ref={chatContentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
