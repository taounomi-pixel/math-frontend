import React, { useState, useEffect } from 'react';
import '../index.css';
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
<div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
<h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
<p className="text-lg text-slate-600">{description}</p>
</div>
);
// Main Layout Wrapper
const LayoutContent = () => {
const [searchQuery, setSearchQuery] = useState('');
const { t } = useLanguage();
const location = useLocation();
const navigate = useNavigate();
// The 'backgroundLocation' state allows us to keep the background page mounted while showing a modal
const backgroundLocation = location.state?.backgroundLocation;
useEffect(() => {
document.title = t('logoText');
}, [t, location]);
    return (
      <div className="w-full min-h-screen flex flex-col bg-slate-50 bg-fixed">
        {/* Premium Math Background Vectors */}
        <div className="bg-vectors fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] text-[15rem] font-serif select-none rotate-12">π</div>
          <div className="absolute top-[40%] right-[8%] text-[18rem] font-serif select-none -rotate-12">∫</div>
          <div className="absolute bottom-[10%] left-[15%] text-[12rem] font-serif select-none rotate-45">∞</div>
          <div className="absolute top-[60%] left-[40%] text-[10rem] font-serif select-none -rotate-6">∑</div>
          <div className="absolute bottom-[20%] right-[20%] text-[14rem] font-serif select-none rotate-12">√</div>
        </div>

        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="flex-1 relative w-full max-w-[1920px] mx-auto z-10 pt-6 md:pt-10">
          <Sidebar />
          
          <div className="page-content px-4 md:px-8">
            <div 
              className="w-full transition-all duration-700 ease-in-out"
              style={{ 
                // Removed redundant blur filter that caused rendering collapse
                opacity: backgroundLocation ? 0.6 : 1,
                transform: backgroundLocation ? 'scale(0.98)' : 'scale(1)',
                pointerEvents: backgroundLocation ? 'none' : 'auto'
              }}
            >
              <Routes location={backgroundLocation || location}>
                <Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
                <Route path="/videos" element={<TheoremCard searchQuery={searchQuery} />} />
                <Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
                <Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
                <Route path="/video/:id" element={<TheoremCard searchQuery={searchQuery} />} />
                <Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
              </Routes>
            </div>

            <AnimatePresence mode="wait">
              {(backgroundLocation || (location.pathname && location.pathname.startsWith('/video/'))) && (
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
