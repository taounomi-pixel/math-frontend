import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TheoremCard from './components/TheoremCard';

// Main Layout Wrapper
const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  return (
    <>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="main-content container">
        <Sidebar />
        
        <div className="page-content" style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease' }}>
          <Routes>
            <Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
            <Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
            <Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
            <Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

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
