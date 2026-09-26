import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract AdminDashboard function
match = re.search(r'function AdminDashboard.*?(?=function|$)', content, re.DOTALL)
if match:
    with open('reconstructed_AdminDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(match.group(0))
    print("Extracted AdminDashboard")
else:
    print("Not found")
