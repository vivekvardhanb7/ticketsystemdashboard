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
/* N8N UNIFIED EVENT WEBHOOK                                                  */
/* -------------------------------------------------------------------------- */

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ fileName: file.name, mimeType: file.type || 'application/octet-stream', data: reader.result.split(',')[1] });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const triggerN8nEmail = async (ticket, eventType, message = '', attachments = []) => {
  const WEBHOOK_URL = 'https://n8n.naf-cloudsystem.de/webhook/ticket-events';
  try {
    const payload = {
      eventType,
      ticketStatus: ticket.status || 'OPEN',
      to: ticket.email || '',
      toName: ticket.contactPerson || '',
      subject: ticket.subject || ticket.ticketId || '',
      ticketId: ticket.id || '',
      ticketRef: ticket.ticketId || '',
      requestType: ticket.requestType || 'Support Request',
    };
    if (message) payload.message = message;

    if (attachments && attachments.length > 0) {
      payload.attachments = await Promise.all(attachments.map(fileToBase64));
    }

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('n8n email trigger failed:', err);
  }
};

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
      
      const targetTicket = tickets.find(t => t.id === ticketId) || {};
      triggerN8nEmail({ ...targetTicket, status: newStatus }, 'STATUS_CHANGED');
      
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
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please choose a smaller file.");
      } else {
        setAttachment(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
  };
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    let oversizeCount = 0;
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) oversizeCount++;
      else validFiles.push(file);
    });

    if (oversizeCount > 0) {
      alert(`${oversizeCount} file(s) exceeded the 5MB limit and were removed.`);
    }

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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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