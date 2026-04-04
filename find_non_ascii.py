import os
import re

def find_unique_non_ascii(root_dir):
    non_ascii_substrings = set()
    # Pattern to match sequences of non-ASCII characters
    pattern = re.compile(r'[^\x00-\x7F]+')
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    matches = pattern.findall(content)
                    for m in matches:
                        non_ascii_substrings.add(m)
    return non_ascii_substrings

if __name__ == "__main__":
    src_dir = r"d:\Desktop\数学可视化平台\math-frontend\src"
    substrings = find_unique_non_ascii(src_dir)
    print("Unique Non-ASCII Substrings found:")
    for s in sorted(substrings):
        print(repr(s))
