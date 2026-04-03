import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Header
    searchPlaceholder: "Search theorems, topics, or creators...",
    langEN: "English (EN)",
    langZH: "简体中文 (CN)",
    langFR: "Français (FR)",
    upload: "Upload",
    signIn: "Sign In",
    logout: "Logout",
    resultsCount: "results",
    language: "Language",
    logoText: "MathVis-Theorem Visualization",
    wakingUp: "Server is waking up, please wait a moment...",
    
    // Auth Modal
    loginTitle: "Sign In",
    registerTitle: "Create Account",
    username: "Username",
    email: "Email",
    password: "Password",
    verificationCode: "Verification Code",
    enterOtp: "Please enter the 6-digit code",
    continueBtn: "Continue",
    createAccountBtn: "Create Account",
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    signUpLink: "Sign up",
    signInLink: "Sign in",
    invalidEmail: "Please enter a valid email",
    getCode: "Get Code",
    sending: "Sending...",
    resendAfter: "Resend in {s}s",
    verificationCodePlaceholder: "6-digit code",
    emailRequired: "Email (Required)",
    
    loginFail: "Login failed",
    regFail: "Registration failed",
    regSuccess: "Registration successful! Please sign in.",
    registrationDisabled: "Traditional registration is disabled. Please use GitHub or Google.",
    verificationRequiredTitle: "Identity Verification",
    verificationRequiredDesc: "This account is bound to {provider}. Please verify your identity to continue.",
    
    // OAuth
    loginWithGithub: "Sign in with GitHub",
    loginWithGoogle: "Sign in with Google",
    registerWithGithub: "Verify with GitHub",
    registerWithGoogle: "Verify with Google",
    orUsePassword: "or use username & password",
    orRegisterDirect: "or register directly",
    registerStep1Desc: "First verify your identity with GitHub or Google, then set your username and password.",
    completeRegTitle: "Complete Registration",
    completeRegDesc: "Please set your username and password to complete account creation.",
    verifiedSuccess: "verified!",
    usernamePlaceholder: "Choose a username",
    passwordPlaceholder: "Set a password (min 6 chars)",
    finishRegistration: "Complete Registration",
    bindAccount: "Bind Account",
    bindAccountTitle: "Bind OAuth Account",
    bindAccountDesc: "Link your GitHub or Google account for easier login next time.",
    bindGithub: "Bind GitHub",
    bindGoogle: "Bind Google",
    unbindGithub: "Unbind GitHub",
    unbindGoogle: "Unbind Google",
    unbindConfirm: "Are you sure you want to unbind this account? You will no longer be able to log in using this provider.",
    notBound: "Not Bound",
    boundTo: "Bound to",
    profileCardTitle: "Account Management",
    accountSecurity: "Security & Identity",
    
    // Sidebar & Topics
    "allVideos": "All",
    "All Topics": "All Topics",
    "Calculus": "Calculus",
    "Geometry": "Geometry",
    "Linear Algebra": "Linear Algebra",
    "Number Theory": "Number Theory",
    "Topology": "Topology",
    "Probability": "Probability",
    
    // Categories & Tags
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
    "几何数论": "Geometric Number Theory",
    "概率": "Probability",
    "概率论": "Probability Theory",
    "随机过程": "Stochastic Process",
    "随机分析": "Stochastic Analysis",
    "统计学": "Statistics",
    
    // Home Page Descriptions
    descWait: "The main video grid will be rendered here.",
    descCalculus: "Calculus is the mathematical study of continuous change... 积分与微积分的动画展示。",
    descGeometry: "Exploring shapes, sizes, relative positions, and properties of space... 几何学的魅力。",
    descLinear: "Vectors, vector spaces, linear transformations, and matrices... 线性代数的本质。",
    descNumber: "The study of integers and integer-valued functions... 数论探秘。",
    descTopology: "Properties that are preserved through deformations, twistings, and stretchings... 拓扑结构可视。",
    descProbability: "The mathematics of measuring the likelihood of events... 概率与统计。",
    descNotFound: "The page you are looking for does not exist.",
    titleNotFound: "404 - Not Found",
    
    // TheoremCard
    loading: "Loading...",
    loginToLike: "Please log in to like videos!",
    noRecords: "No visualizations found",
    loginToUploadDesc: "Log in and click Upload to share your first mathematical animation!",
    noResultsFor: "No results found for",
    uploadedBy: "Uploaded by",
    uploadedOn: "Uploaded on",
    likes: "Likes",
    
    // UploadModal
    uploadVideo: "Upload Visualization",
    title: "Title",
    titlePlaceholder: "e.g. Fourier Transform Explained",
    videoFile: "MP4 Video File",
    selectFileHint: "Click to select a local MP4 file",
    btnUploading: "Uploading...",
    btnUpload: "Upload Video",
    errInvalidFile: "Please select a valid .mp4 file.",
    errFieldsRequired: "Both title and MP4 file are required.",
    errLoginRequired: "You must be logged in to upload.",
    errUploadFail: "Upload failed",
    errFileTooLarge: "File size exceeds 30MB limit",
    uploadCancelled: "Upload cancelled",
    
    // Upload Modal Labels
    labelL1: "Major Category (Optional)",
    labelL2: "Secondary Category (Optional)",
    labelTags: "Tags (Optional)",
    placeholderL1: "Select major category",
    placeholderL2: "Select secondary category",
    btnCancel: "Cancel",
    
    // Delete
    btnDelete: "Delete",
    deleteConfirm: "Are you sure you want to delete this video? This action cannot be undone.",
    errDeleteFail: "Failed to delete video.",
    deleteSuccess: "Video deleted successfully.",
    
    // Manim Source
    manimSource: "Manim Source Code (Optional)",
    sourceFileHint: "Select .py file",
    viewCode: "View Code",
    errInvalidSource: "Please select a valid .py file for Manim source."
  },
  zh: {
    // Header
    searchPlaceholder: "搜索定理、主题或创作者...",
    langEN: "English (EN)",
    langZH: "简体中文 (CN)",
    langFR: "Français (FR)",
    upload: "上传",
    signIn: "登入",
    logout: "注销",
    resultsCount: "个结果",
    language: "语言",
    logoText: "MathVis-定理可视化",
    wakingUp: "正在唤醒服务器，请稍候...",
    
    // Auth Modal
    loginTitle: "登入",
    registerTitle: "创建账户",
    username: "用户名",
    email: "电子邮箱",
    password: "密码",
    verificationCode: "验证码",
    enterOtp: "请输入6位验证码",
    continueBtn: "继续",
    createAccountBtn: "创建账户",
    noAccount: "还没有账号？ ",
    hasAccount: "已经有账号了？ ",
    signUpLink: "注册",
    signInLink: "登入",
    invalidEmail: "请输入有效的邮箱",
    getCode: "获取验证码",
    sending: "发送中...",
    resendAfter: "{s}秒后重新获取",
    verificationCodePlaceholder: "请输入6位验证码",
    emailRequired: "电子邮箱 (必填)",
    
    loginFail: "登入失败",
    regFail: "注册失败",
    regSuccess: "注册成功！请登入。",
    registrationDisabled: "传统注册已禁用。请使用 GitHub 或 Google 注册。",
    verificationRequiredTitle: "身份验证",
    verificationRequiredDesc: "此账号已绑定到 {provider}。请验证您的身份以继续。",
    
    // OAuth
    loginWithGithub: "使用 GitHub 登录",
    loginWithGoogle: "使用 Google 登录",
    registerWithGithub: "通过 GitHub 验证",
    registerWithGoogle: "通过 Google 验证",
    orUsePassword: "或使用用户名密码",
    orRegisterDirect: "或直接注册",
    registerStep1Desc: "先通过 GitHub 或 Google 验证身份，然后设置用户名和密码。",
    completeRegTitle: "完善账户信息",
    completeRegDesc: "请设置您的用户名和密码来完成账户创建。",
    verifiedSuccess: "验证成功！",
    usernamePlaceholder: "请输入用户名",
    passwordPlaceholder: "设置密码（至少6位）",
    finishRegistration: "完成注册",
    bindAccount: "绑定账号",
    bindAccountTitle: "绑定第三方账号",
    bindAccountDesc: "绑定 GitHub 或 Google 账号，下次登录更方便。",
    bindGithub: "绑定 GitHub",
    bindGoogle: "绑定 Google",
    unbindGithub: "解绑 GitHub",
    unbindGoogle: "解绑 Google",
    unbindConfirm: "你确定要解绑该账号吗？解绑后将无法再使用此第三方账号登录。",
    notBound: "未绑定",
    boundTo: "已绑定",
    profileCardTitle: "个人资料与管理",
    accountSecurity: "账号与安全",
    
    // Sidebar & Topics
    "allVideos": "所有",
    "All Topics": "所有主题",
    "Calculus": "微积分",
    "Geometry": "几何学",
    "Linear Algebra": "线性代数",
    "Number Theory": "数论",
    "Topology": "拓扑学",
    "Probability": "概率统计",

    // Categories & Tags
    "代数": "代数",
    "初等代数": "初等代数",
    "高等代数": "高等代数",
    "抽象代数": "抽象代数",
    "几何": "几何",
    "欧几里得几何": "欧几里得几何",
    "罗巴切夫斯基几何": "罗巴切夫斯基几何",
    "黎曼几何": "黎曼几何",
    "射影几何": "射影几何",
    "解析几何": "解析几何",
    "分形几何": "分形几何",
    "微分几何": "微分几何",
    "代数几何": "代数几何",
    "拓扑学": "拓扑学",
    "分析": "分析",
    "微积分": "微积分",
    "实分析": "实分析",
    "复分析": "复分析",
    "泛函分析": "泛函分析",
    "调和分析": "调和分析",
    "数论": "数论",
    "初等数论": "初等数论",
    "解析数论": "解析数论",
    "代数数论": "代数数论",
    "几何数论": "几何数论",
    "概率": "概率",
    "概率论": "概率论",
    "随机过程": "随机过程",
    "随机分析": "随机分析",
    "统计学": "统计学",
    
    // Home Page Descriptions
    descWait: "主要的视频网格将渲染在此处。",
    descCalculus: "微积分是研究连续变化的数学分支... 积分与导数的动画展示。",
    descGeometry: "探索形状、大小、相对位置和空间性质... 几何学的魅力。",
    descLinear: "向量、向量空间、线性变换和矩阵... 线性代数的本质。",
    descNumber: "研究整数和整数值函数的学问... 数论探秘。",
    descTopology: "研究空间在连续变形下保持不变的性质... 拓扑结构可视。",
    descProbability: "衡量事件发生可能性的数学... 概率与统计。",
    descNotFound: "您寻找的页面不存在。",
    titleNotFound: "404 - 找不到页面",
    
    // TheoremCard
    loading: "加载中...",
    loginToLike: "请登录以点赞视频！",
    noRecords: "暂无可用的可视化内容",
    loginToUploadDesc: "请登录并点击上传来分享你的第一个数学动画！",
    noResultsFor: "未找到符合的结果：",
    uploadedBy: "上传者 ",
    uploadedOn: "上传于 ",
    likes: "喜欢",
    
    // UploadModal
    uploadVideo: "上传可视化项目",
    title: "标题",
    titlePlaceholder: "例如：傅里叶变换的直观解释",
    videoFile: "MP4 视频文件",
    selectFileHint: "点击选择本地的 MP4 视频文件",
    btnUploading: "上传中...",
    btnUpload: "上传视频",
    errInvalidFile: "请选择一个有效的 .mp4 格式文件。",
    errFieldsRequired: "标题和视频文件均为必填项。",
    errLoginRequired: "你需要登录后才能上传视频。",
    errUploadFail: "上传失败",
    errFileTooLarge: "文件大小超过30MB限制",
    uploadCancelled: "上传已取消",
    
    // Upload Modal Labels
    labelL1: "主分类 (可选)",
    labelL2: "二级分类 (可选)",
    labelTags: "标签多选 (可选)",
    placeholderL1: "选择主分类",
    placeholderL2: "选择二级分类",
    btnCancel: "取消",
    
    // 删除
    btnDelete: "删除",
    deleteConfirm: "你确定要删除这段视频吗？此操作无法撤销。",
    errDeleteFail: "删除视频失败。",
    deleteSuccess: "视频已成功删除。",
    
    // Manim 源码
    manimSource: "Manim 源代码 (可选)",
    sourceFileHint: "选择 .py 文件",
    viewCode: "查看代码",
    errInvalidSource: "请选择一个有效的 .py 格式文件作为源码。"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('site_lang') || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('site_lang', lang);
  }, [lang]);

  const t = (key) => {
    if (!translations[lang]) return key;
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
