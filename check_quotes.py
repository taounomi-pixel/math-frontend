import os

def check_unbalanced_quotes():
    path = 'src/components/Header.jsx'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i, line in enumerate(f):
            # Simple count (ignoring escaped ones for now)
            sq = line.count("'")
            dq = line.count('"')
            bt = line.count('`')
            
            if sq % 2 != 0 or dq % 2 != 0 or bt % 2 != 0:
                # Potential issue, especially if it contains lang === 'zh'
                if 'lang ===' in line or 'provider' in line or 'window.confirm' in line:
                    print(f"Potential Syntax Error on Line {i+1}: {line.strip()}")

if __name__ == "__main__":
    check_unbalanced_quotes()
