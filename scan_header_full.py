import os

def scan_mojibake(file_path):
    mojibake_lines = []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if any(ord(c) > 127 for c in line):
                # Filter out valid Chinese characters usually seen in this codebase
                # like "登录", "注册", "验证", etc.
                # If a line has non-ASCII, but it's not a common valid word, add it
                # For now, let's just show all lines with non-ASCII for manual review
                mojibake_lines.append((i+1, line.strip()))
    return mojibake_lines

if __name__ == "__main__":
    target = r"d:\Desktop\数学可视化平台\math-frontend\src\components\Header.jsx"
    results = scan_mojibake(target)
    with open(r"d:\Desktop\数学可视化平台\math-frontend\header_non_ascii.txt", "w", encoding="utf-8") as f:
        for lno, text in results:
            f.write(f"{lno}: {text}\n")
    print(f"Scanned {len(results)} lines in Header.jsx")
