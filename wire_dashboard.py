import re

with open('AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the export default function line
code = re.sub(
    r'export default function AdminDashboardView\(\) \{.*?const tickets = \[.*?\];',
    '''export default function AdminDashboardView({ tickets, onNewTicket, onTicketClick }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const mappedTickets = tickets.map(t => ({
    id: t.id,
    reference: '#' + t.ticketId,
    created: new Date(t.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    channel: t.source || t.channel || 'Website form',
    channelColor: 'text-[#78EF63]',
    subject: t.subject,
    description: t.message || '',
    media: t.attachments && t.attachments.length > 0 ? \\ files\ : 'No media',
    requester: t.requesterName || 'Unknown',
    email: t.requesterEmail || t.email || 'No email',
    accountType: t.accountType || 'Customer / Guest',
    accountTypeColor: 'text-[#A0A8AD]',
    machine: t.machineId || 'Not provided',
    location: t.machineLocation || '—',
    requestType: t.requestType || 'Support',
    status: t.status,
    statusColor: t.status === 'OPEN' ? 'text-[#78EF63]' : (t.status === 'IN_PROGRESS' ? 'text-[#F1B568]' : 'text-[#A0A8AD]')
  }));
''', code, flags=re.DOTALL)

# Fix the map inside the render
code = code.replace('{tickets.map((ticket) => (', '{mappedTickets.map((ticket) => (')
code = code.replace('isSelected={selectedTicket === ticket.id}', 'isSelected={selectedTicket === ticket.id}\\n                onClick={() => onTicketClick(tickets.find(t => t.id === ticket.id))}')

# Fix QueueStat logic
code = code.replace('value="24"', 'value={tickets.filter(t => t.status === \\'OPEN\\').length}')
code = code.replace('value="13"', 'value={tickets.filter(t => t.status === \\'IN_PROGRESS\\').length}')
code = code.replace('value="12"', 'value={tickets.filter(t => t.status === \\'CLOSED\\').length}')

# Fix new ticket button
code = code.replace('<FilterButton label="+ New ticket" isSuccess />', '<div onClick={onNewTicket}><FilterButton label="+ New ticket" isSuccess /></div>')

# Fix TicketRow to accept onClick
code = code.replace('const TicketRow = ({ ticket, isSelected }) => {', 'const TicketRow = ({ ticket, isSelected, onClick }) => {')
code = code.replace('cursor-pointer}>', 'cursor-pointer} onClick={onClick}>')

with open('AdminDashboardView.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Wired AdminDashboardView.jsx")
