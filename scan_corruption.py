import os
import re
import json

def scan_files(directory):
    results = {}
    # Expanded mojibake pattern to catch common corruption characters
    mojibake_pattern = re.compile(r'[\u4e00-\u9fa5\u2E80-\u9FFF]{2,}') # At least 2 Chinese characters in sequence
    # Many mojibake strings look like this: 璇峰厛鐧诲綍
    # Let's try to detect non-UTF8 strings interpreted as UTF8
    
    # Common Mojibake signature: high concentration of rarely used chars or common "Mojibake chars"
    mojibake_signature = re.compile(r'[鍓嶉爮璇峰厛鐧诲綍鍚庡嵆鍙彂琛ㄨ瘎璁?]+')

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.json')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    corrupted_lines = []
                    mojibake_lines = []
                    for i, line in enumerate(lines):
                        # Detect line number prefix corruption
                        if re.match(r'^\d+:\s', line):
                            corrupted_lines.append((i+1, line.strip()))
                        
                        # Detect Mojibake
                        if mojibake_signature.search(line):
                            mojibake_lines.append((i+1, line.strip()))
                            
                    if corrupted_lines or mojibake_lines:
                        results[path] = {
                            "total_lines": len(lines),
                            "corrupted_count": len(corrupted_lines),
                            "corrupted_lines_sample": corrupted_lines[:5],
                            "mojibake_detected": len(mojibake_lines) > 0,
                            "mojibake_lines_sample": mojibake_lines[:10]
                        }
                except Exception as e:
                    print(f"Error reading {path}: {e}")
                    
    with open('scan_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    scan_files('d:\\Desktop\\数学可视化平台\\math-frontend\\src')
