import os

with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx', 'r', encoding='utf-8', errors='ignore') as f:
    app = f.read()

# strip out any trailing null bytes or UTF-16 corruption
app = app.replace('\x00', '')
# find where the corruption started
idx = app.find('function DarkSelect')
if idx != -1:
    app = app[:idx]

with open('DarkSelect.js', 'r', encoding='utf-8', errors='ignore') as f:
    ds = f.read().replace('\x00', '')

with open('extracted_modal_clean.js', 'r', encoding='utf-8', errors='ignore') as f:
    modal = f.read().replace('\x00', '')

with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(app + '\n\n' + ds + '\n\n' + modal)
