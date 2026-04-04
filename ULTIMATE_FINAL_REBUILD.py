import os
import re

def final_rebuild():
    ref = r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\Header.jsx'
    target = 'src/components/Header.jsx'
    
    with open(ref, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. FIXED TERNARY REPLACEMENTS (Surgical, avoiding Mojibake matching failure)
    # The pattern: lang === 'zh' ? 'SOME_STUFF : '
    # We fix the missing closing quote before the colon
    content = re.sub(r"(lang === 'zh' \?\s+')([^']*)(?=\s+:\s+')", r"\1\2'", content)
    
    # The pattern: lang === 'zh' ? `SOME_STUFF : `
    # We fix the missing closing backtick before the colon (Line 949!)
    content = re.sub(r"(lang === 'zh' \?\s+`)([^`]*)(?=\s+:\s+`)", r"\1\2`", content)
    
    # 2. LABELS MAP (Common phrases)
    m = {
        "纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€?": "确定要解绑邮箱吗？这可能会影响您的账号找回。",
        "纭畾瑕佽В闄や笌 ${provider} 鐨勭粦瀹氬悧锛?": "确定要解除与 ${provider} 的绑定吗？",
        "鏇存崲鏂伴偖绠?": "更换新邮箱",
        "閭宸茶В缁?": "邮箱已解绑",
        "璇疯緭鍏ユ湁鏁堢殑鐢靛瓙閭": "请输入有效的电子邮箱",
        "鍙戦€佸け璐?": "发送失败",
        "鏇存柊澶辫触": "更新失败",
        "閭宸叉垚鍔熸洿鏂?": "邮箱已成功更新",
        "瑙ｇ粦澶辫触": "解绑失败",
        "楠岃瘉澶辫触": "验证失败",
        "鍙戦€佸け璐": "发送失败",
        "宸茬粦瀹?/span>": "已绑定</span>",
        "鏈粦瀹?/span>": "未锁定</span>",
        "宸茬粦瀹?span>": "已绑定</span>",
        "宸茬粦瀹?": "已绑定",
        "鈫?": "→",
        "鍙戦€佹垚鍔": "发送成功",
        "楠岃瘉鎴愬姛": "验证成功",
        "鍙戠敓鏈煡閿欒": "发生未知错误",
        "鏈嶅姟鍣ㄦ繛鎺ュけ璐ワ紝璇风◢鍚庡啀璇": "服务器连接失败，请稍后再试",
        "鏈嶅姟鍣ㄦ鍦ㄤ惎鍔ㄤ腑锛岃绛夊緟绾?0绉掑悗鍐嶈瘯": "服务器正在启动中，请等待约30秒后再试",
        "瑙ｇ粦": "解绑",
        "缁戝畾": "绑定",
        "鎴愬姛": "成功",
        "澶辫触": "失败",
        "閭": "邮箱",
    }
    for k, v in m.items():
        content = content.replace(k, v)

    # 3. EXTRA SYNTAX SAFETY (Common swallow targets)
    content = content.replace("data.detail || '鍙戦€佸け璐?", "data.detail || '发送失败'")
    content = content.replace("throw new Error('瑙ｇ粦澶辫触')", "throw new Error('解绑失败')")
    
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("FINISHED Header.jsx REBUILD.")

    # Rest of files
    for f_name in ['src/components/UploadModal.jsx', 'src/components/CommentItem.jsx']:
        p = os.path.join(r'd:\Desktop\数学可视化平台\数学可视化网站', f_name)
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                c = f.read()
            for k, v in m.items():
                c = c.replace(k, v)
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f"FINISHED {f_name} REBUILD.")

if __name__ == "__main__":
    final_rebuild()
