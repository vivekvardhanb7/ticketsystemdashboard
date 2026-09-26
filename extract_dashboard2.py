import re

with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to parse matching braces to extract the full AdminDashboard function!
def extract_function(content, func_name):
    match = re.search(r'function\s+' + func_name + r'\s*\([^)]*\)\s*\{', content)
    if not match:
        return None
    start = match.start()
    brace_count = 0
    in_string = False
    string_char = ''
    
    for i in range(match.end() - 1, len(content)):
        char = content[i]
        
        if in_string:
            if char == string_char and content[i-1] != '\\':
                in_string = False
        elif char in ('"', "'", '`'):
            in_string = True
            string_char = char
        elif char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                return content[start:i+1]
    return None

dashboard = extract_function(content, 'AdminDashboard')
if dashboard:
    print(f"HEAD AdminDashboard has {len(dashboard.split())} words, {len(dashboard.split(chr(10)))} lines")
else:
    print("Not found")

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    recon_content = f.read()

recon_dashboard = extract_function(recon_content, 'AdminDashboard')
if recon_dashboard:
    print(f"Reconstructed AdminDashboard has {len(recon_dashboard.split())} words, {len(recon_dashboard.split(chr(10)))} lines")
    with open('recon_dashboard_full.jsx', 'w', encoding='utf-8') as f:
        f.write(recon_dashboard)
else:
    print("Reconstructed not found")

