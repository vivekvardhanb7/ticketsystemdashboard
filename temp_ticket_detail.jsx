
/* -------------------------------------------------------------------------- */
/* TICKET DETAIL PAGE (Full-Page Conversation View)                           */
/* -------------------------------------------------------------------------- */

function TicketDetailPage({ ticket, emails, onBack, onStatusChange, isUpdating, onEmailSent, setToast }) {
  const [replyMode, setReplyMode] = useState('email'); // 'email' or 'internal'
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const channel = ticket.channel || 'Website form';
  
  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' CEST';
  };

  const handleSendReply = async () => {
    if (!message.trim()) return;
    setSending(true);

    if (replyMode === 'email') {
      let webhookSuccess = false;
      try {
        await triggerN8nEmail(ticket, 'REPLY_SENT', message);
        webhookSuccess = true;
      } catch (err) {
        console.warn('n8n webhook not available:', err.message);
      }
      
      const newEmail = {
        id: Math.random().toString(36).substring(2, 9),
        subject: `Re: ${ticket.subject || ticket.ticketId}`,
        message,
        attachments: [],
        sentAt: new Date().toISOString(),
        senderType: 'Admin',
        senderName: 'NAF Support',
        direction: 'sent',
      };
      
      onEmailSent(ticket.id, newEmail);
      setToast({ title: "Email Sent", message: webhookSuccess ? `Reply sent to ${ticket.email}` : 'Reply saved locally (webhook unavailable)' });
    } else {
      // Internal note
      const newEmail = {
        id: Math.random().toString(36).substring(2, 9),
        subject: 'Internal Note',
        message,
        attachments: [],
        sentAt: new Date().toISOString(),
        senderType: 'Admin',
        senderName: 'Internal Note',
        direction: 'sent',
      };
      onEmailSent(ticket.id, newEmail);
      setToast({ title: "Note Added", message: "Internal note saved to conversation." });
    }
    
    setMessage('');
    setSending(false);
  };

  const statusColor = ticket.status === 'OPEN' ? '#61ED54'
    : ticket.status === 'IN_PROGRESS' ? COLORS.secondary[500]
    : COLORS.text.disabled;
  const statusBg = ticket.status === 'OPEN' ? '#122614'
    : ticket.status === 'IN_PROGRESS' ? '#2A1B0A'
    : '#111315';
  const statusBorder = ticket.status === 'OPEN' ? '#245229'
    : ticket.status === 'IN_PROGRESS' ? '#4A3215'
    : COLORS.border;
  const statusLabel = ticket.status === 'OPEN' ? 'Open'
    : ticket.status === 'IN_PROGRESS' ? 'In Progress'
    : 'Closed';

  return (
    <div className="flex flex-col h-full bg-[#09090A] fixed inset-0 z-40 overflow-hidden" style={{ minHeight: '100vh', fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 h-[70px] shrink-0 border-b border-[#212429] bg-[#09090A]">
        <div className="flex items-center gap-3.5">
          <button onClick={onBack} className="px-3 py-2 rounded-[10px] border border-[#282C2F] bg-[#111315] hover:bg-white/5 transition-colors">
            <span className="text-xs font-medium text-[#B2B8C2]">← Back</span>
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[20px] font-semibold text-[#EBEDF2] font-heading">#{ticket.ticketId} · {ticket.subject || ticket.problemType || 'No Subject'}</span>
            <span className="text-[11px] text-[#737885]">{channel} · {ticket.contactPerson} · Created {formatDate(ticket.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isUpdating && <RefreshCw className="w-4 h-4 text-white animate-spin mr-2" />}
          <div className="px-3 py-2 rounded-[10px] border" style={{ backgroundColor: statusBg, borderColor: statusBorder }}>
            <span className="text-[11px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          
          {ticket.status === 'OPEN' && (
            <>
              <button onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')} disabled={isUpdating} className="h-[34px] px-3 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
                <span className="text-xs font-medium text-[#0C0D0E]">Start progress</span>
              </button>
              <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="px-3 py-2 rounded-[10px] border border-[#572629] bg-[#291214] hover:opacity-90 transition-opacity">
                <span className="text-[11px] font-medium text-[#F58C91]">Close ticket</span>
              </button>
            </>
          )}
          {ticket.status === 'IN_PROGRESS' && (
            <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="px-3 py-2 rounded-[10px] border border-[#572629] bg-[#291214] hover:opacity-90 transition-opacity">
              <span className="text-[11px] font-medium text-[#F58C91]">Close ticket</span>
            </button>
          )}
          {ticket.status === 'CLOSED' && (
            <button onClick={() => onStatusChange(ticket.id, 'OPEN')} disabled={isUpdating} className="h-[34px] px-3 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity">
              <span className="text-xs font-medium text-[#0C0D0E]">Reopen ticket</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex p-6 gap-5 h-[calc(100vh-70px)] overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-6 pr-2">
          
          {/* Ticket Details */}
          <div className="p-4 flex flex-col gap-3.5 rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <span className="text-xs font-semibold text-[#D1D6DE]">Ticket details</span>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Source</span>
              <span className="text-[10px] font-medium text-[#52D170]">{channel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Request type</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.requestType || 'General'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Account type</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.accountType || 'Customer / Guest'}</span>
            </div>
          </div>

          {/* Requester */}
          <div className="p-4 flex flex-col gap-3.5 rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <span className="text-xs font-semibold text-[#D1D6DE]">Requester</span>
            <span className="text-[13px] font-semibold text-[#E8EBF0]">{ticket.contactPerson || 'Unknown User'}</span>
            {ticket.email && <span className="text-[10px] text-[#7A808C]">{ticket.email}</span>}
            {ticket.phone && <span className="text-[10px] text-[#7A808C]">{ticket.phone}</span>}
            <span className="text-[11px] text-[#A0A8AD]">{ticket.accountType || 'Customer / Guest'}</span>
          </div>

          {/* Related Context */}
          <div className="p-4 flex flex-col gap-3.5 rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <span className="text-xs font-semibold text-[#D1D6DE]">Related context</span>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Transaction</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">—</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Payment</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">—</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Amount</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">—</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Machine</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.machineId || ticket.location || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Location</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.location || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Machine status</span>
              <span className="text-[10px] font-medium text-[#61E557]">Online</span>
            </div>
          </div>
        </div>

        {/* Conversation Workspace */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[1200px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[14px] font-semibold text-[#E5E8ED]">Conversation</span>
            <span className="text-[10px] text-[#6E7380]">{channel === 'WhatsApp' ? 'WhatsApp → WhatsApp replies' : `${channel} → Email replies`}</span>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 pb-4">
            {emails?.map((msg, i) => {
              const isCustomer = msg.direction === 'received' && msg.senderType !== 'System';
              const isSystem = msg.senderType === 'System';
              const isInternal = msg.subject === 'Internal Note';
              const isServiceTeam = (msg.senderName || '').toLowerCase().includes('service');
              
              let msgStyle = { border: 'border-[#212429]', bg: 'bg-[#0C0C0E]', metaColor: 'text-[#87ABE5]' };
              if (isCustomer) msgStyle = { border: 'border-[#1C381F]', bg: 'bg-[#0E180F]', metaColor: 'text-[#63E070]' };
              if (isInternal) msgStyle = { border: 'border-[#45361A]', bg: 'bg-[#1B1409]', metaColor: 'text-[#F5B24F]' };
              if (isServiceTeam) msgStyle = { border: 'border-[#2E2940]', bg: 'bg-[#13111A]', metaColor: 'text-[#AB99F2]' };

              const timeStr = new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={i} className={`p-3.5 flex flex-col gap-2 rounded-[14px] border ${msgStyle.border} ${msgStyle.bg}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-medium ${msgStyle.metaColor}`}>
                      {isInternal ? 'Internal note' : isServiceTeam ? `${msg.senderName} · Internal` : `${msg.senderName} · ${isCustomer ? channel : 'Email'}`}
                    </span>
                    <span className="text-[10px] text-[#666B78]">{timeStr}</span>
                  </div>
                  <div className="text-[12px] text-[#C4C9D1] whitespace-pre-wrap">{msg.message}</div>
                  
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {msg.attachments.map((att, j) => (
                        <span key={j} className="text-[11px] text-[#78EF63] cursor-pointer hover:underline">
                          {att.name} · {att.type?.startsWith('image') ? 'Image' : 'File'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reply Composer */}
          <div className="mt-3 p-3.5 flex flex-col gap-3 rounded-[14px] border border-[#212429] bg-[#0B0B0D] shrink-0">
            {ticket.status === 'CLOSED' ? (
              <>
                <div className="p-3.5 rounded-[10px] bg-[#080809]">
                  <span className="text-[11px] text-[#575C66]">This ticket is closed. Reopen it to reply.</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                <span className="text-[9px] text-[#575C66]">{channel === 'WhatsApp' ? `To: ${ticket.phone} · Replies stay on WhatsApp.` : `To: ${ticket.email} · Replies stay on email.`}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button onClick={() => setReplyMode('email')} className={`px-3 py-1.5 rounded-[9px] border text-[10px] font-medium transition-colors ${replyMode === 'email' ? 'bg-[#142917] border-[#26522B] text-[#66EB5C]' : 'bg-[#0E0F10] border-[#24262B] text-[#8F94A1]'}`}>
                    {channel === 'WhatsApp' ? 'Reply by WhatsApp' : 'Reply by email'}
                  </button>
                  <button onClick={() => setReplyMode('internal')} className={`px-3 py-1.5 rounded-[9px] border text-[10px] font-medium transition-colors ${replyMode === 'internal' ? 'bg-[#2A1E0D] border-[#4A3215] text-[#F5B24F]' : 'bg-[#0E0F10] border-[#24262B] text-[#8F94A1]'}`}>
                    Internal note
                  </button>
                </div>
                
                <div className="rounded-[10px] bg-[#080809] border border-transparent focus-within:border-[#212429] transition-colors">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={replyMode === 'email' ? `Write a reply to ${ticket.contactPerson}…` : "Write an internal note…"}
                    className="w-full bg-transparent p-3.5 text-[12px] text-[#C4C9D1] outline-none resize-none min-h-[80px]"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-[#575C66]">
                    {replyMode === 'email' 
                      ? (channel === 'WhatsApp' ? `To: ${ticket.phone} · Replies stay on WhatsApp.` : `To: ${ticket.email} · Replies stay on email.`)
                      : 'Notes are only visible to staff.'}
                  </span>
                  <button 
                    onClick={handleSendReply}
                    disabled={!message.trim() || sending}
                    className="px-3.5 py-2 rounded-[9px] bg-[#47EB3D] disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    {sending && <RefreshCw className="w-3 h-3 text-[#050A05] animate-spin" />}
                    <span className="text-[10px] font-semibold text-[#050A05]">{replyMode === 'email' ? 'Send reply' : 'Save note'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMAIL MODAL                                                                 */
/* -------------------------------------------------------------------------- */



