import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    head = f.read()

with open('reconstructed_AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    figma = f.read()

parts = re.split(r'/\* -{74} \*/\n/\* (.*?) \*/\n/\* -{74} \*/', head)
header = parts[0]
sections = {}
for i in range(1, len(parts), 2):
    sections[parts[i].strip()] = parts[i+1]

head_admin_dashboard = sections['ADMIN DASHBOARD']
match_head_state = re.search(r'function AdminDashboard.*?\{(\n.*?)\n\s*const stats = useMemo', head_admin_dashboard, re.DOTALL)
head_state = match_head_state.group(1)

combined_state = """
  const [filter, setFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [reqTypeFilter, setReqTypeFilter] = useState('All');
  const [accTypeFilter, setAccTypeFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    reference: true, subject: true, requester: true,
    machine: true, requestType: true, status: true,
  });
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const columnsRef = useRef(null);
  const searchQuery = useDebounce(searchInput, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailTicket, setEmailTicket] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [emailHistory, setEmailHistory] = useState({});

  useEffect(() => {
    const activeTicket = viewTicket || emailTicket;
    if (!activeTicket) return;

    const fetchEmails = async () => {
      try {
        const headers = getAuthHeaders(isAuthenticated);
        const res = await fetch(`/api/NAFWebsite/issue/${activeTicket.id}/emails`, { headers });
        if (res.ok) {
          const data = await res.json();
          const mappedData = data.map(email => ({
            ...email,
            direction: email.direction === 'outbound' ? 'sent' : 'received'
          }));
          setEmailHistory(prev => ({ ...prev, [activeTicket.id]: mappedData }));
        }
      } catch (err) {
        console.error("Failed to fetch email history", err);
      }
    };
    fetchEmails();
  }, [viewTicket, emailTicket, isAuthenticated]);
"""

merged_dashboard = head_admin_dashboard.replace(head_state, combined_state)
match_head_memos = re.search(r'(\s*const stats = useMemo.*?\n  \}, \[.*?\]\);\n)', merged_dashboard, re.DOTALL)
head_memos = match_head_memos.group(1)

figma_memos = """
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const stats = useMemo(() => ({
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length
  }), [tickets]);

  const totalActive = stats.open + stats.inProgress;

  const channelCounts = useMemo(() => {
    const counts = { 'Website form': 0, 'Email': 0, 'WhatsApp': 0 };
    tickets.forEach(t => {
      const ch = t.channel || 'Website form';
      if (counts[ch] !== undefined) counts[ch]++;
      else counts['Website form']++;
    });
    return counts;
  }, [tickets]);

  useEffect(() => {
    const handler = (e) => { if (columnsRef.current && !columnsRef.current.contains(e.target)) setColumnsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => { setCurrentPage(1); }, [filter, channelFilter, reqTypeFilter, accTypeFilter, searchQuery]);

  const filtered = useMemo(() => {
    let result = tickets;

    const statusMap = { 'Open': 'OPEN', 'In Progress': 'IN_PROGRESS', 'Closed': 'CLOSED' };
    if (filter === 'All') {
      result = result.filter(t => t.status !== 'CLOSED');
    } else if (statusMap[filter]) {
      result = result.filter(t => t.status === statusMap[filter]);
    } else if (filter === 'OPEN' || filter === 'IN_PROGRESS' || filter === 'CLOSED') {
      result = result.filter(t => t.status === filter);
    }

    if (channelFilter !== 'All') {
      result = result.filter(t => (t.channel || 'Website form') === channelFilter);
    }

    if (reqTypeFilter !== 'All') {
      result = result.filter(t => {
        const tReq = REQUEST_TYPE_MAPPING[t.requestType] || t.requestType || 'Other';
        return tReq === reqTypeFilter;
      });
    }
    
    if (accTypeFilter !== 'All') {
      result = result.filter(t => {
        const tAcc = ACCOUNT_TYPE_MAPPING[t.accountType] || t.accountType || 'Customer';
        return tAcc === accTypeFilter;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.ticketId || '').toLowerCase().includes(q) ||
        (t.subject || t.problemType || '').toLowerCase().includes(q) ||
        (t.contactPerson || '').toLowerCase().includes(q) ||
        (t.machineNumber || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, filter, channelFilter, reqTypeFilter, accTypeFilter, searchQuery]);\n"""

merged_dashboard = merged_dashboard.replace(head_memos, figma_memos)

match_head_return = re.search(r'(?sm)(\s*return \(\s*<div.*)', merged_dashboard)
head_return = match_head_return.group(1)

match_figma_return = re.search(r'(?sm)(\s*return \(\s*<div className="flex flex-col gap-5">.*)', figma)
figma_return = match_figma_return.group(1)
figma_return = re.sub(r'// MISSING LINE \d+\n?', '', figma_return)

clean_queue_controls = """          <div className="p-4 flex flex-col gap-4">
            {/* Row 1: Status tabs + Search + Columns + Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <PillButton label="All active" count={totalActive} active={filter === 'All'} onClick={() => setFilter('All')} />
              <PillButton label="Open" count={stats.open} active={filter === 'OPEN'} onClick={() => setFilter('OPEN')} />
              <PillButton label="In Progress" count={stats.inProgress} active={filter === 'IN_PROGRESS'} onClick={() => setFilter('IN_PROGRESS')} />
              <PillButton label="Closed" count={stats.closed} active={filter === 'CLOSED'} onClick={() => setFilter('CLOSED')} />
  
              <div className="flex-1" />
  
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, email, phone, reference..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-[36px] w-[322px] pl-3 pr-8 rounded-[7px] border text-xs outline-none transition-colors focus:border-white/20"
                  style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.text.heading }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
  
              {/* Column toggle */}
              <div className="relative" ref={columnsRef}>
                <PillButton label="Columns" active={columnsOpen} onClick={() => setColumnsOpen(!columnsOpen)} />
                {columnsOpen && (
                  <div className="absolute right-0 top-[38px] z-50 w-[200px] py-2 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40">
                    <div className="px-3 pb-2 mb-2 border-b border-[#24262B] text-[10px] font-bold text-[#78828A] uppercase tracking-wider">
                      Toggle Columns
                    </div>
                    {Object.entries({
                      reference: 'Reference ID',
                      subject: 'Subject',
                      requester: 'Requester',
                      machine: 'Machine #',
                      requestType: 'Request Type',
                      status: 'Status'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1A1C20] cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={visibleColumns[key]}
                          onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded-sm border-[#353A40] bg-transparent text-[#47EB3D] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className={`text-xs ${visibleColumns[key] ? 'text-white' : 'text-[#78828A] group-hover:text-white'} transition-colors`}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter panel toggle */}
              <PillButton label="Filter" active={filterPanelOpen} onClick={() => setFilterPanelOpen(!filterPanelOpen)} />
            </div>
  
            {/* Row 2: Channel filters + classification dropdowns */}
            {filterPanelOpen && <div className="flex items-center gap-2 flex-wrap">
              <PillButton label="All channels" count={tickets.length} active={channelFilter === 'All'} onClick={() => setChannelFilter('All')} />
              <PillButton label="Website form" count={channelCounts['Website form']} active={channelFilter === 'Website form'} onClick={() => setChannelFilter('Website form')} />
              <PillButton label="Email" count={channelCounts['Email']} active={channelFilter === 'Email'} onClick={() => setChannelFilter('Email')} />
              <PillButton label="WhatsApp" count={channelCounts['WhatsApp']} active={channelFilter === 'WhatsApp'} onClick={() => setChannelFilter('WhatsApp')} />
  
              <div className="w-6" />
  
              <FilterSelect 
                value={reqTypeFilter}
                onChange={(val) => setReqTypeFilter(val)}
                options={["Machine Issue", "Payment / Refund", "NAF Membership", "NAF Wallet", "Mobile App", "NAF Cloud System", "Reservation / Pickup", "Complaint", "Feedback / Suggestion", "Partnership / Business Support", "Other"]}
                defaultLabel="Request type"
              />
              <FilterSelect 
                value={accTypeFilter}
                onChange={(val) => setAccTypeFilter(val)}
                options={["Customer / Guest", "NAF Member", "Business / Partner", "Other", "Not collected"]}
                defaultLabel="Account type"
              />

              {/* Clear all filters */}
              {(channelFilter !== 'All' || reqTypeFilter !== 'All' || accTypeFilter !== 'All') && (
                <button
                  onClick={() => { setChannelFilter('All'); setReqTypeFilter('All'); setAccTypeFilter('All'); }}
                  className="text-[11px] font-medium ml-2 underline underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: '#78828A' }}>
                  Clear filters
                </button>
              )}
            </div>}
          </div>
"""

figma_return = re.sub(r'(?sm)<div className="p-4 flex flex-col gap-4">.*?\{/\* Desktop Table \*/\}', clean_queue_controls + "\n          {/* Desktop Table */}", figma_return)

if '<NewTicketModal' not in figma_return:
    figma_return = figma_return.replace('{emailTicket && <EmailModal', '<NewTicketModal isOpen={newTicketOpen} onClose={() => setNewTicketOpen(false)} onTicketCreated={(t) => setTickets(p => [t, ...p])} isAuthenticated={isAuthenticated} />\n      {emailTicket && <EmailModal')

merged_dashboard = merged_dashboard.replace(head_return, figma_return)
sections['ADMIN DASHBOARD'] = merged_dashboard

with open('DarkSelect.js', 'r', encoding='utf-8') as f: dark_select = f.read()
with open('AdminTicketRow.js', 'r', encoding='utf-8') as f: admin_ticket_row = f.read()
with open('temp_ticket_detail.jsx', 'r', encoding='utf-8', errors='ignore') as f: ticket_detail = f.read().replace('\x00', '').replace('\ufeff', '')
with open('extracted_modal_clean.js', 'r', encoding='utf-8') as f: new_ticket_modal = f.read()

pill_button = """
/* -------------------------------------------------------------------------- */
/* CUSTOM COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */
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

main_app = sections['MAIN APP COMPONENT']
main_app = main_app.replace(
    "font-family: 'Power Grotesk', sans-serif;",
    "font-family: 'Power Grotesk', sans-serif;\n      }\n      .ticket-main-heading {\n        font-family: 'Power Grotesk', sans-serif;\n      }"
)
main_app = re.sub(r'const requestType = item\.requestType \|\| .*?;', "const requestType = REQUEST_TYPE_MAPPING[item.requestType] || item.requestType || 'Other';", main_app)
main_app = re.sub(r'const accountType = item\.accountType \|\| .*?;', "const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';", main_app)

def w(title, content):
    return f"\n/* {'-'*74} */\n/* {title.ljust(74)} */\n/* {'-'*74} */\n{content}"

header_final = header + w("CUSTOM HOOKS", sections['CUSTOM HOOKS']) + "\n\n" + mapping_code + w("MAIN APP COMPONENT", main_app)
layout = w("LAYOUTS", sections['LAYOUTS'])

customs = w("CUSTOM COMPONENTS", pill_button + "\n\n" + filter_select + "\n\n" + dark_select + "\n\n" + queue_stat)
dash = w("ADMIN DASHBOARD", sections['ADMIN DASHBOARD'])

remaining = w("EMPTY STATE", sections['EMPTY STATE']) + w("MOBILE TICKET CARD", sections['MOBILE TICKET CARD']) + w("DELETE MODAL", sections['DELETE MODAL'])

full_file = (header_final + layout + customs + dash + "\n\n" + 
             w("SKELETON ROW", sections['SKELETON ROW']) + remaining + "\n\n" + 
             w("ADMIN TICKET ROW", admin_ticket_row) + "\n\n" + w("TICKET DETAIL MODAL", ticket_detail) + w("EMAIL MODAL", sections['EMAIL MODAL']) + "\n\n" + w("NEW TICKET MODAL", new_ticket_modal))

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

with open('App_pure.jsx', 'w', encoding='utf-8') as f:
    f.write(full_file)

print("Generated App_pure.jsx")
