import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract DarkSelect
dark_select = re.search(r'function DarkSelect.*?^}', content, re.DOTALL | re.MULTILINE).group(0)
with open('DarkSelect.js', 'w', encoding='utf-8') as f:
    f.write(dark_select)

# Extract FilterSelect
filter_select = re.search(r'function FilterSelect.*?^}', content, re.DOTALL | re.MULTILINE).group(0)
with open('FilterSelect.js', 'w', encoding='utf-8') as f:
    f.write(filter_select)

# Extract PillButton
pill_button = re.search(r'function PillButton.*?^}', content, re.DOTALL | re.MULTILINE).group(0)
with open('PillButton.js', 'w', encoding='utf-8') as f:
    f.write(pill_button)

print("Extracted helper components")
