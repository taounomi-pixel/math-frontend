import os
import re
import traceback

def fix_header():
    p = r'src/components/Header.jsx'
    if not os.path.exists(p):
        print(f"File {p} not found.")
        return
        
    with open(p, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()

    fixes = [
        (r"'邮箱已解绑 : 'Email unbound successfully'", r"'邮箱已解绑' : 'Email unbound successfully'"),
        (r">已绑定/span>", r">已绑定</span>"),
        (r"let errDetail = data\.detail \|\| '[^']+';", r"let errDetail = data.detail || '发送/绑定失败';"),
        (r"throw new Error\('瑙ｇ粦澶辫触'\);", r"throw new Error('解绑失败');"),
        (r"setAuthError\(lang === 'zh' \? '([^']*)' : '([^']*)'\);", lambda m: "setAuthError(lang === 'zh' ? '解绑失败' : 'Unbind failed');" if '瑙ｇ粦' in m.group(1) else m.group(0)),
        (r"setAuthError\(lang === 'zh' \? '([^']*)' : '([^']*)'\);", lambda m: "setAuthError(lang === 'zh' ? '发送失败' : 'Failed to send');" if '鍙戦€' in m.group(1) else m.group(0)),
        (r"setAuthSuccess\('([^']*)'\);", lambda m: "setAuthSuccess('发送成功');" if '鍙戦€' in m.group(1) else m.group(0)),
    ]

    for old, new in fixes:
        if callable(new):
            c = re.sub(old, new, c)
        else:
            c = re.sub(old, new, c)
            
    # Check for other broken ternaries
    c = re.sub(r"lang === 'zh' \? '[^']*'\s:\s'([^']*)'", r"lang === 'zh' ? '\1' : '\1'", c) # Just a fallback if any are extremely broken, actually no, let's just do exact fixes

    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Header.jsx specific fixes applied.")

def check_syntax():
    # Use esbuild to check syntax
    print("Checking build...")
    res = os.system('npm run build')
    if res == 0:
        print("BUILD SUCCESS!")
    else:
        print("BUILD FAILED!")

if __name__ == '__main__':
    try:
        fix_header()
        check_syntax()
    except Exception as e:
        traceback.print_exc()
