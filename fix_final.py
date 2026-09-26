import re

with open('App_figma_final.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix duplicates (only keep first occurrence)
match = re.search(r'const REQUEST_TYPE_MAPPING = \{.*?\}\;', code, re.DOTALL)
if match:
    code = code.replace(match.group(0), '')
    code = match.group(0) + '\n\n' + code

match2 = re.search(r'const ACCOUNT_TYPE_MAPPING = \{.*?\}\;', code, re.DOTALL)
if match2:
    code = code.replace(match2.group(0), '')
    code = match2.group(0) + '\n\n' + code

# Fix syntax error
code = re.sub(
    r'(phone: item\.phoneNumber \|\| item\.phone \|\| "",\s*)(//.*?Smart request type inference.*?\s*let requestType)',
    r'\1};\n\n        \2',
    code
)

with open('App_figma_final2.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
