import os
import re

def debug_file(filepath):
    print(f"DEBUGGING {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        line = f.readline()
        print(f"Line 1 repr: {repr(line)}")
        print(f"Line 1 hex: {line[:10].encode('utf-8').hex(' ')}")

debug_file(r"d:\Desktop\数学可视化平台\math-frontend\src\App.jsx")
debug_file(r"d:\Desktop\数学可视化平台\math-frontend\src\components\VideoDetail.jsx")
