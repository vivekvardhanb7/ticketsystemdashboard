import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '// MISSING LINE 1487' in line:
        start_idx = i
        while start_idx > 0 and '// MISSING LINE' in lines[start_idx-1]:
            start_idx -= 1
        print("Lines before missing block starting at 1487:")
        print(''.join(lines[start_idx-5:start_idx]))
        
        end_idx = i
        while end_idx < len(lines) and '// MISSING LINE' in lines[end_idx]:
            end_idx += 1
        print("Lines after missing block:")
        print(''.join(lines[end_idx:end_idx+5]))
        break
