import re

with open('extracted_modal.js', 'r', encoding='utf-8') as f:
    modal_content = f.read()

# Strip metadata
modal_content = re.sub(r'^.*?1592: function', 'function', modal_content, flags=re.DOTALL)
# Strip line numbers
modal_content = re.sub(r'^\d+: ', '', modal_content, flags=re.MULTILINE)

# Also strip any trailing text like "The above content does NOT show the entire file contents."
modal_content = re.sub(r'The above content does NOT show the entire file contents\..*$', '', modal_content, flags=re.DOTALL)

# Because this file had AdminTicketRow at the end previously, I'll extract NewTicketModal properly.
def extract_func(code, name):
    match = re.search(r'function\s+' + name + r'\s*\([^)]*\)\s*\{', code)
    if not match: return ""
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

clean_modal = extract_func(modal_content, 'NewTicketModal')

with open('extracted_modal_clean.js', 'w', encoding='utf-8') as f:
    f.write(clean_modal)

print("Restored extracted_modal_clean.js")
