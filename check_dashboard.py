import re

with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx', 'r', encoding='utf-8') as f:
    head_content = f.read()

with open('reconstructed_AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

# The missing lines in AdminDashboard were at 1011 to 1027.
# Let's see what function is right before the missing lines in AdminDashboard.
lines = dashboard_content.split('\n')
for i, line in enumerate(lines):
    if 'MISSING LINE' in line:
        print("Missing line found around:")
        print('\n'.join(lines[max(0, i-5):min(len(lines), i+15)]))
        break
