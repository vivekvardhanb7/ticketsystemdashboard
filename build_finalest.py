import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    head = f.read()

with open('temp_dashboard.jsx', 'r', encoding='utf-8') as f:
    admin_dashboard = f.read()

with open('DarkSelect.js', 'r', encoding='utf-8') as f:
    dark_select = f.read()

with open('AdminTicketRow.js', 'r', encoding='utf-8') as f:
    admin_ticket_row = f.read()

with open('temp_ticket_detail.jsx', 'r', encoding='utf-8', errors='ignore') as f:
    ticket_detail = f.read().replace('\x00', '').replace('\ufeff', '')

with open('extracted_modal_clean.js', 'r', encoding='utf-8') as f:
    new_ticket_modal = f.read()

pill_button = """
function PillButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {label}{count != null ? `  ${count}` : ''}
    </button>
  );
}
"""

filter_select = """
function FilterSelect({ value, onChange, options, defaultLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-[34px] pl-3 pr-8 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors outline-none cursor-pointer"
        style={{
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderColor: active ? COLORS.activeBorder : COLORS.border,
          color: active ? COLORS.primary[500] : COLORS.text.body,
        }}
      >
        {active ? value : defaultLabel}
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[10px]" style={{ color: COLORS.text.disabled }}>{open ? '▼' : '▼'}</span>
      </div>
      {open && (
        <div className="absolute top-[38px] left-0 z-50 min-w-[180px] py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[260px] overflow-y-auto">
          <button onClick={() => { onChange('All'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === 'All' ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
            {defaultLabel}
          </button>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
"""

queue_stat = """
function QueueStat({ label, value, subtitle, valueColor }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
      <span className="text-[13px] font-medium" style={{ color: COLORS.text.heading }}>{label}</span>
      <span className="text-[28px] font-bold font-heading" style={{ color: valueColor || COLORS.text.heading }}>{value}</span>
      {subtitle && <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>{subtitle}</span>}
    </div>
  );
}
"""

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

# Extractor for HEAD components
def extract_func(code, name):
    match = re.search(r'function\s+' + name + r'\s*\([^)]*\)\s*\{', code)
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

skeleton_row = extract_func(head, 'SkeletonRow')
skeleton_card = extract_func(head, 'SkeletonCard')
empty_state = extract_func(head, 'EmptyState')
mobile_card = extract_func(head, 'MobileTicketCard')
delete_modal = extract_func(head, 'DeleteModal')

# Assemble App
base_app = head[:head.find('function AdminDashboard')]
base_app = base_app.replace(
    "font-family: 'Power Grotesk', sans-serif;",
    "font-family: 'Power Grotesk', sans-serif;\n      }\n      .ticket-main-heading {\n        font-family: 'Power Grotesk', sans-serif;\n      }"
)
base_app = re.sub(r'const requestType = item\.requestType \|\| .*?;', "const requestType = REQUEST_TYPE_MAPPING[item.requestType] || item.requestType || 'Other';", base_app)
base_app = re.sub(r'const accountType = item\.accountType \|\| .*?;', "const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';", base_app)

base_app = base_app.replace('export default function App() {', mapping_code + '\nexport default function App() {')

full_file = (base_app + "\n\n" + 
             pill_button + "\n\n" + filter_select + "\n\n" + dark_select + "\n\n" + 
             queue_stat + "\n\n" + admin_dashboard + "\n\n" + 
             skeleton_row + "\n\n" + skeleton_card + "\n\n" + empty_state + "\n\n" + mobile_card + "\n\n" + 
             admin_ticket_row + "\n\n" + ticket_detail + "\n\n" + new_ticket_modal + "\n\n" + delete_modal)

# Apply 5MB upload limit and CORS fix
full_file = full_file.replace("fetch('https://testing-api.naf-cloudsystem.de/api/NAFWebsite/support-issues'", "fetch('/api/NAFWebsite/support-issues'")
full_file = re.sub(
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
    full_file
)

with open('App_finalest.jsx', 'w', encoding='utf-8') as f:
    f.write(full_file)

print("Generated App_finalest.jsx")
