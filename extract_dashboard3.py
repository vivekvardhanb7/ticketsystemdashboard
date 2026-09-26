import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'function AdminDashboard.*?(?=function AdminTicketRow)', content, re.DOTALL)
if match:
    with open('reconstructed_AdminDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(match.group(0))
    print("Extracted properly")
