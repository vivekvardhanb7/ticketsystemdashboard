import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export default function App\(\).*?(?=function AdminLayout|function AdminDashboard|/\* -------------------------------------------------------------------------- \*/\n/\* ADMIN LAYOUT)', content, re.DOTALL)
if match:
    with open('App_root.js', 'w', encoding='utf-8') as f:
        f.write(match.group(0))
    print("Extracted App root")
else:
    print("App root not found")
