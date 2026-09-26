import re

with open('TicketDetailPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = '''export default function TicketDetailPage({ ticket, emails, onBack, onStatusChange, isUpdating, onEmailSent, setToast }) {
  const [replyMode, setReplyMode] = React.useState('email');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  
  const formatDate = (d) => new Date(d).toLocaleString();

  return (
'''

code = code.replace('export default function TicketDetailPage() {\\n  return (', replacement)
code = code.replace('← Back', '← Back')
code = code.replace('<button className="flex py-[9px] px-[12px] items-center gap-[6px] rounded-[10px] border border-[#282C2F] bg-[#111315] text-[#B2B8C2] font-medium text-[12px] hover:bg-white/5 transition-colors">', '<button onClick={onBack} className="flex py-[9px] px-[12px] items-center gap-[6px] rounded-[10px] border border-[#282C2F] bg-[#111315] text-[#B2B8C2] font-medium text-[12px] hover:bg-white/5 transition-colors">')

code = code.replace('#NAF-260921 · Card charged, no product dispensed', '#{ticket.ticketId} · {ticket.subject}')
code = code.replace('Website form · Sarah Klein · Created 21 Sep 2026, 11:24 CEST', '{ticket.source || "Website form"} · {ticket.requesterName} · Created {formatDate(ticket.createdAt)}')

# Replace static conversation with emails map
emails_code = '''
          <div className="flex flex-col py-1 gap-[12px] w-full flex-grow">
            {/* Original message */}
            <div className="flex flex-col p-[14px_16px] gap-[9px] w-full rounded-[14px] border border-[#1C381F] bg-[#0E180F]">
              <div className="flex justify-between items-start w-full">
                <span className="text-[#63E070] text-[10px] font-medium">{ticket.requesterName} · {ticket.source || 'Website form'}</span>
                <span className="text-[#666B78] text-[10px] font-normal">{formatDate(ticket.createdAt)}</span>
              </div>
              <p className="text-[#C4C9D1] text-[12px] font-normal m-0 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
            </div>
            
            {/* Dynamic emails */}
            {emails.map((email, idx) => (
              <div key={idx} className={lex flex-col p-[14px_16px] gap-[9px] w-full rounded-[14px] border border-[#212429] }>
                <div className="flex justify-between items-start w-full">
                  <span className="text-[#87ABE5] text-[10px] font-medium">{email.direction === 'sent' ? 'NAF Support' : email.senderName}</span>
                  <span className="text-[#666B78] text-[10px] font-normal">{formatDate(email.receivedAt)}</span>
                </div>
                <p className="text-[#C4C9D1] text-[12px] font-normal m-0 leading-relaxed whitespace-pre-wrap">{email.bodyContent}</p>
              </div>
            ))}
          </div>
'''
code = re.sub(r'<div className="flex flex-col py-1 gap-\[12px\] w-full flex-grow">.*?</div>\s*</div>\s*\{/\* Reply Composer \*/\}', emails_code + '\\n          {/* Reply Composer */}', code, flags=re.DOTALL)

with open('TicketDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
