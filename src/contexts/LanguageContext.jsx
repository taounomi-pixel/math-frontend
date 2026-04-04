import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Header
    searchPlaceholder: "Search theorems, topics, or creators...",
    langEN: "English (EN)",
    langZH: "绠€浣撲腑鏂?(CN)",
    langFR: "Fran莽ais (FR)",
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
    
    // Account settings / Binding
    bindEmail: "Bind Email",
    emailBound: "Email Linked",
    emailNotBound: "No Email Linked",
    bindConfirm: "Confirm Binding",
    bindingSuccess: "Bound successfully!",
    verificationSent: "Verification code sent!",
    enterValidEmail: "Please enter a valid email",
    
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
    "浠ｆ暟": "Algebra",
    "鍒濈瓑浠ｆ暟": "Elementary Algebra",
    "楂樼瓑浠ｆ暟": "Advanced Algebra",
    "鎶借薄浠ｆ暟": "Abstract Algebra",
    "鍑犱綍": "Geometry",
    "娆у嚑閲屽緱鍑犱綍": "Euclidean Geometry",
    "缃楀反鍒囧か鏂熀鍑犱綍": "Lobachevskian Geometry",
    "榛庢浖鍑犱綍": "Riemannian Geometry",
    "灏勫奖鍑犱綍": "Projective Geometry",
    "瑙ｆ瀽鍑犱綍": "Analytic Geometry",
    "鍒嗗舰鍑犱綍": "Fractal Geometry",
    "寰垎鍑犱綍": "Differential Geometry",
    "浠ｆ暟鍑犱綍": "Algebraic Geometry",
    "鎷撴墤瀛?: "Topology",
    "鍒嗘瀽": "Analysis",
    "寰Н鍒?: "Calculus",
    "瀹炲垎鏋?: "Real Analysis",
    "澶嶅垎鏋?: "Complex Analysis",
    "娉涘嚱鍒嗘瀽": "Functional Analysis",
    "璋冨拰鍒嗘瀽": "Harmonic Analysis",
    "鏁拌": "Number Theory",
    "鍒濈瓑鏁拌": "Elementary Number Theory",
    "瑙ｆ瀽鏁拌": "Analytic Number Theory",
    "浠ｆ暟鏁拌": "Algebraic Number Theory",
    "鍑犱綍鏁拌": "Geometric Number Theory",
    "姒傜巼": "Probability",
    "姒傜巼璁?: "Probability Theory",
    "闅忔満杩囩▼": "Stochastic Process",
    "闅忔満鍒嗘瀽": "Stochastic Analysis",
    "缁熻瀛?: "Statistics",
    
    // Home Page Descriptions
    descWait: "The main video grid will be rendered here.",
    descCalculus: "Calculus is the mathematical study of continuous change... 绉垎涓庡井绉垎鐨勫姩鐢诲睍绀恒€?,
    descGeometry: "Exploring shapes, sizes, relative positions, and properties of space... 鍑犱綍瀛︾殑榄呭姏銆?,
    descLinear: "Vectors, vector spaces, linear transformations, and matrices... 绾挎€т唬鏁扮殑鏈川銆?,
    descNumber: "The study of integers and integer-valued functions... 鏁拌鎺㈢銆?,
    descTopology: "Properties that are preserved through deformations, twistings, and stretchings... 鎷撴墤缁撴瀯鍙銆?,
    descProbability: "The mathematics of measuring the likelihood of events... 姒傜巼涓庣粺璁°€?,
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
    backToGallery: "鈫?Back to Gallery",
    commentsCount: "Comments",
    addCommentPlace: "Add a comment...",
    commonSubmit: "Post",
    loginToComment: "Log in to leave a comment",
    
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
    searchPlaceholder: "鎼滅储瀹氱悊銆佷富棰樻垨鍒涗綔鑰?..",
    langEN: "English (EN)",
    langZH: "绠€浣撲腑鏂?(CN)",
    langFR: "Fran莽ais (FR)",
    upload: "涓婁紶",
    signIn: "鐧诲叆",
    logout: "娉ㄩ攢",
    resultsCount: "涓粨鏋?,
    language: "璇█",
    logoText: "MathVis-瀹氱悊鍙鍖?,
    wakingUp: "姝ｅ湪鍞ら啋鏈嶅姟鍣紝璇风◢鍊?..",
    
    // Auth Modal
    loginTitle: "鐧诲叆",
    registerTitle: "鍒涘缓璐︽埛",
    username: "鐢ㄦ埛鍚?,
    email: "鐢靛瓙閭",
    password: "瀵嗙爜",
    verificationCode: "楠岃瘉鐮?,
    enterOtp: "璇疯緭鍏?浣嶉獙璇佺爜",
    continueBtn: "缁х画",
    createAccountBtn: "鍒涘缓璐︽埛",
    noAccount: "杩樻病鏈夎处鍙凤紵 ",
    hasAccount: "宸茬粡鏈夎处鍙蜂簡锛?",
    signUpLink: "娉ㄥ唽",
    signInLink: "鐧诲叆",
    invalidEmail: "璇疯緭鍏ユ湁鏁堢殑閭",
    getCode: "鑾峰彇楠岃瘉鐮?,
    sending: "鍙戦€佷腑...",
    resendAfter: "{s}绉掑悗閲嶆柊鑾峰彇",
    verificationCodePlaceholder: "璇疯緭鍏?浣嶉獙璇佺爜",
    emailRequired: "鐢靛瓙閭 (蹇呭～)",
    
    loginFail: "鐧诲叆澶辫触",
    regFail: "娉ㄥ唽澶辫触",
    regSuccess: "娉ㄥ唽鎴愬姛锛佽鐧诲叆銆?,
    registrationDisabled: "浼犵粺娉ㄥ唽宸茬鐢ㄣ€傝浣跨敤 GitHub 鎴?Google 娉ㄥ唽銆?,
    verificationRequiredTitle: "韬唤楠岃瘉",
    verificationRequiredDesc: "姝よ处鍙峰凡缁戝畾鍒?{provider}銆傝楠岃瘉鎮ㄧ殑韬唤浠ョ户缁€?,
    
    // OAuth
    loginWithGithub: "浣跨敤 GitHub 鐧诲綍",
    loginWithGoogle: "浣跨敤 Google 鐧诲綍",
    registerWithGithub: "閫氳繃 GitHub 楠岃瘉",
    registerWithGoogle: "閫氳繃 Google 楠岃瘉",
    orUsePassword: "鎴栦娇鐢ㄧ敤鎴峰悕瀵嗙爜",
    orRegisterDirect: "鎴栫洿鎺ユ敞鍐?,
    registerStep1Desc: "鍏堥€氳繃 GitHub 鎴?Google 楠岃瘉韬唤锛岀劧鍚庤缃敤鎴峰悕鍜屽瘑鐮併€?,
    completeRegTitle: "瀹屽杽璐︽埛淇℃伅",
    completeRegDesc: "璇疯缃偍鐨勭敤鎴峰悕鍜屽瘑鐮佹潵瀹屾垚璐︽埛鍒涘缓銆?,
    verifiedSuccess: "楠岃瘉鎴愬姛锛?,
    usernamePlaceholder: "璇疯緭鍏ョ敤鎴峰悕",
    passwordPlaceholder: "璁剧疆瀵嗙爜锛堣嚦灏?浣嶏級",
    finishRegistration: "瀹屾垚娉ㄥ唽",
    bindAccount: "缁戝畾璐﹀彿",
    bindAccountTitle: "缁戝畾绗笁鏂硅处鍙?,
    bindAccountDesc: "缁戝畾 GitHub 鎴?Google 璐﹀彿锛屼笅娆＄櫥褰曟洿鏂逛究銆?,
    bindGithub: "缁戝畾 GitHub",
    bindGoogle: "缁戝畾 Google",
    unbindGithub: "瑙ｇ粦 GitHub",
    unbindGoogle: "瑙ｇ粦 Google",
    unbindConfirm: "浣犵‘瀹氳瑙ｇ粦璇ヨ处鍙峰悧锛熻В缁戝悗灏嗘棤娉曞啀浣跨敤姝ょ涓夋柟璐﹀彿鐧诲綍銆?,
    notBound: "鏈粦瀹?,
    boundTo: "宸茬粦瀹?,
    profileCardTitle: "涓汉璧勬枡涓庣鐞?,
    accountSecurity: "璐﹀彿涓庡畨鍏?,
    
    // 璐﹀彿璁剧疆 / 缁戝畾
    bindEmail: "缁戝畾閭",
    emailBound: "閭宸茬粦瀹?,
    emailNotBound: "鏈粦瀹氶偖绠?,
    bindConfirm: "纭缁戝畾",
    bindingSuccess: "缁戝畾鎴愬姛锛?,
    verificationSent: "楠岃瘉鐮佸凡鍙戦€侊紒",
    enterValidEmail: "璇疯緭鍏ユ湁鏁堢殑鐢靛瓙閭",
    
    // Sidebar & Topics
    "allVideos": "鎵€鏈?,
    "All Topics": "鎵€鏈変富棰?,
    "Calculus": "寰Н鍒?,
    "Geometry": "鍑犱綍瀛?,
    "Linear Algebra": "绾挎€т唬鏁?,
    "Number Theory": "鏁拌",
    "Topology": "鎷撴墤瀛?,
    "Probability": "姒傜巼缁熻",

    // Categories & Tags
    "浠ｆ暟": "浠ｆ暟",
    "鍒濈瓑浠ｆ暟": "鍒濈瓑浠ｆ暟",
    "楂樼瓑浠ｆ暟": "楂樼瓑浠ｆ暟",
    "鎶借薄浠ｆ暟": "鎶借薄浠ｆ暟",
    "鍑犱綍": "鍑犱綍",
    "娆у嚑閲屽緱鍑犱綍": "娆у嚑閲屽緱鍑犱綍",
    "缃楀反鍒囧か鏂熀鍑犱綍": "缃楀反鍒囧か鏂熀鍑犱綍",
    "榛庢浖鍑犱綍": "榛庢浖鍑犱綍",
    "灏勫奖鍑犱綍": "灏勫奖鍑犱綍",
    "瑙ｆ瀽鍑犱綍": "瑙ｆ瀽鍑犱綍",
    "鍒嗗舰鍑犱綍": "鍒嗗舰鍑犱綍",
    "寰垎鍑犱綍": "寰垎鍑犱綍",
    "浠ｆ暟鍑犱綍": "浠ｆ暟鍑犱綍",
    "鎷撴墤瀛?: "鎷撴墤瀛?,
    "鍒嗘瀽": "鍒嗘瀽",
    "寰Н鍒?: "寰Н鍒?,
    "瀹炲垎鏋?: "瀹炲垎鏋?,
    "澶嶅垎鏋?: "澶嶅垎鏋?,
    "娉涘嚱鍒嗘瀽": "娉涘嚱鍒嗘瀽",
    "璋冨拰鍒嗘瀽": "璋冨拰鍒嗘瀽",
    "鏁拌": "鏁拌",
    "鍒濈瓑鏁拌": "鍒濈瓑鏁拌",
    "瑙ｆ瀽鏁拌": "瑙ｆ瀽鏁拌",
    "浠ｆ暟鏁拌": "浠ｆ暟鏁拌",
    "鍑犱綍鏁拌": "鍑犱綍鏁拌",
    "姒傜巼": "姒傜巼",
    "姒傜巼璁?: "姒傜巼璁?,
    "闅忔満杩囩▼": "闅忔満杩囩▼",
    "闅忔満鍒嗘瀽": "闅忔満鍒嗘瀽",
    "缁熻瀛?: "缁熻瀛?,
    
    // Home Page Descriptions
    descWait: "涓昏鐨勮棰戠綉鏍煎皢娓叉煋鍦ㄦ澶勩€?,
    descCalculus: "寰Н鍒嗘槸鐮旂┒杩炵画鍙樺寲鐨勬暟瀛﹀垎鏀?.. 绉垎涓庡鏁扮殑鍔ㄧ敾灞曠ず銆?,
    descGeometry: "鎺㈢储褰㈢姸銆佸ぇ灏忋€佺浉瀵逛綅缃拰绌洪棿鎬ц川... 鍑犱綍瀛︾殑榄呭姏銆?,
    descLinear: "鍚戦噺銆佸悜閲忕┖闂淬€佺嚎鎬у彉鎹㈠拰鐭╅樀... 绾挎€т唬鏁扮殑鏈川銆?,
    descNumber: "鐮旂┒鏁存暟鍜屾暣鏁板€煎嚱鏁扮殑瀛﹂棶... 鏁拌鎺㈢銆?,
    descTopology: "鐮旂┒绌洪棿鍦ㄨ繛缁彉褰笅淇濇寔涓嶅彉鐨勬€ц川... 鎷撴墤缁撴瀯鍙銆?,
    descProbability: "琛￠噺浜嬩欢鍙戠敓鍙兘鎬х殑鏁板... 姒傜巼涓庣粺璁°€?,
    descNotFound: "鎮ㄥ鎵剧殑椤甸潰涓嶅瓨鍦ㄣ€?,
    titleNotFound: "404 - 鎵句笉鍒伴〉闈?,
    
    // TheoremCard
    loading: "鍔犺浇涓?..",
    loginToLike: "璇风櫥褰曚互鐐硅禐瑙嗛锛?,
    noRecords: "鏆傛棤鍙敤鐨勫彲瑙嗗寲鍐呭",
    loginToUploadDesc: "璇风櫥褰曞苟鐐瑰嚮涓婁紶鏉ュ垎浜綘鐨勭涓€涓暟瀛﹀姩鐢伙紒",
    noResultsFor: "鏈壘鍒扮鍚堢殑缁撴灉锛?,
    uploadedBy: "涓婁紶鑰?",
    uploadedOn: "涓婁紶浜?",
    likes: "鍠滄",
    backToGallery: "鈫?杩斿洖棣栭〉",
    commentsCount: "鏉¤瘎璁?,
    addCommentPlace: "娣诲姞璇勮...",
    commonSubmit: "鍙戝竷",
    loginToComment: "鐧诲綍鍚庡嵆鍙彂琛ㄨ瘎璁?,
    
    // UploadModal
    uploadVideo: "涓婁紶鍙鍖栭」鐩?,
    title: "鏍囬",
    titlePlaceholder: "渚嬪锛氬倕閲屽彾鍙樻崲鐨勭洿瑙傝В閲?,
    videoFile: "MP4 瑙嗛鏂囦欢",
    selectFileHint: "鐐瑰嚮閫夋嫨鏈湴鐨?MP4 瑙嗛鏂囦欢",
    btnUploading: "涓婁紶涓?..",
    btnUpload: "涓婁紶瑙嗛",
    errInvalidFile: "璇烽€夋嫨涓€涓湁鏁堢殑 .mp4 鏍煎紡鏂囦欢銆?,
    errFieldsRequired: "鏍囬鍜岃棰戞枃浠跺潎涓哄繀濉」銆?,
    errLoginRequired: "浣犻渶瑕佺櫥褰曞悗鎵嶈兘涓婁紶瑙嗛銆?,
    errUploadFail: "涓婁紶澶辫触",
    errFileTooLarge: "鏂囦欢澶у皬瓒呰繃30MB闄愬埗",
    uploadCancelled: "涓婁紶宸插彇娑?,
    
    // Upload Modal Labels
    labelL1: "涓诲垎绫?(鍙€?",
    labelL2: "浜岀骇鍒嗙被 (鍙€?",
    labelTags: "鏍囩澶氶€?(鍙€?",
    placeholderL1: "閫夋嫨涓诲垎绫?,
    placeholderL2: "閫夋嫨浜岀骇鍒嗙被",
    btnCancel: "鍙栨秷",
    
    // 鍒犻櫎
    btnDelete: "鍒犻櫎",
    deleteConfirm: "浣犵‘瀹氳鍒犻櫎杩欐瑙嗛鍚楋紵姝ゆ搷浣滄棤娉曟挙閿€銆?,
    errDeleteFail: "鍒犻櫎瑙嗛澶辫触銆?,
    deleteSuccess: "瑙嗛宸叉垚鍔熷垹闄ゃ€?,
    
    // Manim 婧愮爜
    manimSource: "Manim 婧愪唬鐮?(鍙€?",
    sourceFileHint: "閫夋嫨 .py 鏂囦欢",
    viewCode: "鏌ョ湅浠ｇ爜",
    errInvalidSource: "璇烽€夋嫨涓€涓湁鏁堢殑 .py 鏍煎紡鏂囦欢浣滀负婧愮爜銆?
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
