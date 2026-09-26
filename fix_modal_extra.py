import re

with open('extracted_modal_clean.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Strip anything after NewTicketModal
match = re.search(r'function NewTicketModal.*?(?=function|$)', code, re.DOTALL)
if match:
    with open('extracted_modal_clean.js', 'w', encoding='utf-8') as f:
        f.write(match.group(0))

print("Fixed extracted_modal_clean.js")
