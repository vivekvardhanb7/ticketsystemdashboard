Created At: 2026-09-25T16:59:58+05:30
Completed At: 2026-09-25T17:00:01+05:30

The command exited with code 0.
Output:
    </div>
  );
}

/* -------------------------------------------------------------------------- */
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

