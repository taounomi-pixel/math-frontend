import os
import re

def restore_file(ref_path, target_path, extra_replacements=None):
    if not os.path.exists(ref_path):
        print(f"Reference file {ref_path} not found.")
        return
    
    with open(ref_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Core Mojibake Restorations (Manual mapping of specific broken lines)
    replacements = [
        # Ternaries in Header.jsx (swallowing quotes)
        (r"lang === 'zh' \? '纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€? : ", "lang === 'zh' ? '确定要解绑邮箱吗？这可能会影响您的账号找回。' : "),
        (r"lang === 'zh' \? '閭宸茶В缁? : ", "lang === 'zh' ? '邮箱已解绑' : "),
        (r"lang === 'zh' \? '璇疯緭鍏ユ湁鏁堢殑鐢靛瓙閭' : ", "lang === 'zh' ? '请输入有效的电子邮箱' : "),
        (r"lang === 'zh' \? '鍙戦€佸け璐? : ", "lang === 'zh' ? '发送失败' : "),
        (r"lang === 'zh' \? '閭宸叉垚鍔熸洿鏂? : ", "lang === 'zh' ? '邮箱已成功更新' : "),
        (r"lang === 'zh' \? '瑙ｇ粦鎴愬姛' : ", "lang === 'zh' ? '解绑成功' : "),
        (r"lang === 'zh' \? '鍙戦€佹垚鍔? : ", "lang === 'zh' ? '发送成功' : "),
        (r"lang === 'zh' \? '鍙戦€佸け璐?\) : ", "lang === 'zh' ? '发送失败') : "),
        
        # Standalone broken strings
        ("'瑙ｇ粦澶辫触'", "'解绑失败'"),
        ("'鏇存柊澶辫触'", "'更新失败'"),
        ("'楠岃瘉澶辫触'", "'验证失败'"),
        ("'鍙戦€佸け璐'", "'发送失败'"),
        ("'鍙戠敓鏈煡閿欒'", "'发生未知错误'"),
        
        # Comments
        ("// 鎻愬彇绗竴涓瓧绗﹀苟杞负澶у啓锛堝畬缇庡吋瀹逛腑鑻辨棩鏂囷級", "// 提取第一个字符并转为大写（完美兼容中英日文）"),
        
        # JSX Tags
        ("宸茬粦瀹?/span>", "已绑定</span>"),
        ("鏈粦瀹?/span>", "未锁定</span>"),
        ("宸茬粦瀹?span>", "已绑定</span>"),
    ]

    if extra_replacements:
        replacements.extend(extra_replacements)

    for old, new in replacements:
        content = content.replace(old, new)

    # General block restoration for common phrases
    global_map = {
        "瑙ｇ粦": "解绑",
        "缁戝畾": "绑定",
        "鎴愬姛": "成功",
        "澶辫触": "失败",
        "閭": "邮箱",
        "璇疯緭鍏": "请输入",
        "楠岃瘉鐮": "验证码",
        "鍙戦€": "发送",
        "纭": "确认",
        "鍙栨秷": "取消",
        "鏇存柊": "更新",
        "淇濆瓨": "保存",
        "娉ㄩ攢": "注销",
        "鐧诲綍": "登录",
        "娉ㄩ攢鐧诲綍": "注销登录",
        "鏈嶅姟鍣ㄦ繛鎺ュけ璐ワ紝璇风◢鍚庡啀璇": "服务器连接失败，请稍后再试",
        "鏈嶅姟鍣ㄦ鍦ㄤ惎鍔ㄤ腑锛岃绛夊緟绾?0绉掑悗鍐嶈瘯": "服务器正在启动中，请等待约30秒后再试",
        "鏇存崲": "更换",
    }

    for old, new in global_map.items():
        content = content.replace(old, new)

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Perfectly restored {target_path}")

if __name__ == "__main__":
    # Header.jsx
    restore_file(
        r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\Header.jsx',
        r'src/components/Header.jsx'
    )
    # UploadModal.jsx
    restore_file(
        r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\UploadModal.jsx',
        r'src/components/UploadModal.jsx'
    )
    # CommentItem.jsx
    restore_file(
        r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\CommentItem.jsx',
        r'src/components/CommentItem.jsx'
    )
