function AdminDashboard({ isAuthenticated, tickets, loading, fetchError, onRetry, setTickets, setToast }) {
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
        if (t.id === ticketId) {
          const updated = { ...t, status: newStatus };
          if (newStatus === 'CLOSED') updated.closedAt = new Date().toISOString();
          else updated.closedAt = null;
          return updated;
        }
        return t;
      }));
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
      if (counts[ch] !== undefined) counts[ch]++;
      else counts['Website form']++;
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length
  }), [tickets]);

  const totalActive = stats.open + stats.inProgress;

  // Channel counts
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

    // Status filter — map display labels to API values
    const statusMap = { 'Open': 'OPEN', 'In Progress': 'IN_PROGRESS', 'Closed': 'CLOSED' };
    if (filter === 'All') {
      // "All active" = not closed
      result = result.filter(t => t.status !== 'CLOSED');
    } else {
      const mapped = statusMap[filter] || filter;
      result = result.filter(t => t.status === mapped);
    }

    // Channel filter
    if (channelFilter !== 'All') {
      result = result.filter(t => (t.channel || 'Website form') === channelFilter);
    }

    // Request type filter
    if (reqTypeFilter !== 'All') {
      result = result.filter(t => (t.requestType || 'General') === reqTypeFilter);
    }
    
    // Account type filter
    if (accTypeFilter !== 'All') {
      if (accTypeFilter === 'Not collected') {
        result = result.filter(t => !t.accountType || t.accountType === 'Not collected' || t.accountType === '');
      } else if (accTypeFilter === 'Customer / Guest') {
        result = result.filter(t => t.accountType === 'Customer / Guest' || t.accountType === 'Customer');
      } else {
        result = result.filter(t => t.accountType === accTypeFilter);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      );
    }

    return result;
  }, [tickets, filter, channelFilter, reqTypeFilter, accTypeFilter, searchQuery]);

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
      {/* Ticket Table Card */}
      <div className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>

        {/* Queue Controls */}
        <div className="p-4 flex flex-col gap-4">
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
                placeholder="Search name, email, phone, reference…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-[36px] w-[322px] pl-3 pr-8 rounded-[7px] border text-xs outline-none"
                style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.text.heading }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3" style={{ color: COLORS.text.disabled }} />
                </button>
              )}
            </div>

            <PillButton label="Columns" active={false} />
            <PillButton label="Filter" active={false} />
          </div>

          {/* Row 2: Channel filters + classification dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <PillButton label="All channels" count={tickets.length} active={channelFilter === 'All'} onClick={() => setChannelFilter('All')} />
            <PillButton label="Website form" count={channelCounts['Website form']} active={channelFilter === 'Website form'} onClick={() => setChannelFilter('Website form')} />
            <PillButton label="Email" count={channelCounts['Email']} active={channelFilter === 'Email'} onClick={() => setChannelFilter('Email')} />
            <PillButton label="WhatsApp" count={channelCounts['WhatsApp']} active={channelFilter === 'WhatsApp'} onClick={() => setChannelFilter('WhatsApp')} />

            <div className="w-6" />

            <PillButton label="Request type  ↓" active={false} />
            <PillButton label="Account type  ↓" active={false} />
            <PillButton label="Status  ↓" active={false} />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          {/* Divider */}
          <div className="h-[1px]" style={{ backgroundColor: COLORS.border }} />

          {/* Column Headings */}
          <div className="flex items-center h-[40px] px-4" style={{ backgroundColor: COLORS.backgrounds.input }}>
            <div className="w-[160px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Reference / Created</div>
            <div className="w-[430px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Subject / Description</div>
            <div className="w-[270px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Requester / Account</div>
            <div className="w-[230px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Machine / Location</div>
            <div className="w-[260px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Request Type</div>
            <div className="w-[154px] shrink-0 text-[10px] font-medium uppercase" style={{ color: COLORS.text.body }}>Status</div>
          </div>

          {/* Rows */}
          {loading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : paginatedTickets.map(ticket => (
            <React.Fragment key={ticket.id}>
              <div className="h-[1px]" style={{ backgroundColor: COLORS.border }} />
              <AdminTicketRow
                ticket={ticket}
                isSelected={selectedTicketId === ticket.id}
                onClick={() => handleRowClick(ticket)}
              />
            </React.Fragment>
          ))}
    return [initialEmail, ...stored];
  }, [emailHistory]);

  const handleRowClick = (ticket) => {
    setSelectedTicketId(ticket.id);
    setViewTicket(ticket);
  };

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Full-page detail view when a ticket is selected
  if (viewTicket) {
    return (
      <>
        <TicketDetailPage
          ticket={viewTicket}
          emails={getTicketEmails(viewTicket)}
          onBack={() => { setViewTicket(null); setSelectedTicketId(null); }}
          onStatusChange={handleStatusChange}
          isUpdating={updatingId === viewTicket.id}
          onEmailSent={handleEmailSent}
          setToast={setToast}
          isAuthenticated={isAuthenticated}
          onDeleteClick={() => {
            const latest = tickets.find(t => t.id === viewTicket.id) || viewTicket;
            setViewTicket(null);
            setSelectedTicketId(null);
            setTimeout(() => setDeleteTicket(latest), 50);
          }}
        />
        {deleteTicket && <DeleteModal isAuthenticated={isAuthenticated} ticket={deleteTicket} setTickets={setTickets} onClose={() => setDeleteTicket(null)} setToast={setToast} />}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page Heading */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <h1 className="text-[28px] font-semibold leading-[38px] m-0" style={{ color: COLORS.text.heading }}>Support workspace</h1>
          <p className="text-[13px] m-0" style={{ color: COLORS.text.body }}>Every request. One queue. Website form, email and WhatsApp.</p>
        </div>
        <div className="flex items-center h-[34px] px-3 rounded-[7px] border"
          style={{ borderColor: COLORS.border }}>
          <span className="text-xs font-medium" style={{ color: COLORS.text.body }}>{todayStr}</span>
        </div>
        <button 
          onClick={() => setNewTicketOpen(true)}
          className="flex items-center h-[34px] px-3 rounded-[7px] border font-medium text-xs transition-colors hover:opacity-90"
          style={{ backgroundColor: COLORS.primary[500], borderColor: COLORS.activeBorder, color: COLORS.backgrounds.main }}>
          +  New ticket
        </button>
      </div>

      {/* Queue Overview KPI Strip */}
      <div className="flex rounded-[10px] border overflow-hidden kpi-animate"
        style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
        <QueueStat label="Open" value={stats.open} subtitle="Awaiting response" />
        <QueueStat label="In Progress" value={stats.inProgress} subtitle="Being handled" />
        <QueueStat label="Closed" value={stats.closed} subtitle="Closed today" valueColor={COLORS.primary[500]} />
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-4 p-4 rounded-[10px] border border-red-500/30 bg-red-500/10">
          <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">Failed to load tickets</p>
            <p className="text-xs text-red-300/60">{fetchError}</p>
          </div>
          <button onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Ticket Table Card */}
      <div className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>

        {/* Queue Controls */}
        <div className="p-4 flex flex-col gap-4">
          {/* Row 1: Status tabs + Search + Columns + Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <PillButton label="All active" count={totalActive} active={filter === 'All'} onClick={() => setFilter('All')} />
            <PillButton label="Open" count={stats.open} active={filter === 'Open'} onClick={() => setFilter('Open')} />
            <PillButton label="In Progress" count={stats.inProgress} active={filter === 'In Progress'} onClick={() => setFilter('In Progress')} />
            <PillButton label="Closed" count={stats.closed} active={filter === 'Closed'} onClick={() => setFilter('Closed')} />

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, email, phone, reference…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-[36px] w-[322px] pl-3 pr-8 rounded-[7px] border text-xs outline-none"
                style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.text.heading }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3" style={{ color: COLORS.text.disabled }} />
                </button>
              )}
            </div>

            <PillButton label="Columns" active={false} />
            <PillButton label="Filter" active={false} />
          </div>

          {/* Row 2: Channel filters + classification dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <PillButton label="All channels" count={tickets.length} active={channelFilter === 'All'} onClick={() => setChannelFilter('All')} />
            <PillButton label="Website form" count={channelCounts['Website form']} active={channelFilter === 'Website form'} onClick={() => setChannelFilter('Website form')} />
            <PillButton label="Email" count={channelCounts['Email']} active={channelFilter === 'Email'} onClick={() => setChannelFilter('Email')} />
            <PillButton label="WhatsApp" count={channelCounts['WhatsApp']} active={channelFilter === 'WhatsApp'} onClick={() => setChannelFilter('WhatsApp')} />

            <div className="w-6" />

            <FilterSelect 
              value={reqTypeFilter}
              onChange={(val) => setReqTypeFilter(val)}
              options={["Machine Issue", "Payment / Refund", "NAF Membership", "NAF Wallet", "Mobile App", "NAF.Cloud", "Reservation / Pickup", "Complaint", "Feedback / Suggestion", "Partnership / Business Support", "Other"]}
              defaultLabel="Request type"
            />
            <FilterSelect 
              )}
            </div>
            {/* Filter panel toggle */}
            <PillButton label="Filter" active={filterPanelOpen} onClick={() => setFilterPanelOpen(!filterPanelOpen)} />
          </div>

          {/* Row 2: Channel filters + classification dropdowns */}
          {filterPanelOpen && <div className="flex items-center gap-2 flex-wrap">
            <PillButton label="All channels" count={tickets.length} active={channelFilter === 'All'} onClick={() => setChannelFilter('All')} />
            <PillButton label="Website form" count={channelCounts['Website form']} active={channelFilter === 'Website form'} onClick={() => setChannelFilter('Website form')} />
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
              options={["Machine Issue", "Payment / Refund", "NAF Membership", "NAF Wallet", "Mobile App", "NAF.Cloud", "Reservation / Pickup", "Complaint", "Feedback / Suggestion", "Partnership / Business Support", "Other"]}
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

        {/* Desktop Table */}
        <div className="hidden md:block">
          {/* Divider */}
          <div className="h-[1px]" style={{ backgroundColor: COLORS.border }} />

          <div className="flex items-center h-[46px] px-4 gap-3">
            <span className="text-xs" style={{ color: COLORS.text.body }}>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * TICKETS_PER_PAGE + 1}–{Math.min(currentPage * TICKETS_PER_PAGE, filtered.length)} of {filtered.length} active tickets
            </span>
            <div className="flex-1" />
            <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>All times CEST</span>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center h-[34px] px-3 rounded-[7px] border transition-colors disabled:opacity-30"
              style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            >←</button>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium transition-colors"
                style={{
                  backgroundColor: currentPage === i + 1 ? COLORS.activeBg : 'transparent',
                  borderColor: currentPage === i + 1 ? COLORS.activeBorder : COLORS.border,
                  color: currentPage === i + 1 ? COLORS.primary[500] : COLORS.text.body,
                }}
              >{i + 1}</button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center h-[34px] px-3 rounded-[7px] border transition-colors disabled:opacity-30"
              style={{ borderColor: COLORS.border, color: COLORS.text.body }}
            >→</button>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden p-4 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
          ) : paginatedTickets.map((ticket, idx) => (
            <MobileTicketCard
              key={ticket.id}
              ticket={ticket}
              index={idx}
              onViewClick={() => handleRowClick(ticket)}
              onEmailClick={() => setEmailTicket(ticket)}
              onDeleteClick={() => setDeleteTicket(ticket)}
            />
          ))}
          {filtered.length === 0 && !loading && !fetchError && (
            <EmptyState hasSearch={!!searchQuery.trim()} />
          )}
        </div>
      </div>

      {/* Modals */}
      <NewTicketModal 
        isOpen={newTicketOpen} 
        onClose={() => setNewTicketOpen(false)} 
        onTicketCreated={(ticket) => setTickets(prev => [ticket, ...prev])}
        isAuthenticated={isAuthenticated} 
      />
      {emailTicket && <EmailModal ticket={emailTicket} onClose={() => setEmailTicket(null)} setToast={setToast} onEmailSent={handleEmailSent} />}
      {deleteTicket && <DeleteModal isAuthenticated={isAuthenticated} ticket={deleteTicket} setTickets={setTickets} onClose={() => setDeleteTicket(null)} setToast={setToast} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* QUEUE STAT                                                                  */
// MISSING LINE 1011
// MISSING LINE 1012
// MISSING LINE 1013
// MISSING LINE 1014
// MISSING LINE 1015
// MISSING LINE 1016
// MISSING LINE 1017
// MISSING LINE 1018
// MISSING LINE 1019
// MISSING LINE 1020
// MISSING LINE 1021
// MISSING LINE 1022
// MISSING LINE 1023
// MISSING LINE 1024
// MISSING LINE 1025
// MISSING LINE 1026
// MISSING LINE 1027
/* -------------------------------------------------------------------------- */

