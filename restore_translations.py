import os

file_path = r'd:\Desktop\数学可视化平台\math-frontend\src\contexts\LanguageContext.jsx'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Standard translations for the garbled block (Lines 220-261 approximately)
replacements = {
    'loginFail': '登入失败',
    'regFail': '注册失败',
    'regSuccess': '注册成功！请登入。',
    'registrationDisabled': '传统注册已禁用。请使用 GitHub 或 Google 注册。',
    'verificationRequiredTitle': '身份验证',
    'verificationRequiredDesc': '此账号已绑定到 {provider}。请验证您的身份以继续。',
    'loginWithGithub': '使用 GitHub 登录',
    'loginWithGoogle': '使用 Google 登录',
    'registerWithGithub': '通过 GitHub 验证',
    'registerWithGoogle': '通过 Google 验证',
    'orUsePassword': '或使用用户名密码',
    'orRegisterDirect': '或直接注册',
    'registerStep1Desc': '先通过 GitHub 或 Google 验证身份，然后设置用户名和密码。',
    'completeRegTitle': '完善账户信息',
    'completeRegDesc': '请设置您的用户名和密码来完成账户创建。',
    'verifiedSuccess': '验证成功！',
    'usernamePlaceholder': '请输入用户名',
    'passwordPlaceholder': '设置密码（至少 6 位）',
    'finishRegistration': '完成注册',
    'bindAccount': '绑定账号',
    'bindAccountTitle:': '绑定第三方账号', # Note the colon in some keys might be garbled or missing
    'bindAccountDesc': '绑定 GitHub 或 Google 账号，下次登录更方便。',
    'bindGithub': '绑定 GitHub',
    'bindGoogle': '绑定 Google',
    'unbindGithub': '解绑 GitHub',
    'unbindGoogle': '解绑 Google',
    'unbindConfirm': '你确定要解绑该账号吗？解绑后将无法再使用此第三方账号登录。',
    'notBound': '未绑定',
    'boundTo': '已绑定',
    'profileCardTitle': '个人资料与管理',
    'accountSecurity': '账号与安全',
    'bindEmail': '绑定邮箱',
    'emailBound': '邮箱已绑定',
    'emailNotBound': '未绑定邮箱',
    'bindConfirm': '确认绑定',
    'bindingSuccess': '绑定成功！',
    'verificationSent': '验证码已发送！',
    'enterValidEmail': '请输入有效的电子邮箱',
}

# We will look for keys in lines 220-261 and replace the entire line
for i in range(219, 261): # 0-indexed for lines 220-261
    line = lines[i]
    for key, value in replacements.items():
        if key in line:
            # Reconstruct the line preserving indentation
            indent = line[:line.find(key)]
            lines[i] = f'{indent}{key}: "{value}",\n'
            break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Restoration complete.")
