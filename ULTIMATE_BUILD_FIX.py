import os
import re

def ultimate_fix():
    # 1. Header.jsx
    header_ref = r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\Header.jsx'
    header_target = r'src/components/Header.jsx'
    
    if os.path.exists(header_ref):
        with open(header_ref, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # [CRITICAL] Fix line 949 backtick swallow
        # lang === 'zh' ? `纭畾...锛焋 : `Are you sure...`
        # The 锛焋 is the Mojibake for '？' but it lost its closing backtick `
        content = re.sub(
            r"(lang === 'zh' \?\s+`)([^`]*)(?=\s+:\s+`)", 
            r"\1\2`", 
            content
        )
        
        # [CRITICAL] Fix other ternaries with missing quotes
        content = re.sub(
            r"(lang === 'zh' \?\s+')([^']*)(?=\s+:\s+')", 
            r"\1\2'", 
            content
        )

        # Restore common Chinese strings
        restoration_map = {
            "纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋垒鍥炪€?": "确定要解绑邮箱吗？这可能会影响您的账号找回。",
            "纭畾瑕佽В闄や笌 ${provider} 鐨勭粦瀹氬悧锛?": "确定要解除与 ${provider} 的绑定吗？",
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
            "// 鎻愬彇绗竴涓瓧绗﹀苟杞负澶у啓锛堝畬缇庡吋瀹逛腑鑻辨棩鏂囷級": "// 提取第一个字符并转为大写（完美兼容中英日文）",
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

        # Final safety for template literal variables
        content = content.replace("`确定要解除与 ${provider} 的绑定吗？ : ", "`确定要解除与 ${provider} 的绑定吗？` : ")

        with open(header_target, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"ULTIMATE RESTORE: {header_target}")

    # 2. UploadModal.jsx and CommentItem.jsx
    for f_name in ['src/components/UploadModal.jsx', 'src/components/CommentItem.jsx']:
        ref = os.path.join(r'd:\Desktop\数学可视化平台\数学可视化网站', f_name)
        if os.path.exists(ref):
            with open(ref, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            for old, new in restoration_map.items():
                content = content.replace(old, new)
            with open(f_name, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"ULTIMATE RESTORE: {f_name}")

if __name__ == "__main__":
    ultimate_fix()
