import re

# Clean DarkSelect.js
with open('DarkSelect.js', 'r', encoding='utf-8') as f:
    ds = f.read()

ds = re.sub(r'^.*?function DarkSelect', 'function DarkSelect', ds, flags=re.DOTALL)
ds = re.sub(r'The above content does NOT show the entire file contents\..*$', '', ds, flags=re.DOTALL)

with open('DarkSelect.js', 'w', encoding='utf-8') as f:
    f.write(ds)

# Fix rebuild_app2.py
with open('rebuild_app2.py', 'r', encoding='utf-8') as f:
    script = f.read()

# Remove the duplication insertion for newTicketOpen
script = re.sub(
    r"app_code = re\.sub\(\n\s*r'function AdminDashboard.*?useState\(false\);',\n\s*app_code\n\)",
    "",
    script,
    flags=re.DOTALL
)
script = script.replace('''# 1. Add newTicketOpen state to AdminDashboard
app_code = re.sub(
    r'function AdminDashboard\(\{.*?\}\) \{',
    r'\\g<0>\\n  const [newTicketOpen, setNewTicketOpen] = useState(false);',
    app_code
)''', '')

with open('rebuild_app3.py', 'w', encoding='utf-8') as f:
    f.write(script)
