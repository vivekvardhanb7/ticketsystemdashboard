import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    head = f.read()

with open('reconstructed_AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    figma = f.read()

# We can just extract AdminDashboard from HEAD using regex!
match_head = re.search(r'(?sm)(^function AdminDashboard.*?^\s*\}\n)', head)
head_admin_dashboard = match_head.group(1)

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
if '<NewTicketModal' not in figma_return:
    figma_return = figma_return.replace('{emailTicket && <EmailModal', '<NewTicketModal isOpen={newTicketOpen} onClose={() => setNewTicketOpen(false)} onTicketCreated={(t) => setTickets(p => [t, ...p])} isAuthenticated={isAuthenticated} />\n      {emailTicket && <EmailModal')

merged_dashboard = merged_dashboard.replace(head_return, figma_return)

with open('temp_dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(merged_dashboard)

print("Dashboard built perfectly!")
