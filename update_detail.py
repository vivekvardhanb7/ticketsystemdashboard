import re

with open('TicketDetailPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix typo
code = code.replace('Satoshinal', 'Internal')

# Status pill
pill_logic = '''
            <div className={lex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border text-[11px] font-medium }>
              {ticket.status === 'OPEN' ? 'Open' : ticket.status === 'IN_PROGRESS' ? 'In Progress' : 'Closed'}
            </div>
'''
code = re.sub(r'<div className="flex py-\[9px\].*?Open\s*</div>', pill_logic.strip(), code, flags=re.DOTALL)

# Action buttons
buttons_logic = '''
          {ticket.status === 'OPEN' && (
            <>
              <button onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')} disabled={isUpdating} className="flex h-[34px] px-[12px] items-center gap-[8px] rounded-[7px] border border-[#345135] bg-[#78EF63] text-[#0C0D0E] text-[12px] font-medium hover:opacity-90 transition-opacity">
                Start progress
              </button>
              <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="flex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border border-[#572629] bg-[#291214] text-[#F58C91] text-[11px] font-medium hover:bg-[#3a181b] transition-colors">
                Close ticket
              </button>
            </>
          )}
          {ticket.status === 'IN_PROGRESS' && (
            <button onClick={() => onStatusChange(ticket.id, 'CLOSED')} disabled={isUpdating} className="flex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border border-[#572629] bg-[#291214] text-[#F58C91] text-[11px] font-medium hover:bg-[#3a181b] transition-colors">
              Close ticket
            </button>
          )}
          {ticket.status === 'CLOSED' && (
            <button onClick={() => onStatusChange(ticket.id, 'OPEN')} disabled={isUpdating} className="flex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border border-[#282C2F] bg-[#111315] text-[#B2B8C2] text-[11px] font-medium hover:bg-[#1a1c1e] transition-colors">
              Reopen ticket
            </button>
          )}
'''
code = re.sub(r'<button className="flex h-\[34px\].*?Close ticket\s*</button>', buttons_logic.strip(), code, flags=re.DOTALL)

# Reply Modes dynamic
reply_modes = '''
              <button onClick={() => setReplyMode('channel')} className={lex py-[7px] px-[11px] items-start gap-[6px] rounded-[9px] border transition-colors }>
                <span className="text-[10px] font-medium">Reply by {ticket.source === 'WhatsApp' ? 'WhatsApp' : 'email'}</span>
              </button>
              <button onClick={() => setReplyMode('internal')} className={lex py-[7px] px-[11px] items-start gap-[6px] rounded-[9px] border transition-colors }>
                <span className="text-[10px] font-medium">Internal note</span>
              </button>
'''
code = re.sub(r'<button className="flex py-\[7px\].*?Internal note\s*</span>\s*</button>', reply_modes.strip(), code, flags=re.DOTALL)

# Textarea and footer
textarea_logic = '''
            <div className="flex w-full p-[14px] items-start gap-[8px] rounded-[10px] bg-[#080809]">
              <textarea 
                className="w-full bg-transparent border-none outline-none text-[#575C66] placeholder:text-[#575C66] text-[11px] font-normal resize-none focus:ring-0" 
                placeholder={replyMode === 'internal' ? "Write an internal note..." : Write a reply to …}
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>

            {/* Composer Footer */}
            <div className="flex justify-between items-center w-full">
              <span className="text-[#575C66] text-[9px] font-normal">
                {replyMode === 'internal' ? 'Notes are only visible to staff.' : To:  · Replies stay on .}
              </span>
              <button 
                onClick={() => {
                   if (!message.trim()) return;
                   setSending(true);
                   onEmailSent(message, replyMode === 'internal' ? 'Internal Note' : Reply to: )
                     .then(() => { setMessage(''); setSending(false); })
                     .catch(() => setSending(false));
                }}
                disabled={sending || ticket.status === 'CLOSED'}
                className={lex py-[8px] px-[14px] items-center gap-[6px] rounded-[9px] transition-colors }>
                <span className={${ticket.status === 'CLOSED' ? 'text-[#A0A8AD]' : 'text-[#050A05]'} text-[10px] font-semibold}>
                  {sending ? 'Sending...' : (replyMode === 'internal' ? 'Add note' : 'Send reply')}
                </span>
              </button>
'''
code = re.sub(r'<div className="flex w-full p-\[14px\].*?</button>', textarea_logic.strip(), code, flags=re.DOTALL)

# Add setReplyMode hook default
code = code.replace("const [replyMode, setReplyMode] = React.useState('email');", "const [replyMode, setReplyMode] = React.useState('channel');")

with open('TicketDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated TicketDetailPage.jsx dynamic states")
