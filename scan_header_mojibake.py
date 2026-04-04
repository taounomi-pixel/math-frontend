import os

def scan_mojibake(file_path):
    mojibake_lines = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            # Check for common Mojibake patterns or any non-ASCII characters
            # that look like Mojibake (e.g. 鐧诲綍)
            if any(ord(c) > 127 for c in line):
                mojibake_lines.append((i+1, line.strip()))
    return mojibake_lines

if __name__ == "__main__":
    target = r"d:\Desktop\数学可视化平台\math-frontend\src\components\Header.jsx"
    results = scan_mojibake(target)
    for lno, text in results:
        print(f"{lno}: {text}")
