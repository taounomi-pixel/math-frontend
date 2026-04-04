import re
import os

def surgical_fix_header():
    path = r'src/components/Header.jsx'
    if not os.path.exists(path):
        print(f"File {path} not found.")
        return

    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. Fix Mojibake swallowing quotes/colons in common patterns
    # pattern: lang === 'zh' ? 'Mojibake : '
    patterns = [
        (r"lang === 'zh' \? '纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€? : ", "lang === 'zh' ? '确定要解绑邮箱吗？这可能会影响您的账号找回。' : "),
        (r"lang === 'zh' \? '閭宸茶В缁? : ", "lang === 'zh' ? '邮箱已解绑' : "),
        (r"lang === 'zh' \? '璇疯緭鍏ユ湁鏁堢殑鐢靛瓙閭' : ", "lang === 'zh' ? '请输入有效的电子邮箱' : "),
        (r"lang === 'zh' \? '鍙戦€佸け璐? : ", "lang === 'zh' ? '发送失败' : "),
        (r"lang === 'zh' \? '鏇存崲鏂伴偖绠? : ", "lang === 'zh' ? '更换新邮箱' : "),
        (r"lang === 'zh' \? '纭鏇存崲' : ", "lang === 'zh' ? '确认更换' : "),
        (r"lang === 'zh' \? '瑙ｇ粦鎴愬姛' : ", "lang === 'zh' ? '解绑成功' : "),
        (r"lang === 'zh' \? '閭宸叉垚鍔熸洿鏂? : ", "lang === 'zh' ? '邮箱已成功更新' : "),
    ]

    for old, new in patterns:
        content = content.replace(old, new)

    # 2. Fix broken JSX tags
    tag_fixes = [
        (r"宸茬粦瀹?/span>", r"已绑定</span>"),
        (r"鏈粦瀹?/span>", r"未绑定</span>"),
        (r"宸茬粦瀹?span>", r"已绑定</span>"),
        (r"宸茬粦瀹?", r"已绑定"),
    ]
    for old, new in tag_fixes:
        content = content.replace(old, new)

    # 3. Restore all other common Mojibake phrases
    restoration_map = {
        "瑙ｇ粦澶辫触": "解绑失败",
        "楠岃瘉澶辫触": "验证失败",
        "鍙戦€佸け璐": "发送失败",
        "缁戝畾澶辫触": "绑定失败",
        "缁戝畾鎴愬姛": "绑定成功",
        "鍙戦€佹垚鍔": "发送成功",
        "楠岃瘉鎴愬姛": "验证成功",
        "鍙戠敓鏈煡閿欒": "发生未知错误",
        "鏈嶅姟鍣ㄦ繛鎺ュけ璐ワ紝璇风◢鍚庡啀璇": "服务器连接失败，请稍后再试",
        "鏈嶅姟鍣ㄦ鍦ㄥ惎鍔ㄤ腑锛岃绛夊緟绾?0绉掑悗鍐嶈瘯...": "服务器正在启动中，请等待约30秒后再试...",
        "绗鏂硅处鍙风粦瀹": "第三方账号绑定",
        "鐢靛瓙閭": "电子邮箱",
        "瀵嗙爜": "密码",
        "鐧诲綍": "登录",
        "娉ㄩ攢鐧诲綍": "注销登录",
        "纭畾": "确定",
        "鍙栨秷": "取消",
        "閭": "邮箱",
        "鏇存柊": "更新",
        "淇濆瓨": "保存",
        "鎴愬姛": "成功",
        "澶辫触": "失败",
        "鏇存崲": "更换",
        "缁戝畾": "绑定",
        "瑙ｇ粦": "解绑",
        "楠岃瘉鐮": "验证码",
        "鑾峰彇楠岃瘉鐮": "获取验证码",
        "璇疯緭鍏": "请输入",
        "鐢ㄦ埛鍚": "用户名",
        "鎵嬫満鍙": "手机号",
        "閭鍦板潃": "邮箱地址",
    }
    
    for old, new in restoration_map.items():
        content = content.replace(old, new)

    # 4. Final safety check for unclosed strings in ternary
    # Match: lang === 'zh' ? 'Text (no closing quote before : or ))
    content = re.sub(r"(lang === 'zh' \? ')([^'\n:]+)(\s?:\s?')", r"\1\2' \3", content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Header.jsx surgical restoration complete.")

if __name__ == "__main__":
    surgical_fix_header()
