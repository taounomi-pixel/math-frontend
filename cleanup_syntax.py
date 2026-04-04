import os
import re

# Pattern: Starts with number(s), a colon, and optional space
# We use re.UNICODE just in case, but usually \d is fine.
prefix_pattern = re.compile(r'^\d+:\s?')

def cleanup_file(filepath):
    try:
        # Use utf-8-sig to automatically strip the BOM
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        print(f"Skipping {filepath} due to encoding issues (not UTF-8)")
        return False

    new_lines = []
    changed = False
    
    for i, line in enumerate(lines):
        if prefix_pattern.match(line):
            new_line = prefix_pattern.sub('', line, count=1)
            new_lines.append(new_line)
            changed = True
        else:
            new_lines.append(line)
            
    if changed:
        # Save back as UTF-8 (without BOM, usually better for web dev)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"FIXED: {filepath}")
        return True
    return False

root_dir = r"d:\Desktop\数学可视化平台\math-frontend\src"

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css', '.json')):
            cleanup_file(os.path.join(root, file))
