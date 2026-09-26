import re
import os

app_path = r'C:\Users\vivek\Desktop\LD Projects\ticketsupportfinal\src\App.jsx'

with open(app_path, 'r', encoding='utf-8') as f:
    app_code = f.read()

# 1. Add newTicketOpen state to AdminDashboard
app_code = re.sub(
    r'function AdminDashboard\(\{.*?\}\) \{',
    r'\g<0>\n  const [newTicketOpen, setNewTicketOpen] = useState(false);',
    app_code
)

# 2. Add 'Create ticket' button to AdminDashboard header
header_btn = '''
        <button onClick={() => setNewTicketOpen(true)} className="flex items-center h-[34px] px-4 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
          <span className="text-[12px] font-medium text-[#0C0D0E]">Create ticket</span>
        </button>
'''
app_code = re.sub(
    r'(<h2 className="text-xl md:text-2xl font-bold font-heading".*?</h2>)',
    r'\g<1>' + header_btn,
    app_code
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

# 7. Apply 5MB file limit in handleFileChange of NewTicketModal
app_code = app_code.replace('''
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
''', '''
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    for (let f of files) {
      if (f.size > 5 * 1024 * 1024) {
        alert("File " + f.name + " exceeds the 5MB limit.");
      } else {
        validFiles.push(f);
      }
    }
''').replace("setAttachments(prev => [...prev, ...files]);", "setAttachments(prev => [...prev, ...validFiles]);")

# Same for EmailModal
app_code = app_code.replace('''
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
''', '''
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    for (let f of files) {
      if (f.size > 5 * 1024 * 1024) {
        alert("File " + f.name + " exceeds the 5MB limit.");
      } else {
        validFiles.push(f);
      }
    }
    setAttachments(prev => [...prev, ...validFiles]);
''')

# 8. Use mappings in fetchTickets
app_code = app_code.replace("const requestType = item.requestType || 'Other';", "const requestType = REQUEST_TYPE_MAPPING[item.requestType] || item.requestType || 'Other';")
app_code = app_code.replace("const accountType = item.accountType || 'Customer';", "const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';")

with open('App_final_rebuild.jsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("Done rebuilding App.jsx")
