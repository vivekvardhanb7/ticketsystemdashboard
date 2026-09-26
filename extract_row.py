import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract AdminTicketRow
match = re.search(r'function AdminTicketRow.*?(?=function SkeletonRow|function TicketDetailPage|/\* -------------------------------------------------------------------------- \*/\n/\* SKELETON ROW)', content, re.DOTALL)
if match:
    with open('AdminTicketRow.js', 'w', encoding='utf-8') as f:
        f.write(match.group(0))
    print("Extracted AdminTicketRow")
else:
    print("AdminTicketRow not found")

# We already extracted DarkSelect, FilterSelect, PillButton, NewTicketModal.
# Let's verify we have them.
