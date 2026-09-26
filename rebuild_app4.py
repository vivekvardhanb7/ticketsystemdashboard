import re

with open(r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# 1. Add newTicketOpen state to AdminDashboard (safe insert)
app_code = re.sub(
    r'(function AdminDashboard\(\{.*?\}\) \{\n)',
    r'\g<1>  const [newTicketOpen, setNewTicketOpen] = useState(false);\n',
    app_code,
    count=1
)

# 2. Add 'Create ticket' button to AdminDashboard
# Find `<div className="space-y-4 md:space-y-8">`
# and insert a flex container with a title and the button
header = '''
      <div className="flex justify-between items-center bg-[#111215] p-4 rounded-xl border border-[#24262B]">
        <h2 className="text-xl font-bold font-heading" style={{ color: COLORS.text.heading }}>Support Tickets</h2>
        <button onClick={() => setNewTicketOpen(true)} className="flex items-center h-[34px] px-4 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
          <span className="text-[12px] font-bold text-[#0C0D0E]">+ New Ticket</span>
        </button>
      </div>
'''
app_code = app_code.replace(
    '<div className="space-y-4 md:space-y-8">',
    '<div className="space-y-4 md:space-y-8">\n' + header
)

# 3. Add <NewTicketModal /> at the bottom of AdminDashboard
modal_comp = '''
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={(ticket) => setTickets(prev => [ticket, ...prev])}
        isAuthenticated={isAuthenticated} 
      />
'''
app_code = re.sub(
    r'(\{emailTicket && <EmailModal)',
    modal_comp + r'      \1',
    app_code
)

# 4. Append DarkSelect and NewTicketModal to the end of the file
with open('DarkSelect.js', 'r', encoding='utf-8') as f:
    dark_select = f.read()
with open('extracted_modal_clean.js', 'r', encoding='utf-8') as f:
    new_ticket_modal = f.read()

app_code += '\n\n' + dark_select + '\n\n' + new_ticket_modal

# 5. Fix CORS in NewTicketModal
app_code = app_code.replace("fetch('https://testing-api.naf-cloudsystem.de/api/NAFWebsite/support-issues'", "fetch('/api/NAFWebsite/support-issues'")

# 6. Apply mapping in App.jsx
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
app_code = app_code.replace("import { createRoot } from 'react-dom/client';", "import { createRoot } from 'react-dom/client';\n" + mapping_code)

# 7. Apply 5MB file limit in handleFileChange of NewTicketModal and EmailModal
app_code = re.sub(
    r'const handleFileChange = \(e\) => \{\s*const files = Array\.from\(e\.target\.files\);\s*setAttachments\(prev => \[\.\.\.prev, \.\.\.files\]\);',
    '''const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    for (let f of files) {
      if (f.size > 5 * 1024 * 1024) {
        alert("File " + f.name + " exceeds the 5MB limit.");
      } else {
        validFiles.push(f);
      }
    }
    setAttachments(prev => [...prev, ...validFiles]);''',
    app_code
)

# 8. Use mappings in fetchTickets
app_code = app_code.replace("const requestType = item.requestType || 'Other';", "const requestType = REQUEST_TYPE_MAPPING[item.requestType] || item.requestType || 'Other';")
app_code = app_code.replace("const accountType = item.accountType || 'Customer';", "const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("Done rebuilding App.jsx!")
