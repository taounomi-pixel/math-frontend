1: import React, { useState, useEffect } from 'react';
2: import { useParams, useNavigate, useLocation } from 'react-router-dom';
3: import { motion } from 'framer-motion';
4: import { PlayCircle, Bookmark, Play, Heart, Loader2, Trash2, Code, Tag, FolderOpen, Eye } from 'lucide-react';
5: import { useLanguage } from '../contexts/LanguageContext';
6: import { API_BASE } from '../utils/api';
7: 
8: const VideoItem = ({ video, handleLike, handleDelete, isOwner, t }) => {
9:   const navigate = useNavigate();
10:   const location = useLocation();
11: 
12:   const handleOpenVideo = () => {
13:     // Navigate with backgroundLocation for modal overlay
14:     // Also pass videoData to eliminate loading flicker
15:     navigate(`/video/${video.id}`, { state: { backgroundLocation: location, videoData: video } });
16:   };
17: 
18:   return (
19:     <motion.div 
20:       layoutId={`video-card-${video.id}`}
21:       className="group relative flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
22:       whileHover={{ y: -8 }}
23:     >
24:       {/* Thumbnail Section */}
25:       <div 
26:         onClick={handleOpenVideo}
27:         className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-900"
28:       >
29:         <motion.img 
30:           layoutId={`video-visual-${video.id}`}
31:           src={video.thumbnail_url || `https://pub-728b746849b244799047b198b17eb10b.r2.dev/placeholder.webp`}
32:           className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
33:           alt={video.title}
34:         />
35:         
36:         {/* Play Overlay */}
37:         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
38:           <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
39:             <Play fill="white" className="text-white ml-1" size={28} />
40:           </div>
41:         </div>
42: 
43:         {/* Category Badge */}
44:         <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-white/30 shadow-xl opacity-0 group-hover:opacity-100 mt-2 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
45:           {t(video.category_l1) || video.category_l1}
46:         </div>
47:       </div>
48: 
49:       {/* Content Area */}
50:       <div className="p-7 flex flex-col gap-4">
51:         <div className="flex items-start justify-between gap-4">
52:           <h3 
53:             onClick={handleOpenVideo}
54:             className="text-xl font-black text-slate-800 leading-tight cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
55:           >
56:             {video.title}
57:           </h3>
58:           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-pink-100 group-hover:bg-pink-50 transition-all duration-300">
59:             <Heart 
60:               size={18} 
61:               className={`cursor-pointer transition-all duration-300 hover:scale-125 ${video._liked || video.is_liked_by_me ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`}
62:               onClick={(e) => { e.stopPropagation(); handleLike(video.id); }}
63:             />
64:             <span className={`text-sm font-black ${(video._liked || video.is_liked_by_me) ? 'text-pink-600' : 'text-slate-500'}`}>
65:               {video.like_count}
66:             </span>
67:           </div>
68:         </div>
69: 
70:         {/* Tags */}
71:         <div className="flex flex-wrap gap-2">
72:           {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).slice(0, 3).map(tag => (
73:             <span key={tag} className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 transition-colors hover:bg-white hover:text-blue-500 hover:border-blue-100">
74:               #{t(tag) || tag}
75:             </span>
76:           ))}
77:         </div>
78: 
79:         {/* Bottom Meta */}
80:         <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-50">
81:           <div className="flex items-center gap-3">
82:             <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg shadow-blue-100">
83:               {video.uploader_username?.[0]?.toUpperCase()}
84:             </div>
85:             <div className="flex flex-col">
86:               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('uploadedBy')}</span>
87:               <span className="text-sm font-black text-slate-700">@{video.uploader_username}</span>
88:             </div>
89:           </div>
90:           
91:           <div className="flex items-center gap-1.5">
92:             {isOwner && (
93:               <button 
94:                 onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
95:                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
100:                 title={t('btnDelete')}
101:               >
102:                 <Trash2 size={18} />
103:               </button>
104:             )}
105:             <button 
106:               onClick={handleOpenVideo}
107:               className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
108:             >
109:               <Eye size={18} />
110:             </button>
111:           </div>
112:         </div>
113:       </div>
114:     </motion.div>
115:   );
116: };
117: 
118: const TheoremCard = ({ searchQuery = "" }) => {
119:   const { t } = useLanguage();
120:   const { categoryL1, categoryL2 } = useParams();
121:   const [videos, setVideos] = useState([]);
122:   const [isLoading, setIsLoading] = useState(true);
123:   const [error, setError] = useState('');
124:   const [showWakingMessage, setShowWakingMessage] = useState(false);
125:   
126:   const fetchVideos = async () => {
127:     setIsLoading(true);
128:     setShowWakingMessage(false);
129:     const timer = setTimeout(() => setShowWakingMessage(true), 3000);
130: 
131:     const token = localStorage.getItem('access_token');
132:     const headers = {};
133:     if (token) headers['Authorization'] = `Bearer ${token}`;
134: 
135:     try {
136:       const response = await fetch(`${API_BASE}/videos`, { headers });
137:       if (!response.ok) throw new Error('Failed to fetch videos');
138:       const data = await response.json();
139:       setVideos(data);
140:     } catch (err) {
141:       setError(err.message);
142:     } finally {
143:       clearTimeout(timer);
144:       setIsLoading(false);
145:     }
146:   };
147: 
148:   useEffect(() => {
149:     fetchVideos();
150:     window.addEventListener('videoUploaded', fetchVideos);
151:     return () => window.removeEventListener('videoUploaded', fetchVideos);
152:   }, []);
153: 
154:   const currentUserId = localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id'), 10) : null;
155:   const currentUsername = localStorage.getItem('username');
156: 
157:   const handleDelete = async (videoId) => {
158:     if (!window.confirm(t('deleteConfirm'))) return;
159:     const token = localStorage.getItem('access_token');
160:     try {
161:       const response = await fetch(`${API_BASE}/videos/${videoId}`, {
162:         method: 'DELETE',
163:         headers: { 'Authorization': `Bearer ${token}` }
164:       });
165:       if (!response.ok) throw new Error(t('errDeleteFail'));
166:       setVideos(prev => prev.filter(v => v.id !== videoId));
167:     } catch (err) {
168:       alert(err.message);
169:     }
170:   };
171: 
172:   const handleLike = async (videoId) => {
173:     const token = localStorage.getItem('access_token');
174:     if (!token) { alert(t('loginToLike')); return; }
175:     try {
176:       const res = await fetch(`${API_BASE}/videos/${videoId}/like`, {
177:         method: 'POST',
178:         headers: { 'Authorization': `Bearer ${token}` }
179:       });
180:       if (!res.ok) throw new Error('Action failed');
181:       const data = await res.json();
182:       setVideos(prev => prev.map(v => 
183:         v.id === videoId ? { ...v, like_count: data.like_count, _liked: data.action === 'liked' } : v
184:       ));
185:     } catch (err) { console.error(err); }
186:   };
187: 
188:   if (isLoading && videos.length === 0) {
189:     return (
190:       <div className="flex flex-col items-center justify-center py-32 gap-6">
191:         <Loader2 className="animate-spin text-blue-500" size={48} />
192:         {showWakingMessage && <p className="text-slate-400 font-bold animate-pulse">{t('wakingUp')}</p>}
193:       </div>
194:     );
195:   }
196: 
197:   if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 m-8 text-center font-bold">{error}</div>;
198: 
199:   const decodedL1 = categoryL1 ? decodeURIComponent(categoryL1) : null;
200:   const decodedL2 = categoryL2 ? decodeURIComponent(categoryL2) : null;
201:   const lowerQuery = searchQuery.toLowerCase().trim();
202: 
203:   let filteredVideos = videos.filter(v => (!decodedL1 || v.category_l1 === decodedL1) && (!decodedL2 || v.category_l2 === decodedL2));
204:   if (lowerQuery) {
205:     filteredVideos = filteredVideos.filter(v => 
206:       (v.title || "").toLowerCase().includes(lowerQuery) || 
207:       (v.uploader_username || "").toLowerCase().includes(lowerQuery) || 
208:       (Array.isArray(v.tags) ? v.tags : (v.tags ? v.tags.split(',') : [])).some(tag => tag.toLowerCase().includes(lowerQuery))
209:     );
210:   }
211: 
212:   if (filteredVideos.length === 0) {
213:     return (
214:       <div className="text-center py-32 px-8 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-100 m-8">
215:         <FolderOpen size={64} className="mx-auto text-slate-200 mb-6" />
216:         <h3 className="text-slate-800 font-black text-2xl mb-2">{t('noRecords')}</h3>
217:         <p className="text-slate-400 font-medium">{t('loginToUploadDesc')}</p>
218:       </div>
219:     );
220:   }
221: 
222:   return (
223:     <div className="max-w-[1600px] mx-auto py-12">
224:       {/* 2-column Grid - ACCORDING TO USER'S HARD REQUIREMENTS */}
225:       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
226:         {filteredVideos.map(video => (
227:           <VideoItem 
228:             key={video.id} 
229:             video={video} 
230:             handleLike={handleLike} 
231:             handleDelete={handleDelete}
232:             isOwner={currentUserId === video.uploader_id || currentUsername === video.uploader_username || localStorage.getItem('is_admin') === 'true'}
233:             t={t} 
234:           />
235:         ))}
236:       </div>
237:     </div>
238:   );
239: };
240: 
241: export default TheoremCard;
