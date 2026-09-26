import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  Trash2,
  Mail,
  Search,
  X,
  Send,
  User,
  Eye,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  FileText,
  Briefcase,
  Paperclip,
  Image as ImageIcon,
  PlusCircle,
  AlertTriangle,
  Inbox,
  Calendar,
  ChevronLeft,
  ChevronRight,
  WifiOff
} from 'lucide-react';
import logo from './assets/naf-logo-animated.gif';
import LoginPage from './LoginPage';
import { COLORS, getAuthHeaders, timeAgo } from './designTokens';

/* -------------------------------------------------------------------------- */
/* CUSTOM HOOKS                                                                */
/* -------------------------------------------------------------------------- */

/** Animates a number from 0 → target over ~600ms */
function useCountUp(target, duration = 300) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current && value === target) return;
    prevTarget.current = target;

    const start = performance.now();
    const from = 0;
    let rafId;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

/** Debounced value hook */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* -------------------------------------------------------------------------- */
/* MAIN APP COMPONENT                                                          */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('authData') || sessionStorage.getItem('authData');
    return saved ? JSON.parse(saved) : false;
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Uploaded Fonts via @font-face and set Global Styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Power Grotesk';
        src: url('powergrotesk-bold.otf') format('opentype');
        font-weight: 700;
        font-style: normal;
      }
      @font-face {
        font-family: 'Satoshi';
        src: url('Satoshi-Regular.otf') format('opentype');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'Satoshi';
        src: url('Satoshi-Medium.otf') format('opentype');
        font-weight: 500;
        font-style: normal;
      }
      
      body {
        font-family: 'Satoshi', sans-serif;
        background-color: ${COLORS.backgrounds.main};
        color: ${COLORS.text.body};
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        min-height: 100vh;
      }
      
      h1, h2, h3, h4, .font-heading {
        font-family: 'Power Grotesk', sans-serif;
        color: ${COLORS.text.heading};
      }

      .ticket-main-heading {
        font-family: 'Power Grotesk', sans-serif;
      }

      input, textarea, select, button, label, p, span, div {
        font-family: 'Satoshi', sans-serif;
      }

      .force-satoshi {
        font-family: 'Satoshi', sans-serif !important;
      }

      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: ${COLORS.backgrounds.main}; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

      /* Toast animations */
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes shrinkWidth {
        from { width: 100%; }
        to { width: 0%; }
      }
      .toast-enter { animation: slideUp 0.3s ease-out; }
      .toast-progress { animation: shrinkWidth 3s linear forwards; }

      /* Count-up fade */
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .kpi-animate { animation: fadeInUp 0.2s ease-out; }

      /* Mobile card animations */
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .card-animate { animation: cardIn 0.15s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  // Data Fetching from API
  const fetchTickets = useCallback(async () => {
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const response = await fetch('/api/NAFWebsite/issues', { headers });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authData');
          sessionStorage.removeItem('authData');
          setIsAuthenticated(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const rawContent = Array.isArray(data.content) ? data.content : [];

      const docs = rawContent.map(item => {
        // Handle potentially re-mapped fields from backend
        const descText = item.description || item.bodyPreview || "";

        let extractedEmail = item.email || item.from || item.senderEmail || item.customerEmail || item.contactEmail || "";
        let contactName = item.fullName || item.contactPerson || item.senderName || "";

        if (typeof extractedEmail === 'object') {
          // Microsoft Graph format
          contactName = contactName || extractedEmail.emailAddress?.name || "";
          extractedEmail = extractedEmail.emailAddress?.address || "";
        } else if (typeof item.from === 'object') {
          contactName = contactName || item.from?.emailAddress?.name || "";
          extractedEmail = extractedEmail || item.from?.emailAddress?.address || "";
        }

        if (!contactName && typeof extractedEmail === 'string' && extractedEmail) {
          const emailNameMatch = extractedEmail.match(/^([^<@]+)/);
          if (emailNameMatch) contactName = emailNameMatch[1].trim();
        }

        // Ensure numeric ID generation is safe for string IDs
        const year = new Date(item.submittedAt || item.createdDateTime || item.receivedDateTime || Date.now()).getFullYear();
        let numericId = 0;
        if (typeof item.id === 'number') {
          numericId = item.id;
        } else if (typeof item.id === 'string') {
          numericId = Math.abs(item.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 10000;
        }

        // Extract location from the description text instead of relying solely on bodyPreview, 
        // because the backend API might map bodyPreview -> description and drop bodyPreview.
        let parsedLocation = item.machineLocation || item.location;
        if (!parsedLocation && descText) {
          const locMatch = descText.match(/Machine Location:\s*(.+)/i);
          if (locMatch) parsedLocation = locMatch[1].trim();
        }

        const rawDate = item.submittedAt || item.createdDateTime || item.receivedDateTime || new Date().toISOString();
        // API returns timestamps without timezone — treat as UTC
        const createdAt = rawDate && !rawDate.endsWith('Z') && !rawDate.includes('+') ? rawDate + 'Z' : rawDate;

        return {
          id: item.id?.toString() || Math.random().toString(36),
          ticketId: `NAF-${year}-${1000 + numericId}`,
          contactPerson: contactName || "Unknown User",
          email: typeof extractedEmail === 'string' ? extractedEmail : "",
          phone: item.phoneNumber || item.phone || "",
          requestType: item.requestType || "Email Support",
          problemType: item.subject || "Issue",
          subject: item.subject || "No Subject",
          description: descText,
          location: parsedLocation || "N/A",
          machineId: "N/A",
          accountType: item.accountType || "Customer",
          urgency: ["Normal"],
          status: String(item.status || "OPEN").toUpperCase(),
          createdAt,
          media: (item.mediaFilePathsAsList || []).map(url => ({
            url: url,
            type: url.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image/jpeg' : 'application/octet-stream',
            name: url.split('/').pop() || 'attachment'
          }))
        };
      });

      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Merge local-only data (emails, closedAt) that isn't in the API response
      setTickets(prev => {
        const prevMap = {};
        prev.forEach(t => { prevMap[t.id] = t; });
        return docs.map(d => ({
          ...d,
          emails: prevMap[d.id]?.emails || [],
          closedAt: prevMap[d.id]?.closedAt || null,
        }));
      });
      setFetchError(null);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchTickets]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={(userData) => setIsAuthenticated(userData)} />;
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: COLORS.backgrounds.main }}>
      <AdminLayout onLogout={handleLogout}>
        <AdminDashboard
          isAuthenticated={isAuthenticated}
          tickets={tickets}
          loading={loading}
          fetchError={fetchError}
          onRetry={fetchTickets}
          setTickets={setTickets}
          setToast={setToast}
        />
      </AdminLayout>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] toast-enter">
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(29, 29, 31, 0.9)',
              borderColor: toast.variant === 'error' ? '#EF4444' : COLORS.primary[500],
              borderLeftWidth: 4
            }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: toast.variant === 'error' ? 'rgba(239,68,68,0.15)' : `${COLORS.primary[500]}20` }}>
              {toast.variant === 'error'
                ? <AlertTriangle className="w-4 h-4 text-red-500" />
                : <RefreshCw className="w-4 h-4" style={{ color: COLORS.primary[500] }} />
              }
            </div>
            <div>
              <h4 className="text-sm font-bold text-white force-satoshi">{toast.title || "Notice"}</h4>
              <p className="text-xs text-white/60 force-satoshi">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-4 hover:bg-white/10 p-1 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] toast-progress"
              style={{ backgroundColor: toast.variant === 'error' ? '#EF4444' : COLORS.primary[500] }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LAYOUTS                                                                    */
/* -------------------------------------------------------------------------- */

function AdminLayout({ children, onLogout }) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <header className="h-16 border-b flex items-center px-4 md:px-8 sticky top-0 z-10 backdrop-blur relative justify-between md:justify-center" style={{ backgroundColor: 'rgba(29, 29, 31, 0.9)', borderColor: COLORS.border }}>
        <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
          <img src={logo} alt="NAF Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg font-heading" style={{ color: COLORS.text.heading }}>NAF SUPPORT</span>
        </div>
        <div
          onClick={onLogout}
          className="flex items-center gap-3 ml-auto md:ml-0 md:absolute md:right-8 cursor-pointer hover:opacity-80 transition-opacity group"
          title="Logout"
        >
          <span className="hidden md:block text-xs font-medium opacity-60 force-satoshi" style={{ color: COLORS.text.heading }}>Logout</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 group-hover:bg-red-500/20 transition-colors">
            <User className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ADMIN DASHBOARD                                                            */
/* -------------------------------------------------------------------------- */

const TICKETS_PER_PAGE = 10;

function AdminDashboard({ isAuthenticated, tickets, loading, fetchError, onRetry, setTickets, setToast }) {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const dateInputRef = useRef(null);
  const searchQuery = useDebounce(searchInput, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailTicket, setEmailTicket] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  // Stores email history per ticket: { [ticketId]: EmailData[] }
  // Fetched from API when a ticket is opened
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
          // API uses 'outbound'/'inbound', 'direction' field needs to map to UI expectations
          // UI expects 'sent' for outbound and 'received' for inbound
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

  const stats = useMemo(() => ({
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length
  }), [tickets]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [filter, searchQuery, dateFilter]);

  const filtered = useMemo(() => {
    let result = tickets;

    // Status filter
    if (filter !== 'All') {
      result = result.filter(t => String(t.status).toUpperCase() === String(filter).toUpperCase());
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.ticketId || '').toLowerCase().includes(q) ||
        (t.contactPerson || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q)
      );
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(t => {
        if (!t.createdAt) return false;
        const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
        return ticketDate === dateFilter;
      });
    }

    return result;
  }, [tickets, filter, searchQuery, dateFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKETS_PER_PAGE));
  const paginatedTickets = filtered.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE);

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const response = await fetch(`/api/NAFWebsite/issue/${ticketId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update status: ${response.status} ${errText}`);
      }

      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, status: newStatus };
          if (newStatus === 'CLOSED') updated.closedAt = new Date().toISOString();
          else updated.closedAt = null;
          return updated;
        }
        return t;
      }));
      // Keep viewTicket in sync
      setViewTicket(prev => {
        if (prev && prev.id === ticketId) {
          const updated = { ...prev, status: newStatus };
          if (newStatus === 'CLOSED') updated.closedAt = new Date().toISOString();
          else updated.closedAt = null;
          return updated;
        }
        return prev;
      });
      setToast({ title: "Status Updated", message: `Ticket status changed to ${newStatus}` });
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({ title: "Update Failed", message: `Error: ${error.message}`, variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEmailSent = async (ticketId, emailData) => {
    // Store in API
    try {
      const headers = getAuthHeaders(isAuthenticated);
      const postBody = {
        subject: emailData.subject,
        message: emailData.message,
        senderName: emailData.senderName,
        senderEmail: 'support@naf-halsbach.de', // Admin sender email
        senderType: emailData.senderType,
        direction: 'outbound',
        sentAt: emailData.sentAt,
        attachments: emailData.attachments || []
      };

      await fetch(`/api/NAFWebsite/issue/${ticketId}/emails`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });
    } catch (err) {
      console.error("Failed to store email history in API:", err);
    }

    // Store in local state for immediate UI update
    setEmailHistory(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), emailData]
    }));
  };

  // Build full email thread: only show initial submission + replies if there is email activity
  const getTicketEmails = useCallback((ticket) => {
    const stored = emailHistory[ticket.id] || [];
    // If no email activity exists, return empty — don't fake an email for form-submitted tickets
    if (stored.length === 0) return [];
    // Show the original ticket submission as first "inbound" email, followed by replies
    const initialEmail = {
      id: `initial-${ticket.id}`,
      subject: ticket.subject || 'Support Request',
      message: ticket.description || 'No description provided.',
      sentAt: ticket.createdAt,
      senderType: 'Customer',
      senderName: ticket.contactPerson || 'Unknown',
      senderEmail: ticket.email || '',
      direction: 'received',
      attachments: [],
    };
    return [initialEmail, ...stored];
  }, [emailHistory]);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <KPICard label="Open" value={stats.open} color={COLORS.primary[500]} />
        <KPICard label="InProgress" value={stats.inProgress} color={COLORS.secondary[500]} />
        <KPICard label="Closed" value={stats.closed} color="#fff" />
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-300 force-satoshi">Failed to load tickets</p>
            <p className="text-xs text-red-300/60 force-satoshi">{fetchError}</p>
          </div>
          <button onClick={onRetry}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors force-satoshi flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Ticket Table Card */}
      <div className="rounded-[1.5rem] overflow-hidden shadow-2xl" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border, borderWidth: 1 }}>
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" style={{ borderColor: COLORS.border }}>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all force-satoshi whitespace-nowrap ${filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              {dateFilter && (
                <>
                  <span className="text-[11px] text-[#7FEE64] force-satoshi whitespace-nowrap">{new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <button onClick={() => setDateFilter('')} className="p-0.5 hover:bg-white/10 rounded transition-colors">
                    <X className="w-3 h-3 text-white/30 hover:text-white/60" />
                  </button>
                </>
              )}
              <input
                ref={dateInputRef}
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="sr-only"
                style={{ colorScheme: 'dark' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (dateInputRef.current) {
                    try { dateInputRef.current.showPicker(); } catch { dateInputRef.current.click(); }
                  }
                }}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${dateFilter ? 'border-[#7FEE64]/40 bg-[#7FEE64]/10 text-[#7FEE64]' : 'border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                title={dateFilter || 'Filter by date'}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-white" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm w-full md:w-64 outline-none focus:border-white/20 border border-white/5 text-white force-satoshi"
                style={{ backgroundColor: COLORS.backgrounds.input }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table — hidden on mobile */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="text-white/40 uppercase tracking-wider text-xs font-medium force-satoshi" style={{ backgroundColor: COLORS.backgrounds.main }}>
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Subject / Issue</th>
                <th className="px-6 py-4">Requester Details</th>
                <th className="px-6 py-4">Closed Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : paginatedTickets.map(ticket => (
                <AdminTicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isUpdating={updatingId === ticket.id}
                  onEmailClick={() => setEmailTicket(ticket)}
                  onViewClick={() => setViewTicket(ticket)}
                  onDeleteClick={() => setDeleteTicket(ticket)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List — visible only on mobile */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : paginatedTickets.map((ticket, idx) => (
            <MobileTicketCard
              key={ticket.id}
              ticket={ticket}
              index={idx}
              onEmailClick={() => setEmailTicket(ticket)}
              onViewClick={() => setViewTicket(ticket)}
              onDeleteClick={() => setDeleteTicket(ticket)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && !loading && !fetchError && (
          <EmptyState hasSearch={!!searchQuery.trim()} />
        )}

        {/* Pagination */}
        {!loading && filtered.length > TICKETS_PER_PAGE && (
          <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: COLORS.border }}>
            <p className="text-xs text-white/40 force-satoshi">
              Showing {(currentPage - 1) * TICKETS_PER_PAGE + 1}–{Math.min(currentPage * TICKETS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/60 force-satoshi min-w-[60px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-20 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={(ticket) => setTickets(prev => [ticket, ...prev])}
        isAuthenticated={isAuthenticated} 
      />
      
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={(ticket) => setTickets(prev => [ticket, ...prev])}
        isAuthenticated={isAuthenticated} 
      />
      
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={(ticket) => setTickets(prev => [ticket, ...prev])}
        isAuthenticated={isAuthenticated} 
      />
      {emailTicket && <EmailModal ticket={emailTicket} onClose={() => setEmailTicket(null)} setToast={setToast} onEmailSent={handleEmailSent} />}
      {viewTicket && (
        <TicketDetailModal
          ticket={viewTicket}
          emails={getTicketEmails(viewTicket)}
          onClose={() => setViewTicket(null)}
          onStatusChange={handleStatusChange}
          isUpdating={updatingId === viewTicket.id}
          onEmailClick={() => {
            const latest = tickets.find(t => t.id === viewTicket.id) || viewTicket;
            setViewTicket(null);
            setTimeout(() => setEmailTicket(latest), 50);
          }}
        />
      )}
      {deleteTicket && <DeleteModal isAuthenticated={isAuthenticated} ticket={deleteTicket} setTickets={setTickets} onClose={() => setDeleteTicket(null)} setToast={setToast} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                 */
/* -------------------------------------------------------------------------- */

function EmptyState({ hasSearch }) {
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-white/20" />
      </div>
      <h4 className="text-lg font-bold text-white/40 mb-1 font-heading">
        {hasSearch ? 'No results found' : 'No tickets yet'}
      </h4>
      <p className="text-sm text-white/25 force-satoshi max-w-xs">
        {hasSearch
          ? 'Try adjusting your search query or changing the status filter.'
          : 'When support tickets are submitted, they will appear here.'}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MOBILE TICKET CARD                                                          */
/* -------------------------------------------------------------------------- */

function MobileTicketCard({ ticket, index, onEmailClick, onViewClick, onDeleteClick }) {
  const displayTitle = ticket.subject || ticket.problemType || "No Subject";

  return (
    <div
      className="p-4 rounded-xl border card-animate"
      style={{
        backgroundColor: COLORS.backgrounds.main,
        borderColor: COLORS.border,
        animationDelay: `${index * 60}ms`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate force-satoshi">{displayTitle}</p>
          <p className="text-xs text-white/40 font-mono force-satoshi mt-0.5">{ticket.ticketId}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border force-satoshi ${ticket.status === 'CLOSED' ? 'border-[#35B814]/40 text-[#35B814] bg-[#35B814]/10' :
          ticket.status === 'IN_PROGRESS' ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/10' :
            'border-white/20 text-white/60 bg-white/5'
          }`}>{ticket.status}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white force-satoshi">
          {ticket.contactPerson ? ticket.contactPerson.charAt(0).toUpperCase() : '?'}
        </div>
        <span className="text-xs text-white/60 force-satoshi truncate">{ticket.contactPerson}</span>
        <span className="text-[10px] text-white/30 force-satoshi ml-auto">{timeAgo(ticket.createdAt)}</span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/5">
        <button onClick={onViewClick} className="flex-1 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" /> View
        </button>
        <button onClick={onEmailClick} className="flex-1 py-2 text-xs text-white/50 hover:text-[#7FEE64] hover:bg-[#7FEE64]/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" /> Email
        </button>
        <button onClick={onDeleteClick} className="flex-1 py-2 text-xs text-white/50 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors force-satoshi flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border animate-pulse" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }}>
      <div className="flex justify-between mb-3">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-5 w-20 bg-white/10 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full bg-white/10" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DELETE MODAL                                                                */
/* -------------------------------------------------------------------------- */

function DeleteModal({ isAuthenticated, ticket, onClose, setTickets, setToast }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!ticket?.id) return;
    setIsDeleting(true);

    try {
      const headers = getAuthHeaders(isAuthenticated);
      const response = await fetch(`/api/NAFWebsite/${ticket.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete ticket: ${response.status} ${errText}`);
      }

      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      if (setToast) setToast({ title: "Ticket Deleted", message: `Ticket ${ticket.ticketId} has been removed.` });
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      if (setToast) setToast({ title: "Delete Failed", message: `Error: ${err.message}`, variant: 'error' });
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }} onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 font-heading" style={{ color: COLORS.text.heading }}>Delete Ticket?</h3>
            <p className="text-sm opacity-60 force-satoshi" style={{ color: COLORS.text.body }}>
              Are you sure you want to delete ticket <span className="font-mono text-white">{ticket.ticketId}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white force-satoshi"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 rounded-xl transition-colors text-white flex items-center justify-center gap-2 force-satoshi"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TICKET DETAIL MODAL                                                         */
/* -------------------------------------------------------------------------- */

function TicketDetailModal({ ticket, emails, onClose, onStatusChange, isUpdating, onEmailClick }) {
  const formatDate = (dateInput) => {
    if (dateInput?.toMillis) return new Date(dateInput.toMillis()).toLocaleString();
    if (typeof dateInput === 'string') return new Date(dateInput).toLocaleString();
    if (dateInput instanceof Date) return dateInput.toLocaleString();
    return 'Unknown Date';
  };

  const dateStr = formatDate(ticket.createdAt);
  const closedStr = ticket.closedAt ? formatDate(ticket.closedAt) : null;
  const subject = ticket.subject || ticket.problemType || "No Subject";
  const requestType = ticket.requestType || "General Support";
  const accountType = ticket.accountType || "User";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono opacity-40 px-2 py-0.5 rounded bg-white/5 force-satoshi" style={{ color: COLORS.text.heading }}>{ticket.ticketId}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded force-satoshi" style={{ color: COLORS.primary[500], borderColor: `${COLORS.primary[500]}33` }}>{requestType}</span>
            </div>
            <h3 className="text-xl font-bold ticket-main-heading" style={{ color: COLORS.text.heading }}>{subject}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 opacity-50 text-white" /></button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            {/* Status dropdown */}
            <div className="relative">
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md z-10">
                  <RefreshCw className="w-3 h-3 text-white animate-spin" />
                </div>
              )}
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange && onStatusChange(ticket.id, e.target.value)}
                className={`border rounded-md px-3 py-1.5 text-xs font-bold uppercase outline-none cursor-pointer force-satoshi ${ticket.status === 'CLOSED' ? 'border-[#35B814]/50 text-[#35B814] bg-[#35B814]/10' :
                  ticket.status === 'IN_PROGRESS' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                    'border-white/20 text-white/70 bg-white/5'
                  }`}
              >
                <option value="OPEN" className="bg-[#262626] text-white">OPEN</option>
                <option value="IN_PROGRESS" className="bg-[#262626] text-white">IN_PROGRESS</option>
                <option value="CLOSED" className="bg-[#262626] text-white">CLOSED</option>
              </select>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2 text-xs text-white/60 force-satoshi">
              <Clock className="w-4 h-4" />
              {dateStr}
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2 text-xs text-white/60 force-satoshi">
              <User className="w-4 h-4" />
              {accountType} Account
            </div>
            {closedStr && (
              <>
                <div className="h-4 w-[1px] bg-white/10"></div>
                <div className="flex items-center gap-2 text-xs text-[#35B814] force-satoshi">
                  <Clock className="w-4 h-4" />
                  Closed: {closedStr}
                </div>
              </>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2 force-satoshi" style={{ color: COLORS.text.heading }}>
                <User className="w-4 h-4" /> Contact Information
              </h4>
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <DetailRow label="Full Name" value={ticket.contactPerson} icon={User} />
                <DetailRow label="Email Address" value={ticket.email} icon={Mail} />
                <DetailRow label="Phone Number" value={ticket.phone || "Not Provided"} icon={Phone} />
                <DetailRow label="Account Type" value={accountType} icon={Briefcase} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2 force-satoshi" style={{ color: COLORS.text.heading }}>
                <MapPin className="w-4 h-4" /> Request Context
              </h4>
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <DetailRow label="Request Type" value={requestType} icon={FileText} />
                <DetailRow label="Machine ID / Location" value={ticket.location || ticket.machineId || "N/A"} icon={MapPin} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2 force-satoshi" style={{ color: COLORS.text.heading }}>
              <MessageSquare className="w-4 h-4" /> Message / Description
            </h4>
            <p className="text-white/90 leading-relaxed p-6 rounded-xl border border-white/5 text-sm whitespace-pre-wrap force-satoshi" style={{ backgroundColor: COLORS.backgrounds.card }}>
              {ticket.description || "No description provided."}
            </p>
          </div>

          {/* Media / Attachments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2 force-satoshi" style={{ color: COLORS.text.heading }}>
              <Paperclip className="w-4 h-4" /> Attached Media
            </h4>
            {ticket.media && ticket.media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ticket.media.map((item, idx) => (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 hover:border-[#7FEE64] transition-all">
                    {item.type && item.type.startsWith('image') ? (
                      <img src={item.url} alt="Attachment" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50"><FileText className="w-8 h-8" /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                      <span className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded flex items-center gap-1 force-satoshi">
                        <Eye className="w-3 h-3" /> View
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-white/30 text-sm force-satoshi">
                No media attached to this request.
              </div>
            )}
          </div>

          {/* Email History */}
          {emails && emails.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2 force-satoshi" style={{ color: COLORS.text.heading }}>
                <Mail className="w-4 h-4" /> Email History ({emails.length})
              </h4>
              <div className="space-y-4">
                {emails.map((email) => {
                  const isOutbound = email.direction === 'sent' || email.senderType === 'Admin';
                  return (
                    <div key={email.id} className={`p-4 rounded-xl border ${isOutbound ? 'border-[#7FEE64]/15 bg-[#7FEE64]/5' : 'border-white/5 bg-white/5'}`}
                      style={{ borderLeftWidth: 3, borderLeftColor: isOutbound ? COLORS.primary[500] : '#60A5FA' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white force-satoshi">{email.subject}</p>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded force-satoshi ${isOutbound ? 'bg-[#7FEE64]/15 text-[#7FEE64]' : 'bg-blue-500/15 text-blue-400'}`}>
                              {isOutbound ? '↑ Sent' : '↓ Received'}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 force-satoshi mt-0.5">
                            {isOutbound ? 'From' : 'From'}: {email.senderName} ({email.senderType})
                          </p>
                        </div>
                        <span className="text-xs text-white/40 force-satoshi flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(email.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-white/80 whitespace-pre-wrap force-satoshi bg-black/20 p-3 rounded-lg">
                        {email.message}
                      </div>
                      {email.attachments && email.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                          <p className="text-xs font-bold text-white/40 force-satoshi mb-2">Attachments ({email.attachments.length})</p>
                          {email.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-white/60 bg-black/20 px-3 py-1.5 rounded-md inline-flex w-auto mt-1 mr-2">
                              <Paperclip className="w-3 h-3" />
                              {att.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-between items-center" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
          <button
            onClick={() => onEmailClick && onEmailClick()}
            className="px-5 py-2 text-sm font-bold rounded-lg border border-[#7FEE64]/30 text-[#7FEE64] hover:bg-[#7FEE64]/10 transition-colors force-satoshi flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors force-satoshi">
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <div className="mt-0.5 w-4 h-4 flex items-center justify-center opacity-30 text-white"><Icon className="w-3.5 h-3.5" /></div>}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase opacity-40 leading-none mb-1 force-satoshi" style={{ color: COLORS.text.heading }}>{label}</span>
        <span className="text-sm font-medium force-satoshi" style={{ color: COLORS.text.body }}>{value}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMAIL MODAL                                                                 */
/* -------------------------------------------------------------------------- */

function EmailModal({ ticket, onClose, setToast, onEmailSent }) {
  const [subject, setSubject] = useState(`Re: ${ticket.subject || ticket.ticketId}`);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // n8n webhook URL for sending reply emails — update this after importing the workflow
  const N8N_SEND_REPLY_WEBHOOK = 'https://n8n.naf-cloudsystem.de/webhook/send-support-reply';

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    // Try sending via n8n webhook (actual email delivery)
    let webhookSuccess = false;
    try {
      const formData = new FormData();
      formData.append('to', ticket.email);
      formData.append('toName', ticket.contactPerson);
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('ticketId', ticket.id);
      formData.append('ticketRef', ticket.ticketId);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const resp = await fetch(N8N_SEND_REPLY_WEBHOOK, {
        method: 'POST',
        body: formData  // No Content-Type header — browser sets multipart boundary
      });
      if (resp.ok) webhookSuccess = true;
    } catch (err) {
      console.warn('n8n webhook not available — email recorded locally only:', err.message);
    }

    setSending(false);

    const newEmail = {
      id: Math.random().toString(36).substring(2, 9),
      subject,
      message,
      attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type })),
      sentAt: new Date().toISOString(),
      senderType: 'Admin',
      senderName: 'Support Team',
      direction: 'sent',
    };

    if (ticket.onEmailSent) {
      ticket.onEmailSent(ticket.id, newEmail);
    } else if (onEmailSent) {
      onEmailSent(ticket.id, newEmail);
    }

    if (setToast) {
      const attachText = attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : '';
      const statusText = webhookSuccess ? '' : ' (saved locally — n8n webhook pending setup)';
      setToast({ title: "Email Sent Successfully", message: `Email sent to ${ticket.email}${attachText}${statusText}` });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: COLORS.backgrounds.main, borderColor: COLORS.border }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 font-heading" style={{ color: COLORS.text.heading }}>
            <Mail className="w-5 h-5" style={{ color: COLORS.primary[500] }} /> Send Email
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 opacity-50 text-white" /></button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">To</label>
            <input disabled value={`${ticket.contactPerson} <${ticket.email}>`} className="w-full border rounded-lg px-3 py-2 text-sm cursor-not-allowed text-white/50 force-satoshi" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }} />
          </div>

          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">Subject</label>
            <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-transparent rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7FEE64] force-satoshi" style={{ backgroundColor: COLORS.backgrounds.input }} />
          </div>

          <div>
            <label className="text-xs font-medium opacity-50 block mb-1 force-satoshi text-white">Message</label>
            <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-transparent rounded-lg px-3 py-2 text-sm text-white outline-none resize-none focus:border-[#7FEE64] force-satoshi" style={{ backgroundColor: COLORS.backgrounds.input }} placeholder="Type your response here..." />
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-medium opacity-50 block mb-2 force-satoshi text-white">Attachments</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-lg border border-dashed border-white/15 hover:border-[#7FEE64]/40 hover:bg-[#7FEE64]/5 transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white/70 force-satoshi text-sm"
            >
              <Paperclip className="w-4 h-4" />
              Click to attach files
            </button>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                    {file.type?.startsWith('image/')
                      ? <ImageIcon className="w-4 h-4 text-[#7FEE64] flex-shrink-0" />
                      : <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 truncate force-satoshi">{file.name}</p>
                      <p className="text-[10px] text-white/30 force-satoshi">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeAttachment(idx)} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors text-white force-satoshi">Cancel</button>
            <button type="submit" disabled={sending} className="px-6 py-2 text-black text-sm font-bold rounded-lg hover:opacity-90 flex items-center gap-2 force-satoshi" style={{ backgroundColor: COLORS.primary[500] }}>
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Email</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* KPI CARD                                                                    */
/* -------------------------------------------------------------------------- */

function KPICard({ label, value, color }) {
  const animatedValue = useCountUp(value);

  return (
    <div className="p-4 md:p-6 rounded-2xl border relative overflow-hidden kpi-animate" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
      <div className="absolute top-0 right-0 p-4 opacity-10 text-white"><LayoutDashboard className="w-12 h-12" /></div>
      <p className="text-sm font-medium opacity-50 mb-1 force-satoshi" style={{ color: COLORS.text.heading }}>{label}</p>
      <h3 className="text-3xl md:text-4xl font-bold font-heading" style={{ color }}>{animatedValue}</h3>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SKELETON ROW                                                                */
/* -------------------------------------------------------------------------- */

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      <td className="px-6 py-4"><div className="h-4 w-12 bg-white/10 rounded"></div></td>
      <td className="px-6 py-4">
        <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
        <div className="h-3 w-20 bg-white/5 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10"></div>
          <div>
            <div className="h-3 w-24 bg-white/10 rounded mb-1"></div>
            <div className="h-2 w-32 bg-white/5 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-6 w-20 bg-white/10 rounded"></div></td>
      <td className="px-6 py-4 flex gap-2">
        <div className="w-8 h-8 bg-white/10 rounded"></div>
        <div className="w-8 h-8 bg-white/10 rounded"></div>
        <div className="w-8 h-8 bg-white/10 rounded"></div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* ADMIN TICKET ROW                                                            */
/* -------------------------------------------------------------------------- */

function AdminTicketRow({ ticket, onEmailClick, onViewClick, onDeleteClick }) {
  const displayTitle = ticket.subject || ticket.problemType || "No Subject";
  const displaySubtitle = ticket.requestType || ticket.location || "General Request";

  const formatDateTime = (dateInput) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + '\n' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 font-mono text-xs opacity-60 text-white force-satoshi">{ticket.ticketId}</td>
      <td className="px-6 py-4">
        <div className="text-xs text-white/60 whitespace-pre-line force-satoshi">{formatDateTime(ticket.createdAt)}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-white truncate max-w-[200px] force-satoshi">{displayTitle}</div>
        <div className="text-xs opacity-40 truncate max-w-[150px] uppercase tracking-wide text-white force-satoshi mt-0.5">{displaySubtitle}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white force-satoshi">
            {ticket.contactPerson ? ticket.contactPerson.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="text-sm text-white force-satoshi">{ticket.contactPerson}</div>
            <div className="text-xs opacity-40 text-white force-satoshi">{ticket.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {ticket.closedAt ? (
          <div className="text-xs text-[#35B814] whitespace-pre-line force-satoshi font-medium">
            {formatDateTime(ticket.closedAt)}
          </div>
        ) : (
          <span className="text-xs text-white/20 force-satoshi">—</span>
        )}
      </td>
      <td className="px-6 py-4 flex gap-2 items-center">
        <button onClick={onViewClick} className="p-2 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors" title="View Details">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={onEmailClick} className="p-2 hover:bg-[#7FEE64]/10 rounded text-white/40 hover:text-[#7FEE64] transition-colors" title="Send Email">
          <Mail className="w-4 h-4" />
        </button>
        <button onClick={onDeleteClick} className="p-2 hover:bg-white/10 rounded text-white/20 hover:text-red-400 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function DarkSelect({ name, value, onChange, placeholder, options, borderColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedLabel = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedLabel ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label) : null;
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-left flex items-center justify-between outline-none cursor-pointer"
        style={{ borderColor: borderColor || '#24262B', color: displayLabel ? '#EFF2F0' : '#78828A' }}>
        <span className="truncate">{displayLabel || placeholder}</span>
        <span className="text-[10px] text-[#575C66] ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute top-[44px] left-0 right-0 z-50 py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[220px] overflow-y-auto">
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button key={val} type="button" onClick={() => { onChange({ target: { name, value: val } }); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${value === val ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#C4C9D1] hover:bg-[#1A1C20]'}`}>
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

Created At: 2026-09-23T08:53:30+05:30
Completed At: 2026-09-23T08:53:31+05:30
File Path: `file:///c:/Users/vivek/Desktop/LD%20Projects/ticketsupportfinal/src/App.jsx`
Total Lines: 1849
Total Bytes: 85506
Showing lines 1592 to 1849
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1592: function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
1593:   const [channel, setChannel] = useState('Email');
1594:   const [formData, setFormData] = useState({
1595:     fullName: '',
1596:     email: '',
1597:     phone: '',
1598:     location: '',
1599:     accountType: '',
1600:     requestType: '',
1601:     subject: '',
1602:     description: ''
1603:   });
1604:   const [showErrors, setShowErrors] = useState(false);
1605:   const [isSuccess, setIsSuccess] = useState(false);
1606:   const [createdTicketId, setCreatedTicketId] = useState('');
1607:   const [isSubmitting, setIsSubmitting] = useState(false);
1608:   
1609:   if (!isOpen) return null;
1610: 
1611:   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
1612: 
1613:   const validate = () => {
1614:     return formData.fullName.trim() && 
1615:            formData.email.trim() && 
1616:            formData.accountType && 
1617:            formData.requestType && 
1618:            formData.subject.trim() && 
1619:            formData.description.trim();
1620:   };
1621: 
1622:   const handleSubmit = async () => {
1623:     if (!validate()) {
1624:       setShowErrors(true);
1625:       return;
1626:     }
1627:     
1628:     setIsSubmitting(true);
1629:     
1630:     try {
1631:       const headers = { 'Content-Type': 'application/json' };
1632:       if (isAuthenticated) headers['Authorization'] = 'Basic YWRtaW46c2VjdXJlMTIz'; 
1633:       
1634:       const payload = {
1635:         contactPerson: formData.fullName,
1636:         email: formData.email,
1637:         phone: formData.phone || null,
1638:         location: formData.location || null,
1639:         machineId: formData.location || null,
1640:         accountType: formData.accountType,
1641:         requestType: formData.requestType,
1642:         subject: formData.subject,
1643:         description: formData.description,
1644:         channel: channel,
1645:         source: 'Manual Entry'
1646:       };
1647: 
1648:       const res = await fetch('/api/NAFWebsite/support-issues', {
1649:         method: 'POST',
1650:         headers,
1651:         body: JSON.stringify(payload)
1652:       });
1653:       
1654:       let newTicket = null;
1655:       if (res.ok) {
1656:         newTicket = await res.json();
1657:       } else {
1658:         newTicket = {
1659:           ...payload,
1660:           id: Math.random().toString(36).substring(2, 9),
1661:           ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
1662:           status: 'OPEN',
1663:           createdAt: new Date().toISOString(),
1664:         };
1665:       }
1666:       
1667:       setCreatedTicketId(newTicket.ticketId);
1668:       onTicketCreated(newTicket);
1669:       setIsSuccess(true);
1670:     } catch (err) {
1671:       console.error(err);
1672:       const newTicket = {
1673:         ...formData,
1674:         contactPerson: formData.fullName,
1675:         id: Math.random().toString(36).substring(2, 9),
1676:         ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
1677:         status: 'OPEN',
1678:         createdAt: new Date().toISOString(),
1679:         channel: channel,
1680:         source: 'Manual Entry'
1681:       };
1682:       setCreatedTicketId(newTicket.ticketId);
1683:       onTicketCreated(newTicket);
1684:       setIsSuccess(true);
1685:     }
1686:     
1687:     setIsSubmitting(false);
1688:   };
1689:   
1690:   const resetAndClose = () => {
1691:     setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
1692:     setShowErrors(false);
1693:     setIsSuccess(false);
1694:     onClose();
1695:   };
1696: 
1697:   const getBorderColor = (fieldName) => {
1698:     if (!showErrors) return '#282C2F';
1699:     if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
1700:     return '#282C2F';
1701:   };
1702:   
1703:   if (isSuccess) {
1704:     return (
1705:       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
1706:         <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
1707:           <span className="text-[24px] font-semibold text-[#78EF63] font-heading">✓ Ticket created</span>
1708:           <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>
1709:           <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">
1710:             Your ticket is ready. The customer confirmation will use the selected reply channel.
1711:           </span>
1712:           <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
1713:             <span className="text-[12px] font-medium text-[#78EF63]">Back to tickets</span>
1714:           </button>
1715:         </div>
1716:       </div>
1717:     );
1718:   }
1719: 
1720:   return (
1721:     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
1722:       <div className="flex w-[760px] p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
1723:         {/* Header */}
1724:         <div className="flex w-full h-[38px] items-center gap-2.5">
1725:           <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">New ticket</span>
1726:           <div className="flex-1"></div>
1727:           <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
1728:             <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
1729:           </button>
1730:         </div>
1731:         <span className="text-[13px] text-[#A0A8AD]">Create a support request on behalf of a customer.</span>
1732:         
1733:         {/* Reply Channel */}
1734:         <div className="flex flex-col gap-2 mt-2 w-full">
1735:           <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">REPLY CHANNEL</span>
1736:           <div className="flex gap-2">
1737:             <button onClick={() => setChannel('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
1738:               <span className="text-[12px] font-medium">Email</span>
1739:             </button>
1740:             <button onClick={() => setChannel('WhatsApp')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'WhatsApp' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
1741:               <span className="text-[12px] font-medium">WhatsApp</span>
1742:             </button>
1743:           </div>
1744:           <span className="text-[12px] text-[#A0A8AD]">Replies will be sent by {channel.toLowerCase()}. The channel stays fixed for this ticket.</span>
1745:         </div>
1746: 
1747:         {/* Contact Fields */}
1748:         <div className="flex w-full gap-4 mt-2">
1749:           <div className="flex flex-col gap-1.5 flex-1">
1750:             <span className="text-[12px] font-medium text-[#A0A8AD]">Full name *</span>
1751:             <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" 
1752:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1753:               style={{ borderColor: getBorderColor('fullName') }} />
1754:           </div>
1755:           <div className="flex flex-col gap-1.5 flex-1">
1756:             <span className="text-[12px] font-medium text-[#A0A8AD]">Email *</span>
1757:             <input name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" 
1758:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1759:               style={{ borderColor: getBorderColor('email') }} />
1760:           </div>
1761:         </div>
1762: 
1763:         {/* Optional Details */}
1764:         <div className="flex w-full gap-4 mt-2">
1765:           <div className="flex flex-col gap-1.5 flex-1">
1766:             <span className="text-[12px] font-medium text-[#A0A8AD]">Phone number</span>
1767:             <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" 
1768:               className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
1769:           </div>
1770:           <div className="flex flex-col gap-1.5 flex-1">
1771:             <span className="text-[12px] font-medium text-[#A0A8AD]">Machine ID / Location</span>
1772:             <input name="location" value={formData.location} onChange={handleChange} placeholder="Optional" 
1773:               className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
1774:           </div>
1775:         </div>
1776: 
1777:         {/* Classification */}
1778:         <div className="flex w-full gap-4 mt-2">
1779:           <div className="flex flex-col gap-1.5 flex-1">
1780:             <span className="text-[12px] font-medium text-[#A0A8AD]">Account type *</span>
1781:             <select name="accountType" value={formData.accountType} onChange={handleChange}
1782:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
1783:               style={{ borderColor: getBorderColor('accountType'), color: formData.accountType ? '#EFF2F0' : '#78828A' }}>
1784:               <option value="" disabled>Select account type</option>
1785:               <option value="Customer / Guest">Customer / Guest</option>
1786:               <option value="B2B Partner">B2B Partner</option>
1787:               <option value="Internal">Internal</option>
1788:             </select>
1789:           </div>
1790:           <div className="flex flex-col gap-1.5 flex-1">
1791:             <span className="text-[12px] font-medium text-[#A0A8AD]">Request type *</span>
1792:             <select name="requestType" value={formData.requestType} onChange={handleChange}
1793:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
1794:               style={{ borderColor: getBorderColor('requestType'), color: formData.requestType ? '#EFF2F0' : '#78828A' }}>
1795:               <option value="" disabled>Select request type</option>
1796:               <option value="Payment / Refund">Payment / Refund</option>
1797:               <option value="Machine Malfunction">Machine Malfunction</option>
1798:               <option value="General Inquiry">General Inquiry</option>
1799:             </select>
1800:           </div>
1801:         </div>
1802: 
1803:         {/* Subject & Message */}
1804:         <div className="flex flex-col gap-1.5 mt-2 w-full">
1805:           <span className="text-[12px] font-medium text-[#A0A8AD]">Subject *</span>
1806:           <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe the request" 
1807:             className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1808:             style={{ borderColor: getBorderColor('subject') }} />
1809:         </div>
1810:         <div className="flex flex-col gap-1.5 mt-2 w-full">
1811:           <span className="text-[12px] font-medium text-[#A0A8AD]">Message / Description *</span>
1812:           <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What happened? Include any details that will help us." 
1813:             className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
1814:             style={{ borderColor: getBorderColor('description') }} />
1815:         </div>
1816: 
1817:         {/* Media Upload (Visual only) */}
1818:         <div className="flex w-full h-[48px] px-3 mt-2 items-center rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
1819:           <span className="text-[12px] text-[#A0A8AD]">＋ Add photos, video or audio</span>
1820:         </div>
1821: 
1822:         {/* Notification choice */}
1823:         <div className="flex flex-col gap-1 mt-2 w-full">
1824:           <span className="text-[12px] text-[#EFF2F0]">✓ Send a ticket confirmation to the customer</span>
1825:           <span className="text-[11px] text-[#A0A8AD]">New tickets start as Open. * Required fields</span>
1826:         </div>
1827: 
1828:         <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>
1829: 
1830:         {/* Errors & Footer */}
1831:         {showErrors && (
1832:           <span className="text-[12px] text-[#F38C86]">Please complete the required fields before creating this ticket.</span>
1833:         )}
1834:         
1835:         <div className="flex w-full justify-end items-center gap-2.5 mt-1">
1836:           <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
1837:             <span className="text-[12px] font-medium text-[#A0A8AD]">Cancel</span>
1838:           </button>
1839:           <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity disabled:opacity-50">
1840:             {isSubmitting ? '...' : 'Create ticket'}
1841:           </button>
1842:         </div>
1843:       </div>
1844:     </div>
1845:   );
1846: }
1847: 
1848: 
1849: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.


function DarkSelect({ name, value, onChange, placeholder, options, borderColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedLabel = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedLabel ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label) : null;
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-left flex items-center justify-between outline-none cursor-pointer"
        style={{ borderColor: borderColor || '#24262B', color: displayLabel ? '#EFF2F0' : '#78828A' }}>
        <span className="truncate">{displayLabel || placeholder}</span>
        <span className="text-[10px] text-[#575C66] ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute top-[44px] left-0 right-0 z-50 py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[220px] overflow-y-auto">
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button key={val} type="button" onClick={() => { onChange({ target: { name, value: val } }); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${value === val ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#C4C9D1] hover:bg-[#1A1C20]'}`}>
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
  const [channel, setChannel] = useState('Email');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    accountType: '',
    requestType: '',
    subject: '',
    description: ''
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.accountType && 
           formData.requestType && 
           formData.subject.trim() && 
           formData.description.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setShowErrors(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers['Authorization'] = 'Basic YWRtaW46c2VjdXJlMTIz'; 
      
      const payload = {
        contactPerson: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        machineId: formData.location || null,
        accountType: formData.accountType,
        requestType: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        channel: channel,
        source: 'Manual Entry'
      };

      const res = await fetch('/api/NAFWebsite/support-issues', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      let newTicket = null;
      if (res.ok) {
        newTicket = await res.json();
      } else {
        newTicket = {
          ...payload,
          id: Math.random().toString(36).substring(2, 9),
          ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
      }
      
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      const newTicket = {
        ...formData,
        contactPerson: formData.fullName,
        id: Math.random().toString(36).substring(2, 9),
        ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        channel: channel,
        source: 'Manual Entry'
      };
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };
  
  const resetAndClose = () => {
    setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
    setShowErrors(false);
    setIsSuccess(false);
    onClose();
  };

  const getBorderColor = (fieldName) => {
    if (!showErrors) return '#282C2F';
    if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
    return '#282C2F';
  };
  
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
        <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
          <span className="text-[24px] font-semibold text-[#78EF63] font-heading">✓ Ticket created</span>
          <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>
          <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">
            Your ticket is ready. The customer confirmation will use the selected reply channel.
          </span>
          <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
            <span className="text-[12px] font-medium text-[#78EF63]">Back to tickets</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="flex w-[760px] p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex w-full h-[38px] items-center gap-2.5">
          <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">New ticket</span>
          <div className="flex-1"></div>
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
          </button>
        </div>
        <span className="text-[13px] text-[#A0A8AD]">Create a support request on behalf of a customer.</span>
        
        {/* Reply Channel */}
        <div className="flex flex-col gap-2 mt-2 w-full">
          <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">REPLY CHANNEL</span>
          <div className="flex gap-2">
            <button onClick={() => setChannel('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">Email</span>
            </button>
            <button onClick={() => setChannel('WhatsApp')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'WhatsApp' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">WhatsApp</span>
            </button>
          </div>
          <span className="text-[12px] text-[#A0A8AD]">Replies will be sent by {channel.toLowerCase()}. The channel stays fixed for this ticket.</span>
        </div>

        {/* Contact Fields */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Full name *</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('fullName') }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Email *</span>
            <input name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('email') }} />
          </div>
        </div>

        {/* Optional Details */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Phone number</span>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Machine ID / Location</span>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
        </div>

        {/* Classification */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Account type *</span>
            <select name="accountType" value={formData.accountType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('accountType'), color: formData.accountType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select account type</option>
              <option value="Customer / Guest">Customer / Guest</option>
              <option value="B2B Partner">B2B Partner</option>
              <option value="Internal">Internal</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Request type *</span>
            <select name="requestType" value={formData.requestType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('requestType'), color: formData.requestType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select request type</option>
              <option value="Payment / Refund">Payment / Refund</option>
              <option value="Machine Malfunction">Machine Malfunction</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Subject & Message */}
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Subject *</span>
          <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe the request" 
            className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
            style={{ borderColor: getBorderColor('subject') }} />
        </div>
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Message / Description *</span>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What happened? Include any details that will help us." 
            className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
            style={{ borderColor: getBorderColor('description') }} />
        </div>

        {/* Media Upload (Visual only) */}
        <div className="flex w-full h-[48px] px-3 mt-2 items-center rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-[12px] text-[#A0A8AD]">＋ Add photos, video or audio</span>
        </div>

        {/* Notification choice */}
        <div className="flex flex-col gap-1 mt-2 w-full">
          <span className="text-[12px] text-[#EFF2F0]">✓ Send a ticket confirmation to the customer</span>
          <span className="text-[11px] text-[#A0A8AD]">New tickets start as Open. * Required fields</span>
        </div>

        <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>

        {/* Errors & Footer */}
        {showErrors && (
          <span className="text-[12px] text-[#F38C86]">Please complete the required fields before creating this ticket.</span>
        )}
        
        <div className="flex w-full justify-end items-center gap-2.5 mt-1">
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Cancel</span>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? '...' : 'Create ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}





function DarkSelect({ name, value, onChange, placeholder, options, borderColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selectedLabel = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedLabel ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label) : null;
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-left flex items-center justify-between outline-none cursor-pointer"
        style={{ borderColor: borderColor || '#24262B', color: displayLabel ? '#EFF2F0' : '#78828A' }}>
        <span className="truncate">{displayLabel || placeholder}</span>
        <span className="text-[10px] text-[#575C66] ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute top-[44px] left-0 right-0 z-50 py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[220px] overflow-y-auto">
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button key={val} type="button" onClick={() => { onChange({ target: { name, value: val } }); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${value === val ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#C4C9D1] hover:bg-[#1A1C20]'}`}>
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
  const [channel, setChannel] = useState('Email');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    accountType: '',
    requestType: '',
    subject: '',
    description: ''
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.accountType && 
           formData.requestType && 
           formData.subject.trim() && 
           formData.description.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setShowErrors(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers['Authorization'] = 'Basic YWRtaW46c2VjdXJlMTIz'; 
      
      const payload = {
        contactPerson: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        machineId: formData.location || null,
        accountType: formData.accountType,
        requestType: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        channel: channel,
        source: 'Manual Entry'
      };

      const res = await fetch('/api/NAFWebsite/support-issues', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      let newTicket = null;
      if (res.ok) {
        newTicket = await res.json();
      } else {
        newTicket = {
          ...payload,
          id: Math.random().toString(36).substring(2, 9),
          ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
      }
      
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      const newTicket = {
        ...formData,
        contactPerson: formData.fullName,
        id: Math.random().toString(36).substring(2, 9),
        ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        channel: channel,
        source: 'Manual Entry'
      };
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };
  
  const resetAndClose = () => {
    setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
    setShowErrors(false);
    setIsSuccess(false);
    onClose();
  };

  const getBorderColor = (fieldName) => {
    if (!showErrors) return '#282C2F';
    if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
    return '#282C2F';
  };
  
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
        <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
          <span className="text-[24px] font-semibold text-[#78EF63] font-heading">✓ Ticket created</span>
          <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>
          <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">
            Your ticket is ready. The customer confirmation will use the selected reply channel.
          </span>
          <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
            <span className="text-[12px] font-medium text-[#78EF63]">Back to tickets</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="flex w-[760px] p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex w-full h-[38px] items-center gap-2.5">
          <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">New ticket</span>
          <div className="flex-1"></div>
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
          </button>
        </div>
        <span className="text-[13px] text-[#A0A8AD]">Create a support request on behalf of a customer.</span>
        
        {/* Reply Channel */}
        <div className="flex flex-col gap-2 mt-2 w-full">
          <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">REPLY CHANNEL</span>
          <div className="flex gap-2">
            <button onClick={() => setChannel('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">Email</span>
            </button>
            <button onClick={() => setChannel('WhatsApp')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'WhatsApp' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">WhatsApp</span>
            </button>
          </div>
          <span className="text-[12px] text-[#A0A8AD]">Replies will be sent by {channel.toLowerCase()}. The channel stays fixed for this ticket.</span>
        </div>

        {/* Contact Fields */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Full name *</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('fullName') }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Email *</span>
            <input name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('email') }} />
          </div>
        </div>

        {/* Optional Details */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Phone number</span>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Machine ID / Location</span>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
        </div>

        {/* Classification */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Account type *</span>
            <select name="accountType" value={formData.accountType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('accountType'), color: formData.accountType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select account type</option>
              <option value="Customer / Guest">Customer / Guest</option>
              <option value="B2B Partner">B2B Partner</option>
              <option value="Internal">Internal</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Request type *</span>
            <select name="requestType" value={formData.requestType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('requestType'), color: formData.requestType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select request type</option>
              <option value="Payment / Refund">Payment / Refund</option>
              <option value="Machine Malfunction">Machine Malfunction</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Subject & Message */}
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Subject *</span>
          <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe the request" 
            className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
            style={{ borderColor: getBorderColor('subject') }} />
        </div>
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Message / Description *</span>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What happened? Include any details that will help us." 
            className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
            style={{ borderColor: getBorderColor('description') }} />
        </div>

        {/* Media Upload (Visual only) */}
        <div className="flex w-full h-[48px] px-3 mt-2 items-center rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-[12px] text-[#A0A8AD]">＋ Add photos, video or audio</span>
        </div>

        {/* Notification choice */}
        <div className="flex flex-col gap-1 mt-2 w-full">
          <span className="text-[12px] text-[#EFF2F0]">✓ Send a ticket confirmation to the customer</span>
          <span className="text-[11px] text-[#A0A8AD]">New tickets start as Open. * Required fields</span>
        </div>

        <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>

        {/* Errors & Footer */}
        {showErrors && (
          <span className="text-[12px] text-[#F38C86]">Please complete the required fields before creating this ticket.</span>
        )}
        
        <div className="flex w-full justify-end items-center gap-2.5 mt-1">
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Cancel</span>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? '...' : 'Create ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}



