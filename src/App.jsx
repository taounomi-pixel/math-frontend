import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TheoremCard from './components/TheoremCard';
import VideoDetail from './components/VideoDetail';

// Main Layout Wrapper
const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const location = useLocation();
  
  // The 'backgroundLocation' state allows us to keep the background page mounted while showing a modal
  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  useEffect(() => {
    document.title = t('logoText');
  }, [t]);

  return (
    <div className="w-full min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="main-content container mx-auto px-4">
        <Sidebar />
        
        <div className="page-content" style={{ marginTop: '24px' }}>
          {/* Main Content Routes */}
          <Routes location={backgroundLocation || location}>
            <Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
            <Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
            <Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
            
            {/* Deep Linking Fallback: If user accesses /video/:id directly, 
                show TheoremCard underneath the modal */}
            <Route path="/video/:id" element={<TheoremCard searchQuery={searchQuery} />} />
            
            <Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
          </Routes>
        </div>
      </main>

      {/* Modal Route: Rendered only if we have a backgroundLocation or we are on the /video route */}
      <Routes>
        <Route path="/video/:id" element={<VideoDetail />} />
      </Routes>
    </div>
  );
};

// Generic Placeholder Component
const PlaceholderPage = ({ title, description }) => (
  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
    <p className="text-lg text-slate-600">{description}</p>
  </div>
);

// Main App Router
export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout />
      </Router>
    </LanguageProvider>
  );
}
