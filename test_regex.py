import re
line = "1: import React from 'react';"
prefix_pattern = re.compile(r'^\d+:\s?')
if prefix_pattern.match(line):
    print("Match!")
    new_line = prefix_pattern.sub('', line, count=1)
    print(f"New: '{new_line}'")
else:
    print("No match")
