import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    head = f.read()

with open('reconstructed_AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    figma = f.read()

# 1. State from Figma
match_state = re.search(r'(?sm)(^function AdminDashboard.*?const handleStatusChange = async)', figma)
state_block = match_state.group(1).replace('const handleStatusChange = async', '')

# 2. Methods from HEAD
# We want from handleStatusChange up to `return (` in AdminDashboard
match_methods = re.search(r'(?sm)(^\s*const handleStatusChange = async.*?)(?=^\s*return \(\s*<div)', head)
methods_block = match_methods.group(1)

# 3. Return block from Figma
match_return = re.search(r'(?sm)(^\s*return \(\s*<div className="flex flex-col gap-5">.*)', figma)
return_block = match_return.group(1)

# Assemble AdminDashboard
admin_dashboard = state_block + methods_block + return_block

# Clean up AdminDashboard
admin_dashboard = re.sub(r'// MISSING LINE \d+\n?', '', admin_dashboard)
admin_dashboard = re.sub(r'(const \[newTicketOpen, setNewTicketOpen\] = useState\(false\);\s*){2,}', r'\1', admin_dashboard)
if '<NewTicketModal' not in admin_dashboard:
    admin_dashboard = admin_dashboard.replace('{emailTicket && <EmailModal', '<NewTicketModal isOpen={newTicketOpen} onClose={() => setNewTicketOpen(false)} onTicketCreated={(t) => setTickets(p => [t, ...p])} isAuthenticated={isAuthenticated} />\n      {emailTicket && <EmailModal')

# Write it out
with open('temp_dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(admin_dashboard)

print("Dashboard assembled!")
