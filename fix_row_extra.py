import re

def extract_func(code, name):
    # Find all occurrences of function name
    matches = list(re.finditer(r'function\s+' + name + r'\s*\([^)]*\)\s*\{', code))
    if not matches: return ""
    # We want the LAST occurrence (since it usually has the latest additions like visibleColumns)
    match = matches[-1]
    start = match.start()
    brace_count = 0
    in_string = False
    string_char = ''
    for i in range(match.end() - 1, len(code)):
        char = code[i]
        if in_string:
            if char == string_char and code[i-1] != '\\':
                in_string = False
        elif char in ('"', "'", '`'):
            in_string = True
            string_char = char
        elif char == '{': brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                return code[start:i+1]
    return ""

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

fixed_row = extract_func(code, 'AdminTicketRow')
with open('AdminTicketRow.js', 'w', encoding='utf-8') as f:
    f.write(fixed_row)

print("Properly fixed AdminTicketRow")
