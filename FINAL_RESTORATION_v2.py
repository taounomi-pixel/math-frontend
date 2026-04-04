import os
import re

def final_restore_all():
    target_path = 'src/components/Header.jsx'
    if not os.path.exists(target_path): return

    with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. FIX TERNARY SYNTAX ERRORS (Missing closing quotes/backticks)
    # Fix '...' swallowing delimiters
    content = re.sub(r"(lang === 'zh' \?\s+')([^']*)(?=\s+:\s+')", r"\1\2'", content)
    # Fix `...` swallowing delimiters
    content = re.sub(r"(lang === 'zh' \?\s+`)([^`]*)(?=\s+:\s+`)", r"\1\2`", content)
    # Fix cases where punctuation swallows quotes, e.g., 'Text? :
    content = re.sub(r"(lang === 'zh' \?\s+')([^']+\?)(?=\s+:\s+')", r"\1\2'", content)

    # 2. RESTORE CHINESE LABELS (Master restoration map)
    restoration_map = {
        "纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€?": "确定要解绑邮箱吗？这将无法找回账号。",
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
        "璇疯緭鍏": "请输入",
        "楠岃瘉鐮": "验证码",
        "鍙戦€": "发送",
        "纭": "确认",
        "鍙栨秷": "取消",
        "鏇存柊": "更新",
        "淇濆瓨": "保存",
        "娉ㄩ攢": "注销",
        "鐧诲綍": "登录",
        "鏇存崲": "更换",
    }

    for old, new in restoration_map.items():
        content = content.replace(old, new)

    # 3. SAFETY: Manual fix for L2375 specifically
    content = content.replace("'更换新邮箱 : 'Change to new email'", "'更换新邮箱' : 'Change to new email'")

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("FINISHED ALL RESTORATIONS.")

if __name__ == "__main__":
    final_restore_all()
