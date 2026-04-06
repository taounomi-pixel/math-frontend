import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TheoremCard from './components/TheoremCard';
import VideoDetail from './components/VideoDetail';

// Generic Placeholder Component
const PlaceholderPage = ({ title, description }) => (
  <div style={{
    padding: '48px 32px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    textAlign: 'center'
  }}>
    <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '16px' }}>{title}</h2>
    <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>{description}</p>
  </div>
);

// Main Layout Wrapper
const LayoutContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // If we have a background location, use it for the gallery routes
  // This allows the gallery to stay visible underneath the modal
  const backgroundLocation = location.state?.backgroundLocation;
  
  useEffect(() => {
    document.title = t('logoText');
  }, [t, location]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main style={{ position: 'relative' }} className="w-full flex-1">
        <Sidebar />
        
        <div className="page-content" style={{ flex: 1, position: 'relative' }}>
          {/* 
            Background Gallery: Renders for homepage routes OR when we have a backgroundLocation.
            If we access /video/:id directly, backgroundLocation will be null/undefined.
            We still want the homepage to render behind it.
          */}
          <div 
            className="w-full min-h-screen"
            style={{ 
              filter: backgroundLocation ? 'blur(4px) brightness(0.9)' : 'none', 
              transition: 'filter 0.3s ease, brightness 0.3s ease' 
            }}
          >
            <Routes location={backgroundLocation || (location.pathname.startsWith('/video/') ? { ...location, pathname: '/' } : location)}>
              <Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
              <Route path="/videos" element={<TheoremCard searchQuery={searchQuery} />} />
              <Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
              <Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
              {/* Catch-all for /video/:id to keep the background active */}
              <Route path="/video/:id" element={<TheoremCard searchQuery={searchQuery} />} />
              <Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
            </Routes>
          </div>

          {/* The Overlay */}
          <AnimatePresence>
            {(backgroundLocation || location.pathname.startsWith('/video/')) && (
              <Routes location={location} key="modal">
                <Route path="/video/:id" element={<VideoDetail />} />
              </Routes>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Main App Router
export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <LayoutContent />
      </Router>
    </LanguageProvider>
  );
}
