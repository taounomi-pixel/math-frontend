import React, { useState, useEffect } from 'react';
import './index.css';
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
<div className="w-full min-h-screen flex flex-col bg-slate-50">
<Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
<main className="flex-1 relative w-full max-w-[1920px] mx-auto">
<Sidebar />
<div className="page-content mt-6 md:mt-8 px-4 md:px-8">
{/* 
Background Gallery: Renders for homepage routes OR when we have a backgroundLocation.
We add a blur filter if a modal (VideoDetail) is active.
*/}
<div 
className="w-full transition-all duration-500 ease-in-out"
style={{ 
filter: backgroundLocation ? 'blur(8px) brightness(0.9)' : 'none'
}}
>
<Routes location={backgroundLocation || location}>
<Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
<Route path="/videos" element={<TheoremCard searchQuery={searchQuery} />} />
<Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
<Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
{/* Catch-all for /video/:id to keep the background active as TheoremCard */}
<Route path="/video/:id" element={<TheoremCard searchQuery={searchQuery} />} />
<Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
</Routes>
</div>
{/* Modal Route: Rendered with AnimatePresence for smooth transitions */}
<AnimatePresence mode="wait">
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
