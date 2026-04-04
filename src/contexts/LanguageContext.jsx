import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  zh: {
    // 导航
    "navHome": "首页",
    "navExplore": "探索",
    "navAbout": "关于我们",
    "navSearch": "搜索课程、动画...",
    "navLogin": "登录 / 注册",
    "navUpload": "发布项目",
    "navLanguage": "语言切换",
    "logoText": "数字数学",
    "upload": "上传",
    "search": "搜索",
    "commentsCount": "条评论",
    "uploadedDate": "发布日期",
    "view": "次观看",
    "addCommentPlace": "发表评论...",
    "commonSubmit": "提交",
    "commonReply": "回复",
    "titleNotFound": "页面未找到",
    "descNotFound": "您访问的页面不存在或已被移除。",

    // 分类
    "allVideos": "全部内容",
    "mathBasic": "初等数学",
    "mathHigh": "高等数学",
    "algebra": "代数",
    "geometry": "几何",
    "calculus": "微积分",
    "topology": "拓扑学",
    "analysis": "分析学",
    "numberTheory": "数论",
    "appliedMath": "应用数学",
    "popularSci": "科学科普",

    // 搜索与过滤
    "searchPlaceholder": "搜索您感兴趣的内容...",
    "trending": "热门推荐",
    "latest": "最新发布",
    "mostLiked": "最多点赞",
    "filterAll": "全部",
    "filterVideo": "视频",
    "filterInter": "交互",

    // 详情页
    "playCount": "播放",
    "likeCount": "点赞",
    "commentCount": "评论",
    "share": "分享",
    "collect": "收藏",
    "description": "简介",
    "author": "发布者",
    "publishDate": "发布日期",
    "relatedVideos": "相关推荐",

    // 上传与交互
    "uploadTitle": "上传数学动画",
    "uploadDrop": "点击或拖拽文件到此处上传",
    "uploadLimit": "支持 MP4, WebM (最大 500MB)",
    "titleLabel": "标题",
    "categoryLabel": "分类",
    "descLabel": "简介",
    "submitBtn": "开始发布",
    "cancelBtn": "取消",

    // 用户系统
    "loginTitle": "欢迎回来",
    "registerTitle": "加入数学可视化社区",
    "username": "用户名",
    "password": "密码",
    "email": "电子邮箱",
    "verificationCode": "验证码",
    "getOTP": "获取验证码",
    "loginBtn": "立即登录",
    "registerBtn": "注册账号",
    "forgotPassword": "忘记密码?",
    "logout": "退出登录",
    "settings": "设置",
    "accountSecurity": "账号与安全",

    // 数学分类（详细版）
    "代数": "Algebra",
    "初等代数": "Elementary Algebra",
    "高等代数": "Advanced Algebra",
    "抽象代数": "Abstract Algebra",
    "几何": "Geometry",
    "欧几里得几何": "Euclidean Geometry",
    "罗巴切夫斯基几何": "Lobachevskian Geometry",
    "黎曼几何": "Riemannian Geometry",
    "射影几何": "Projective Geometry",
    "解析几何": "Analytic Geometry",
    "分形几何": "Fractal Geometry",
    "微分几何": "Differential Geometry",
    "代数几何": "Algebraic Geometry",
    "拓扑学": "Topology",
    "分析": "Analysis",
    "微积分": "Calculus",
    "实分析": "Real Analysis",
    "复分析": "Complex Analysis",
    "泛函分析": "Functional Analysis",
    "调和分析": "Harmonic Analysis",
    "数论": "Number Theory",
    "初等数论": "Elementary Number Theory",
    "解析数论": "Analytic Number Theory",
    "代数数论": "Algebraic Number Theory",
    "计算数论": "Computational Number Theory",
    "离散数学": "Discrete Mathematics",
    "组合数学": "Combinatorics",
    "图论": "Graph Theory",
    "数学逻辑": "Mathematical Logic",
    "集合论": "Set Theory",
    "概率统计": "Probability & Statistics",
    "概率论": "Probability Theory",
    "数理统计": "Mathematical Statistics",
    "随机过程": "Stochastic Processes",
    "计算数学": "Computational Mathematics",
    "数值分析": "Numerical Analysis",
    "科学计算": "Scientific Computing",
    "数学物理": "Mathematical Physics",
    "应用数学": "Applied Mathematics",
    "数学建模": "Mathematical Modeling",
    "运筹学": "Operations Research",
    "金融数学": "Financial Mathematics",
    "数学史": "History of Mathematics",
    "初等数学": "Elementary Mathematics",
    "所有": "All"
  },
  en: {
    // Nav
    "navHome": "Home",
    "navExplore": "Explore",
    "navAbout": "About",
    "navSearch": "Search courses, animations...",
    "navLogin": "Login / Sign Up",
    "navUpload": "Upload",
    "navLanguage": "Language",
    "logoText": "MathVis",
    "upload": "Upload",
    "search": "Search",
    "commentsCount": "Comments",
    "uploadedDate": "Uploaded",
    "view": "Views",
    "addCommentPlace": "Add a comment...",
    "commonSubmit": "Submit",
    "commonReply": "Reply",
    "titleNotFound": "Page Not Found",
    "descNotFound": "The page you are looking for does not exist.",

    // Categories
    "allVideos": "All Content",
    "mathBasic": "Basic Math",
    "mathHigh": "Advanced Math",
    "algebra": "Algebra",
    "geometry": "Geometry",
    "calculus": "Calculus",
    "topology": "Topology",
    "analysis": "Analysis",
    "numberTheory": "Number Theory",
    "appliedMath": "Applied Math",
    "popularSci": "Popular Science",

    // Search & Filter
    "searchPlaceholder": "Search content you're interested in...",
    "trending": "Trending",
    "latest": "Latest",
    "mostLiked": "Most Liked",
    "filterAll": "All",
    "filterVideo": "Video",
    "filterInter": "Interactive",

    // Detail Page
    "playCount": "Plays",
    "likeCount": "Likes",
    "commentCount": "Comments",
    "share": "Share",
    "collect": "Collect",
    "description": "Description",
    "author": "Author",
    "publishDate": "Published",
    "relatedVideos": "Related Content",

    // Upload & Interaction
    "uploadTitle": "Upload Math Animation",
    "uploadDrop": "Click or drag files here to upload",
    "uploadLimit": "Supports MP4, WebM (Max 500MB)",
    "titleLabel": "Title",
    "categoryLabel": "Category",
    "descLabel": "Description",
    "submitBtn": "Publish",
    "cancelBtn": "Cancel",

    // User System
    "loginTitle": "Welcome Back",
    "registerTitle": "Join Math Vis Community",
    "username": "Username",
    "password": "Password",
    "email": "Email",
    "verificationCode": "OTP",
    "getOTP": "Send Code",
    "loginBtn": "Login Now",
    "registerBtn": "Register",
    "forgotPassword": "Forgot Password?",
    "logout": "Logout",
    "settings": "Settings",
    "accountSecurity": "Security",

    // Math Categories (Detailed)
    "代数": "Algebra",
    "初等代数": "Elementary Algebra",
    "高等代数": "Advanced Algebra",
    "抽象代数": "Abstract Algebra",
    "几何": "Geometry",
    "欧几里得几何": "Euclidean Geometry",
    "罗巴切夫斯基几何": "Lobachevskian Geometry",
    "黎曼几何": "Riemannian Geometry",
    "射影几何": "Projective Geometry",
    "解析几何": "Analytic Geometry",
    "分形几何": "Fractal Geometry",
    "微分几何": "Differential Geometry",
    "代数几何": "Algebraic Geometry",
    "拓扑学": "Topology",
    "分析": "Analysis",
    "微积分": "Calculus",
    "实分析": "Real Analysis",
    "复分析": "Complex Analysis",
    "泛函分析": "Functional Analysis",
    "调和分析": "Harmonic Analysis",
    "数论": "Number Theory",
    "初等数论": "Elementary Number Theory",
    "解析数论": "Analytic Number Theory",
    "代数数论": "Algebraic Number Theory",
    "计算数论": "Computational Number Theory",
    "离散数学": "Discrete Mathematics",
    "组合数学": "Combinatorics",
    "图论": "Graph Theory",
    "数学逻辑": "Mathematical Logic",
    "集合论": "Set Theory",
    "概率统计": "Probability & Statistics",
    "概率论": "Probability Theory",
    "数理统计": "Mathematical Statistics",
    "随机过程": "Stochastic Processes",
    "计算数学": "Computational Mathematics",
    "数值分析": "Numerical Analysis",
    "科学计算": "Scientific Computing",
    "数学物理": "Mathematical Physics",
    "应用数学": "Applied Mathematics",
    "数学建模": "Mathematical Modeling",
    "运筹学": "Operations Research",
    "金融数学": "Financial Mathematics",
    "数学史": "History of Mathematics",
    "初等数学": "Elementary Mathematics",
    "所有": "All"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'zh');

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  const toggleLanguage = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
