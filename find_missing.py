import os

reconstructed_path = 'reconstructed_App.jsx'
head_path = r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx'

with open(reconstructed_path, 'r', encoding='utf-8') as f:
    r_lines = f.readlines()

with open(head_path, 'r', encoding='utf-8') as f:
    h_lines = f.readlines()

# The problem is that line numbers might not align perfectly because the user added code.
# But we can try to fill in the missing blocks.
out_lines = []
for i, line in enumerate(r_lines):
    if '// MISSING LINE' in line:
        # We need to find the equivalent line from HEAD.
        # This is risky if lines shifted.
        # Let's print out the chunks of missing lines to see what they are.
        pass

# Let's just output the missing line numbers to see the ranges.
missing_ranges = []
current_range = []
for i, line in enumerate(r_lines):
    if '// MISSING LINE' in line:
        current_range.append(i+1)
    else:
        if current_range:
            missing_ranges.append((current_range[0], current_range[-1]))
            current_range = []
if current_range:
    missing_ranges.append((current_range[0], current_range[-1]))

print("Missing line ranges:", missing_ranges)
