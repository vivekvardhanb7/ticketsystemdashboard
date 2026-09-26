import re

with open('extracted_modal.js', 'r', encoding='utf-8') as f:
    modal_content = f.read()

# Strip metadata
modal_content = re.sub(r'^.*?1592: function', 'function', modal_content, flags=re.DOTALL)
# Strip line numbers
modal_content = re.sub(r'^\d+: ', '', modal_content, flags=re.MULTILINE)

# Also strip any trailing text like "The above content does NOT show the entire file contents."
modal_content = re.sub(r'The above content does NOT show the entire file contents\..*$', '', modal_content, flags=re.DOTALL)

with open('extracted_modal_clean.js', 'w', encoding='utf-8') as f:
    f.write(modal_content)

# Now rebuild App.jsx again
with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\rebuild_app.py', 'r', encoding='utf-8') as f:
    script = f.read()

script = script.replace("'extracted_modal.js'", "'extracted_modal_clean.js'")

with open('rebuild_app2.py', 'w', encoding='utf-8') as f:
    f.write(script)
