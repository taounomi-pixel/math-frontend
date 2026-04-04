import os

def restore_extra_files():
    files = ['src/components/UploadModal.jsx', 'src/components/CommentItem.jsx']
    
    restoration_map = {
        "鉁?": "✅",
        "馃弫": "🏁",
        "上传成功，正在同步...": "上传成功，正在同步...",
        "服务器处理中...": "服务器处理中...",
        "楠岃瘉澶辫触": "验证失败",
        "鍙戦€佸け璐": "发送失败",
        "鏇存崲": "更换",
        "纭": "确认",
        "鍙栨秷": "取消",
        "鎴愬姛": "成功",
        "澶辫触": "失败",
    }

    for f_path in files:
        if not os.path.exists(f_path): continue
        with open(f_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        for old, new in restoration_map.items():
            content = content.replace(old, new)
            
        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Restored {f_path} Mojibake.")

if __name__ == "__main__":
    restore_extra_files()
