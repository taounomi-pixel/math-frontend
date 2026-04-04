import os

def scientific_restore():
    ref_path = r'd:\Desktop\数学可视化平台\数学可视化网站\src\components\Header.jsx'
    target_path = r'src/components/Header.jsx'
    
    with open(ref_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    # Precise Line Overwrites (using 1-based indexing for clarity)
    # L100
    lines[99] = "    if (!window.confirm(lang === 'zh' ? '确定要解绑邮箱吗？这可能会影响您的账号找回。' : 'Are you sure you want to unbind your email? This may affect account recovery.')) {\n"
    # L115
    lines[114] = "      setAuthSuccess(lang === 'zh' ? '邮箱已解绑' : 'Email unbound successfully');\n"
    # L132
    lines[131] = "      setAuthError(lang === 'zh' ? '请输入有效的电子邮箱' : 'Please enter a valid email');\n"
    # L144
    lines[143] = "      if (!res.ok) throw new Error(data.detail || '发送失败');\n"
    # L169
    lines[168] = "      if (!res.ok) throw new Error(data.detail || '更新失败');\n"
    # L171
    lines[170] = "      setAuthSuccess(lang === 'zh' ? '邮箱已成功更新' : 'Email updated successfully');\n"
    # L272
    lines[271] = "      return lang === 'zh' ? '发生未知错误' : 'An unknown error occurred';\n"
    # L422
    lines[421] = "          setAuthError(lang === 'zh' ? '服务器连接失败，请稍后再试' : 'Server connection failed, please try again');\n"
    # L556
    lines[555] = "      if (!res.ok) throw new Error(data.detail || '发送失败');\n"
    # L588
    lines[587] = "      if (!res.ok) throw new Error(data.detail || '发送失败');\n"
    # L621
    lines[620] = "      if (!res.ok) throw new Error(data.detail || '验证失败');\n"
    # L645
    lines[644] = "      if (!res.ok) throw new Error(data.detail || '发送失败');\n"
    # L679
    lines[678] = "      if (!res.ok) throw new Error(data.detail || '验证失败');\n"
    # L792
    lines[791] = "        setAuthError(lang === 'zh' ? '服务器正在启动中，请等待约30秒后再试...' : 'Server is waking up, please wait ~30s and try again...');\n"
    # L949
    lines[948] = "    if (!window.confirm(lang === 'zh' ? `确定要解除与 ${provider} 的绑定吗？` : `Are you sure you want to unbind ${provider}?`)) {\n"

    # L27 comment
    lines[26] = "  // 提取第一个字符并转为大写（完美兼容中英日文）\n"

    with open(target_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Index-based restoration of {target_path} complete.")

    # Apply global Mojibake cleanup for the rest of the file
    with open(target_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    global_fixes = {
        "宸茬粦瀹?/span>": "已绑定</span>",
        "鏈粦瀹?/span>": "未绑定</span>",
        "宸茬粦瀹?span>": "已绑定</span>",
        "宸茬粦瀹?": "已绑定",
        "瑙ｇ粦": "解绑",
        "缁戝畾": "绑定",
        "鎴愬姛": "成功",
        "澶辫触": "失败",
        "閭": "邮箱",
    }
    for old, new in global_fixes.items():
        content = content.replace(old, new)
    
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    scientific_restore()
