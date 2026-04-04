1: import React, { useState, useEffect, useRef } from 'react';
2: import { useParams, useNavigate, useLocation } from 'react-router-dom';
3: import { motion, AnimatePresence } from 'framer-motion';
4: import { 
5:   X, Heart, Share2, MessageCircle, User, Calendar, 
6:   ChevronRight, Play, Maximize2, Download, Trash2, 
7:   Loader2, AlertCircle, Bookmark, ArrowLeft, Code
8: } from 'lucide-react';
9: import { useLanguage } from '../contexts/LanguageContext';
10: import { API_BASE } from '../utils/api';
11: import CommentSection from './CommentSection';
12: 
13: const VideoDetail = () => {
14:   const { id } = useParams();
15:   const navigate = useNavigate();
16:   const location = useLocation();
17:   const { t } = useLanguage();
18:   const scrollRef = useRef(null);
19:   
20:   // Use passed videoData for instant rendering (eliminates white flicker)
21:   const initialVideoData = location.state?.videoData;
22:   const [video, setVideo] = useState(initialVideoData || null);
23:   const [loading, setLoading] = useState(!initialVideoData);
24:   const [error, setError] = useState(null);
25: 
26:   const isModal = !!location.state?.backgroundLocation;
27:   const token = localStorage.getItem('access_token');
28: 
29:   const fetchDetail = async () => {
30:     if (!initialVideoData) setLoading(true);
31:     try {
32:       const headers = {};
33:       if (token) headers['Authorization'] = `Bearer ${token}`;
34: 
35:       const res = await fetch(`${API_BASE}/videos/${id}`, { headers });
36:       if (!res.ok) throw new Error(t('errVideoNotFound') || 'Video not found');
37:       const data = await res.json();
38:       setVideo(data);
39:     } catch (err) {
40:       setError(err.message);
41:     } finally {
42:       setLoading(false);
43:     }
44:   };
45: 
46:   useEffect(() => {
47:     fetchDetail();
48:   }, [id, t]);
49: 
50:   // Handle ESC key to close
51:   useEffect(() => {
52:     const handleEsc = (e) => {
53:       if (e.key === 'Escape') handleClose();
54:     };
55:     window.addEventListener('keydown', handleEsc);
56:     return () => window.removeEventListener('keydown', handleEsc);
57:   }, [navigate]);
58: 
59:   const handleClose = () => {
60:     if (isModal) {
61:       navigate(-1);
62:     } else {
63:       navigate('/');
64:     }
65:   };
66: 
67:   const toggleLike = async (e) => {
68:     if (e) e.stopPropagation();
69:     if (!token) {
70:       alert(t('loginToLike') || 'Please login to like');
71:       return;
72:     }
73:     
74:     try {
75:       const res = await fetch(`${API_BASE}/videos/${id}/like`, {
76:         method: 'POST',
77:         headers: {
78:           'Authorization': `Bearer ${token}`
79:         }
80:       });
81:       if (!res.ok) throw new Error('Action failed');
82:       const data = await res.json();
83:       
84:       setVideo(prev => ({ 
85:         ...prev, 
86:         like_count: data.like_count, 
87:         _liked: data.action === 'liked' 
88:       }));
89:     } catch (err) {
90:       console.error(err);
91:     }
92:   };
93: 
94:   const renderContent = () => {
95:     if (loading && !video) {
96:       return (
97:         <div className="flex flex-col items-center justify-center h-96 gap-4">
98:           <Loader2 className="animate-spin text-blue-500" size={40} />
99:           <p className="text-slate-500 font-medium">{t('loading')}</p>
100:         </div>
101:       );
102:     }
103: 
104:     if (error) {
105:       return (
106:         <div className="flex flex-col items-center justify-center h-96 gap-4 px-6 text-center">
107:           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
108:             <AlertCircle size={32} />
109:           </div>
110:           <h2 className="text-xl font-bold text-slate-800">{t('oops')}</h2>
111:           <p className="text-slate-500 max-w-xs">{error}</p>
112:           <button 
113:             onClick={() => navigate('/')}
114:             className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
115:           >
116:             {t('backToHome')}
117:           </button>
118:         </div>
119:       );
120:     }
121: 
122:     if (!video) return null;
123: 
124:     return (
125:       <div className="flex flex-col w-full">
126:         {/* Video Player Section */}
127:         <div className="relative aspect-video w-full bg-black group overflow-hidden">
128:           <video 
129:             src={video.video_url} 
130:             className="w-full h-full"
131:             controls
132:             autoPlay
133:             poster={video.thumbnail_url}
134:           />
135:           
136:           {/* Top Bar Overlay */}
137:           <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
138:             <div className="flex items-center gap-3">
139:               <button 
140:                 onClick={handleClose}
141:                 className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 text-sm font-bold"
142:               >
143:                 <ArrowLeft size={16} /> {t('backToGallery')}
144:               </button>
145:             </div>
146:             <button 
147:               onClick={handleClose}
148:               className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 border border-white/20"
149:             >
150:               <X size={20} />
151:             </button>
152:           </div>
153:         </div>
154: 
155:         {/* Info Area */}
156:         <div className="p-8 lg:p-10 flex flex-col gap-8 bg-white">
157:           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
158:             <div className="flex-1 space-y-4">
159:               <div className="flex flex-wrap gap-2">
160:                 <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-widest">
161:                   {t(video.category_l1) || video.category_l1}
162:                 </span>
163:                 {video.category_l2 && (
164:                   <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100 uppercase tracking-widest">
165:                     {t(video.category_l2) || video.category_l2}
166:                   </span>
167:                 )}
168:               </div>
169:               <h1 className="text-3xl font-black text-slate-900 leading-tight">
170:                 {video.title}
171:               </h1>
172:               
173:               <div className="flex flex-wrap gap-3">
174:                 {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).map(tag => (
175:                   <span key={tag} className="text-sm font-semibold text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
176:                     #{t(tag) || tag}
177:                   </span>
178:                 ))}
179:               </div>
180:             </div>
181: 
182:             <div className="flex flex-row md:flex-col gap-3 min-w-max">
183:               <button 
184:                 onClick={toggleLike}
185:                 className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 ${
186:                   video._liked || video.is_liked_by_me
187:                     ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 hover:bg-pink-600' 
188:                     : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
189:                 }`}
190:               >
191:                 <Heart size={20} className={(video._liked || video.is_liked_by_me) ? 'fill-white' : ''} />
192:                 <span>{video.like_count}</span>
193:               </button>
194:               <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all">
195:                 <Share2 size={20} />
196:               </button>
197:               {video.manim_source_url && (
198:                 <button 
199:                   onClick={() => window.open(video.manim_source_url, '_blank')}
200:                   className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white hover:bg-black rounded-2xl transition-all shadow-lg shadow-slate-200"
201:                 >
202:                   <Code size={20} />
203:                   <span className="hidden md:inline text-sm font-bold">{t('viewCode')}</span>
204:                 </button>
205:               )}
206:             </div>
207:           </div>
208: 
209:           {/* User & Meta */}
210:           <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
211:             <div className="flex items-center gap-4">
212:               <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
213:                 {video.uploader_username?.[0]?.toUpperCase()}
214:               </div>
215:               <div>
216:                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('uploadedBy') || 'Uploaded by'}</p>
217:                 <p className="text-lg font-bold text-slate-800">@{video.uploader_username}</p>
218:               </div>
219:             </div>
220: 
221:             <div className="flex gap-8">
222:               <div className="text-center">
223:                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('viewsCount') || 'Views'}</p>
224:                 <p className="text-lg font-black text-slate-800">{video.view_count || 0}</p>
225:               </div>
226:               <div className="text-center border-l border-slate-200 pl-8">
227:                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('uploadedDate') || 'Date'}</p>
228:                 <p className="text-lg font-black text-slate-800">
229:                   {video.upload_time ? new Date(video.upload_time).toLocaleDateString() : '--'}
230:                 </p>
231:               </div>
232:             </div>
233:           </div>
234: 
235:           {/* Real Comment Section Integration */}
236:           <div className="space-y-6 pt-6 border-t border-slate-100">
237:             <CommentSection videoId={id} />
238:           </div>
239:         </div>
240:       </div>
241:     );
242:   };
243: 
244:   // If it's a deep link, we render it as a full-page-styled container
245:   if (!isModal) {
246:     return (
247:       <div className="min-h-screen bg-slate-50 flex flex-col">
248:         <div className="px-4 py-12 flex justify-center">
249:           <motion.div 
250:             initial={{ opacity: 0, y: 20 }}
251:             animate={{ opacity: 1, y: 0 }}
252:             className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
253:           >
254:             {renderContent()}
255:           </motion.div>
256:         </div>
257:       </div>
258:     );
259:   }
260: 
261:   // Modal Version
262:   return (
263:     <div 
264:       className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-y-auto"
265:       onClick={handleClose}
266:     >
267:       {/* Backdrop */}
268:       <motion.div 
269:         initial={{ opacity: 0 }}
270:         animate={{ opacity: 1 }}
271:         exit={{ opacity: 0 }}
272:         className="fixed inset-0 bg-white/40 backdrop-blur-2xl"
273:         style={{ zIndex: -1 }}
274:       />
275:       
276:       {/* Modal Container */}
277:       <motion.div 
278:         layoutId={`video-card-${id}`}
279:         className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-full scrollbar-hide z-10 border border-white/20"
280:         onClick={(e) => e.stopPropagation()}
281:       >
282:         {renderContent()}
283:       </motion.div>
284: 
285:       {/* Floating Close Button for Mobile */}
286:       <button 
287:         onClick={handleClose}
288:         className="fixed top-8 right-8 z-[110] p-4 bg-white/40 hover:bg-white/60 backdrop-blur-xl rounded-full text-slate-800 border border-white/40 shadow-2xl transition-all transform hover:rotate-90 md:hidden"
289:       >
290:         <X size={24} />
291:       </button>
292:     </div>
293:   );
294: };
295: 
296: export default VideoDetail;
