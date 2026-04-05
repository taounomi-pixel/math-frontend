1: import React, { useState, useEffect } from 'react';
2: import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
3: import { AnimatePresence } from 'framer-motion';
4: import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
5: 
6: // Import Components
7: import Header from './components/Header';
8: import Sidebar from './components/Sidebar';
9: import TheoremCard from './components/TheoremCard';
10: import VideoDetail from './components/VideoDetail';
11: 
12: // Generic Placeholder Component
13: const PlaceholderPage = ({ title, description }) => (
14:   <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
15:     <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
16:     <p className="text-lg text-slate-600">{description}</p>
17:   </div>
18: );
19: 
20: // Main Layout Wrapper
21: const LayoutContent = () => {
22:   const [searchQuery, setSearchQuery] = useState('');
23:   const { t } = useLanguage();
24:   const location = useLocation();
25:   const navigate = useNavigate();
26:   
27:   // The 'backgroundLocation' state allows us to keep the background page mounted while showing a modal
28:   const backgroundLocation = location.state?.backgroundLocation;
29: 
30:   useEffect(() => {
31:     document.title = t('logoText');
32:   }, [t, location]);
33: 
34:   return (
35:     <div className="w-full min-h-screen flex flex-col bg-slate-50">
36:       <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
37:       
38:       <main className="flex-1 relative w-full max-w-[1920px] mx-auto">
39:         <Sidebar />
40:         
41:         <div className="page-content mt-6 md:mt-8 px-4 md:px-8">
42:           {/* 
43:             Background Gallery: Renders for homepage routes OR when we have a backgroundLocation.
44:             We add a blur filter if a modal (VideoDetail) is active.
45:           */}
46:           <div 
47:             className="w-full transition-all duration-500 ease-in-out"
48:             style={{ 
49:               filter: backgroundLocation ? 'blur(8px) brightness(0.9)' : 'none'
50:             }}
51:           >
52:             <Routes location={backgroundLocation || location}>
53:               <Route path="/" element={<TheoremCard searchQuery={searchQuery} />} />
54:               <Route path="/videos" element={<TheoremCard searchQuery={searchQuery} />} />
55:               <Route path="/c/:categoryL1" element={<TheoremCard searchQuery={searchQuery} />} />
56:               <Route path="/c/:categoryL1/:categoryL2" element={<TheoremCard searchQuery={searchQuery} />} />
57:               
58:               {/* Catch-all for /video/:id to keep the background active as TheoremCard */}
59:               <Route path="/video/:id" element={<TheoremCard searchQuery={searchQuery} />} />
60:               
61:               <Route path="*" element={<PlaceholderPage title={t("titleNotFound")} description={t("descNotFound")} />} />
62:             </Routes>
63:           </div>
64: 
65:           {/* Modal Route: Rendered with AnimatePresence for smooth transitions */}
66:           <AnimatePresence mode="wait">
67:             {(backgroundLocation || location.pathname.startsWith('/video/')) && (
68:               <Routes location={location} key="modal">
69:                 <Route path="/video/:id" element={<VideoDetail />} />
70:               </Routes>
71:             )}
72:           </AnimatePresence>
73:         </div>
74:       </main>
75:     </div>
76:   );
77: };
78: 
79: // Main App Router
80: export default function App() {
81:   return (
82:     <LanguageProvider>
83:       <Router>
84:         <LayoutContent />
85:       </Router>
86:     </LanguageProvider>
87:   );
88: }
