import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_head = f.read()

# I will recreate the file entirely from App_figma_final2.jsx by replacing App with HEAD App!

def extract_func(code, name):
    match = re.search(r'export default function ' + name + r'\s*\([^)]*\)\s*\{', code)
    if not match: return ""
    start = match.start()
    brace_count = 0
    in_string = False
    string_char = ''
    for i in range(match.end() - 1, len(code)):
        char = code[i]
        if in_string:
            if char == string_char and code[i-1] != '\\':
                in_string = False
        elif char in ('"', "'", '`'):
            in_string = True
            string_char = char
        elif char == '{': brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                return code[start:i+1]
    return ""

head_app_func = extract_func(app_head, 'App')
# Add the css!
head_app_func = head_app_func.replace(
    'font-family: \'Power Grotesk\', sans-serif;',
    'font-family: \'Power Grotesk\', sans-serif;\n      }\n      .ticket-main-heading {\n        font-family: \'Power Grotesk\', sans-serif;\n      }'
)
# Apply mapping to fetchTickets in head_app_func
head_app_func = re.sub(r'const requestType = item\.requestType \|\| .*?;', "const requestType = REQUEST_TYPE_MAPPING[item.requestType] || item.requestType || 'Other';", head_app_func)
head_app_func = re.sub(r'const accountType = item\.accountType \|\| .*?;', "const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';", head_app_func)

# Load App_figma_final2.jsx
with open('App_figma_final2.jsx', 'r', encoding='utf-8') as f:
    figma = f.read()

# Replace the broken App with the good head_app_func!
# Wait, App_figma_final2.jsx has the broken App at the top.
# Let's rebuild it completely to avoid any broken App from App_root.js
header = app_head[:app_head.find('export default function App() {')]

# We need the custom components from App_figma_final2.jsx
# They are: PillButton, FilterSelect, DarkSelect, QueueStat, AdminTicketRow, TicketDetailPage, EmailModal, NewTicketModal, AdminDashboard

with open('App_figma_final.jsx', 'r', encoding='utf-8') as f:
    orig_figma = f.read()
components_start = orig_figma.find('function PillButton')
custom_components = orig_figma[components_start:]

mapping_code = '''
const REQUEST_TYPE_MAPPING = {
  "technical": "Machine Issue",
  "payment": "Payment / Refund",
  "membership": "NAF Membership",
  "wallet": "NAF Wallet",
  "mobile_app": "Mobile App",
  "naf_cloud": "NAF Cloud System",
  "reservation": "Reservation / Pickup",
  "complaint": "Complaint",
  "feedback": "Feedback / Suggestion",
  "partnership": "Partnership / Business Support",
  "other": "Other"
};

const ACCOUNT_TYPE_MAPPING = {
  "user": "Customer / Guest",
  "member": "NAF Member",
  "business": "Business / Partner",
  "other": "Other",
  "not_collected": "Not collected",
  "Not collected": "Not collected"
};
'''

final = mapping_code + '\n\n' + header + '\n\n' + head_app_func + '\n\n' + custom_components

# ensure no duplicate mappings
final = re.sub(r'(const REQUEST_TYPE_MAPPING = \{.*?\};\n+){2,}', lambda m: m.group(1), final, flags=re.DOTALL)
final = re.sub(r'(const ACCOUNT_TYPE_MAPPING = \{.*?\};\n+){2,}', lambda m: m.group(1), final, flags=re.DOTALL)

with open('App_figma_final3.jsx', 'w', encoding='utf-8') as f:
    f.write(final)
print("Done")
