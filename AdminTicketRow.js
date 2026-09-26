function AdminTicketRow({ ticket, isSelected, onClick, visibleColumns = { reference: true, subject: true, requester: true, machine: true, requestType: true, status: true } }) {
  const formatShortDate = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const channel = ticket.channel || 'Website form';
  const mediaCount = ticket.media?.length || 0;
  const mediaLabel = mediaCount > 0 ? `${mediaCount === 1 ? (ticket.media[0]?.type?.startsWith('image') ? 'Photo' : 'File') : 'Files'} · ${mediaCount} file${mediaCount > 1 ? 's' : ''}` : null;

  const statusColor = ticket.status === 'OPEN' ? COLORS.primary[500]
    : ticket.status === 'IN_PROGRESS' ? COLORS.secondary[500]
    : COLORS.text.disabled;

  const statusLabel = ticket.status === 'OPEN' ? 'Open'
    : ticket.status === 'IN_PROGRESS' ? 'In Progress'
    : 'Closed';

  return (
    <div
      className="flex items-center h-[80px] px-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
      style={{ backgroundColor: isSelected ? COLORS.activeBg : 'transparent' }}
      onClick={onClick}
    >
      {/* REFERENCE / CREATED */}
      {visibleColumns.reference && <div className="w-[160px] shrink-0 flex flex-col">
        <span className="text-xs font-medium" style={{ color: COLORS.text.heading }}>#{ticket.ticketId}</span>
        <span className="text-[11px]" style={{ color: COLORS.text.body }}>{formatShortDate(ticket.createdAt)}</span>
        <span className="text-[11px]" style={{ color: channel === 'Website form' && isSelected ? COLORS.primary[500] : COLORS.text.body }}>{channel}</span>
      </div>}

      {/* SUBJECT / DESCRIPTION */}
      {visibleColumns.subject && <div className="flex-1 min-w-[200px] flex flex-col">
        <span className="text-[13px] font-medium truncate" style={{ color: COLORS.text.heading }}>{ticket.subject || 'No Subject'}</span>
        <span className="text-[11px] truncate" style={{ color: COLORS.text.body }}>{ticket.description || 'No description'}</span>
        {mediaLabel
          ? <span className="text-[11px]" style={{ color: COLORS.text.body }}>{mediaLabel}</span>
          : <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>No media</span>
        }
      </div>}

      {/* REQUESTER / ACCOUNT */}
      {visibleColumns.requester && <div className="w-[220px] shrink-0 flex flex-col">
        <span className="text-[13px] font-medium" style={{ color: COLORS.text.heading }}>{ticket.contactPerson || 'Unknown User'}</span>
        <span className="text-[11px] truncate" style={{ color: COLORS.text.body }}>{ticket.email || ticket.phone || '-'}</span>
        <span className="text-[11px]" style={{ color: !ticket.accountType || ticket.accountType === 'Customer' ? COLORS.text.body : COLORS.secondary[500] }}>
          {ticket.accountType || 'Customer'}{ticket.accountType === 'Customer' ? ' / Guest' : ''}
        </span>
      </div>}

      {/* MACHINE / LOCATION */}
      {visibleColumns.machine && <div className="w-[180px] shrink-0 flex flex-col">
        {ticket.machineId && ticket.machineId !== 'N/A' && ticket.machineId !== '' ? (
          <span className="text-xs" style={{ color: COLORS.text.heading }}>{ticket.machineId}</span>
        ) : (
          <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>-</span>
        )}
        
        {ticket.location && ticket.location !== 'N/A' && ticket.location !== '' ? (
          <span className="text-[11px]" style={{ color: COLORS.text.body }}>{ticket.location}</span>
        ) : (
          <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>-</span>
        )}
      </div>}

      {/* REQUEST TYPE */}
      {visibleColumns.requestType && <div className="w-[180px] shrink-0">
        <span className="text-xs" style={{ color: COLORS.text.heading }}>{ticket.requestType}</span>
      </div>}

      {/* STATUS */}
      {visibleColumns.status && <div className="w-[120px] shrink-0">
        <span className="text-xs font-medium" style={{ color: statusColor }}>{statusLabel}</span>
      </div>}
    </div>
  );
}