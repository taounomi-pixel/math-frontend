import os
import re

# Comprehensive mapping of Mojibake to correct Chinese characters
REPLACEMENTS = {
    # LanguageContext / General categories
    "鎷撴墤瀛": "拓扑学",
    "寰Н鍒": "微积分",
    "绾挎€у唬鏁": "线性代数",
    "姒傜巼璁": "概率论",
    "鏁板€煎垎鏋": "数值分析",
    "绂绘暎鏁板": "离散数学",
    "澶嶆暟鍒嗘瀽": "复变函数",
    "鎷撴墤瀛?": "拓扑学",
    "鎵€鏈?": "所有",

    # Header.jsx
    "纭畾瑕佽В缁戦偖绠卞悧锛熻繖鍙兘浼氬奖鍝嶆偍鐨勮处鍙锋壘鍥炪€?": "确定要解除邮箱绑定吗？这可能会影响您的账号找回。",
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
    
    # Random fixes for fragmented corruption
    "鏇存柊": "更新",
    "失败": "失败",
    "验证": "验证",
    "登录": "登录",
    "注册": "注册",
    "鎴愬姛": "成功",
    "澶辫触": "失败",
    "鍙戦€?": "发送",
    "璇疯緭鍏?": "请输入",
    "纭畾": "确定",
    "鍙栨秷": "取消",
}

def restore_file(file_path):
    changed = False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for mojibake, correct in REPLACEMENTS.items():
            if mojibake in new_content:
                new_content = new_content.replace(mojibake, correct)
                changed = True
        
        # Specific fix for syntax errors like '发送失败);
        if "发送失败);" in new_content:
            new_content = new_content.replace("发送失败);", "发送失败');")
            changed = True

        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Restored: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    src_dir = r"d:\Desktop\数学可视化平台\math-frontend\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx')):
                restore_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
