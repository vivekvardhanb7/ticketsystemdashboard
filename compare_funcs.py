import re
import sys

def get_funcs(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We'll just look for function declarations
    funcs = re.findall(r'^function\s+([A-Za-z0-9_]+)\s*\(', content, re.MULTILINE)
    return set(funcs)

funcs_recon = get_funcs('reconstructed_App.jsx')
funcs_head = get_funcs(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx')

print("Functions in reconstructed not in HEAD:")
for f in funcs_recon - funcs_head:
    print(f)

print("\nFunctions in HEAD not in reconstructed:")
for f in funcs_head - funcs_recon:
    print(f)
