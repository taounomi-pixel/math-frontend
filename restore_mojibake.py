import os

REPLACEMENTS = {
    "鐧诲綍鎴愬姛": "登录成功",
    "鐧诲綍澶辫触": "登录失败",
    "娉ㄥ唽澶辫触": "注册失败",
    "娉ㄥ唽鎴愬姛": "注册成功",
    "鍙戦€佸け璐?": "发送失败",
    "楠岃瘉鐮佸凡鍙戦€?": "验证码已发送",
    "楠岃瘉澶辫触": "验证失败",
    "瑙ｇ粦澶辫触": "解绑失败",
    "瑙ｇ粦鎴愬姛": "解绑成功",
    "缁戝畾澶辫触": "绑定失败",
    "缁戝畾鎴愬姛": "绑定成功",
    "鍙戠敓鏈煡閿欒": "发生未知错误",
    "鑾峰彇楠岃瘉鐮佸け璐?": "获取验证码失败",
    "缁戝畾閭澶辫触:": "绑定邮箱失败:",
    "纭畾瑕佽В闄や笌": "确定要解除与",
    "鐨勭粦瀹氬悧锛": "的绑定吗？",
    "鎮诞鐨勭墿鐞嗙櫧鑹叉粦鍧?": "悬浮的物理白色滑块",
    "鎻愬彇绗竴涓瓧绗﹀苟杞负澶у啓锛堝畬缇": "提取第一个字符并转为大写（完美适配",
    "鏈嶅姟鍣ㄦ鍦ㄤ惎鍔ㄤ腑锛岃绛夊緟绾?0绉掑悗鍐嶈瘯...": "服务器正在启动中，请等待约30秒后再试...",
    "鑾峰彇楠岃瘉鐮佹寜閽鐐瑰嚮锛屽綋鍓嶉偖绠辩姸鎬佸€?": "获取验证码按钮被点击，当前邮箱状态值: ",
    "璇疯緭鍏ユ湁鏁堢殑閭鍦板潃": "请输入有效的邮箱地址",
    "鎻愬彇绗竴涓瓧绗﹀苟杞负澶у啓": "提取第一个字符并转为大写",
    "瑙ｇ粦": "解绑",
    "鐧诲綍": "登录",
    "娉ㄥ唽": "注册",
    "楠岃瘉": "验证",
    "鍙戦€?": "发送",
    "澶辫触": "失败",
    "鎴愬姛": "成功",
}

def restore_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original_content = content
    for bad, good in REPLACEMENTS.items():
        content = content.replace(bad, good)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Restored: {file_path}")
    else:
        print(f"No changes: {file_path}")

if __name__ == "__main__":
    src_dir = r"d:\Desktop\数学可视化平台\math-frontend\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx')):
                restore_file(os.path.join(root, file))
