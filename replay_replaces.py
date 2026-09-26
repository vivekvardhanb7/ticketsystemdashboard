import json
import os

input_file = r"C:\Users\vivek\.gemini\antigravity\brain\285c3e49-55d9-46ab-973c-3790f366588b\.system_generated\logs\transcript_full.jsonl"

app_jsx_path = r"C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx"
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We will sequentially apply every replace_file_content that targeted App.jsx
applied_count = 0

with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'replace_file_content':
                        args = call['args']
                        target_file = args.get('TargetFile', '')
                        if 'App.jsx' in target_file:
                            target_content = args.get('TargetContent', '')
                            replacement = args.get('ReplacementContent', '')
                            if target_content in content:
                                content = content.replace(target_content, replacement)
                                applied_count += 1
                            else:
                                print(f"Warning: Could not find target content for a replace_file_content call.")
        except Exception as e:
            pass

with open('App_restored.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Applied {applied_count} replace operations.")
