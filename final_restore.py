import os
import re

def restore_language_context():
    path = r"d:\Desktop\数学可视化平台\math-frontend\src\contexts\LanguageContext.jsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Define the core translations block to ensure UTF-8 integrity
    repl_block = """export const translations = {
  zh: {
    // 导航
    "navHome": "首页",
    "navExplore": "探索",
    "navAbout": "关于我们",
    "navSearch": "搜索课程、动画...",
    "navLogin": "登录 / 注册",
    "navUpload": "发布项目",
    "navLanguage": "语言切换",

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
  },"""
    
    # Strategy: Replace from export const translations = { until en: {
    pattern = re.compile(r"export const translations = \{.*?en: \{", re.DOTALL)
    if pattern.search(content):
        new_content = pattern.sub(repl_block + "\n  en: {", content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Restored LanguageContext.jsx")
    else:
        print("Could not find translations block in LanguageContext.jsx")

def restore_sidebar():
    path = r"d:\Desktop\数学可视化平台\math-frontend\src\components\Sidebar.jsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacements = {
        '"鎷撴墤瀛?': '"拓扑学"',
        '"寰Н鍒?': '"微积分"',
        '"绾挎€у唬鏁?': '"线性代数"',
        '"姒傜巼璁?': '"概率论"',
        '"鏁板€煎垎鏋?': '"数值分析"',
        '"绂绘暎鏁板"': '"离散数学"',
        '"澶嶆暟鍒嗘瀽"': '"复分析"',
        "'鎵€鏈?'": "'所有'",
    }
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Restored Sidebar.jsx")

def restore_header():
    path = r"d:\Desktop\数学可视化平台\math-frontend\src\components\Header.jsx"
    with open(path, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')
    
    replacements = {
        "纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€?": "确定要解除邮箱绑定吗？这可能会影响您的账号找回。",
        "閭宸茶В缁?": "邮箱已解绑",
        "璇疯緭鍏ユ湁鏁堢殑鐢靛瓙閭": "请输入有效的电子邮箱",
        "閭宸叉垚鍔熸洿鏂?": "邮箱已成功更新",
        "鏈嶅姟鍣ㄨ繛鎺ュけ璐ワ紝璇风◢鍚庡啀璇?": "服务器连接失败，请稍后再试",
        "OAuth 鏈厤缃?": "OAuth 未配置",
        "鏈嶅姟鍣ㄦ鍦ㄤ惎鍔ㄤ腑锛岃绛夊緟绾?0绉掑悗鍐嶈瘯...": "服务器正在启动中，请等待约30秒后再试...",
        "鍑嗗鍙戣发起 API 璇锋眰": "准备发起 API 请求",
        "寮哄埗缁濆灞呬腑 (淇鎺掔増宕╂簝)": "强制绝对居中 (修复排版崩溃)",
        "鍥哄畾灏哄涓庨槻鎸ゅ帇": "固定尺寸与防挤压",
        "绔嬩綋娑叉€佺幓鐠冩牱寮?": "立体液态玻璃样式",
        "绾櫧鑳屾櫙涓嬬殑绔嬩綋娑叉€佺幓鐠?(寰笎鍙?+ 楂樺厜 + 鎶曞奖)": "纯白背景下的立体液态玻璃 (微渐变 + 高光 + 投影)",
        "瀛椾綋鏍峰紡": "字体样式",
        "閽堝澶уご鍍忎紭鍖?": "针对大头像优化",
        "鏈粦瀹?": "未绑定",
        "宸茬粦瀹?": "已绑定",
        "閫€鍑虹櫥褰?": "退出登录",
        "璐﹀彿璁剧疆": "账号设置",
        "璇烽€夋嫨验证鏂瑰紡": "请选择验证方式",
        "閫氳繃": "通过",
        "鏃犳硶璇嗗埆验证娓犻亾锛岃鑱旂郴绠＄悊鍛?": "无法识别验证渠道，请联系管理员",
        "杈撳叆验证鐮?": "输入验证码",
        "验证鐮佸凡鍙戦€佽嚦": "验证码已发送至",
        "閲嶆柊鑾峰彇": "重新获取",
        "验证涓?..": "验证中...",
        "瀹屾垚登录": "完成登录",
        "杩斿洖閫夋嫨鍏朵粬鏂瑰紡": "返回选择其他方式",
        "浣跨敤鍏朵粬璐﹀彿登录": "使用其他账号登录",
        "缁戝畾绗笁鏂硅处鍙峰悗锛屾偍鍙互浣跨敤璇ヨ处鍙峰揩鎹风櫥褰曪紝骞朵享鍙怰鍙戦€佺櫕褰曪紝...": "绑定第三方账号后，您可以使用该账号快捷登录，并享受双重身份验证保护。",
    }
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    # Syntax fix for missing quotes (like Line 144, 556, 588)
    new_content = new_content.replace("'发送失败);", "'发送失败');")
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Restored Header.jsx")

if __name__ == "__main__":
    restore_language_context()
    restore_sidebar()
    restore_header()
