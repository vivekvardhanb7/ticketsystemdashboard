import json
import re

input_file = r"C:\Users\vivek\.gemini\antigravity\brain\285c3e49-55d9-46ab-973c-3790f366588b\.system_generated\logs\transcript_full.jsonl"
lines_dict = {}

with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if 'App.jsx' in content and 'The following code has been modified to include a line number before every line' in content:
                parts = content.split('remove the line number, colon, and leading space.\n')
                if len(parts) > 1:
                    code_block = parts[1]
                    for code_line in code_block.split('\n'):
                        match = re.match(r'^(\d+): ?(.*)$', code_line)
                        if match:
                            num = int(match.group(1))
                            text = match.group(2)
                            lines_dict[num] = text
        except:
            pass

if lines_dict:
    max_line = max(lines_dict.keys())
    with open('reconstructed_App.jsx', 'w', encoding='utf-8') as out:
        for i in range(1, max_line + 1):
            out.write(lines_dict.get(i, f"// MISSING LINE {i}") + '\n')
    print(f"Reconstructed up to line {max_line}")
