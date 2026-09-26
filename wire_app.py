import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_jsx = f.read()

app_jsx = app_jsx.replace(
    "import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';",
    "import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';\nimport AdminDashboardView from './AdminDashboardView';\nimport NewTicketModal from './NewTicketModal';\nimport TicketDetailPage from './TicketDetailPage';\n"
)

# Remove NewTicketModal, TicketDetailPage, AdminDashboard functions from App.jsx so they use the imported ones
app_jsx = re.sub(r'function NewTicketModal\(\{.*?\}\) \{.*?\}\n(?=function TicketDetailPage)', '', app_jsx, flags=re.DOTALL)
app_jsx = re.sub(r'function TicketDetailPage\(\{.*?\}\) \{.*?\}\n(?=function AdminDashboard)', '', app_jsx, flags=re.DOTALL)

dashboard_wrapper = '''
function AdminDashboard({ isAuthenticated, tickets, loading, fetchError, onRetry, setTickets, setToast }) {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [emailHistory, setEmailHistory] = useState({});

  useEffect(() => {
    if (!viewTicket) return;
    const fetchEmails = async () => {
      try {
        const res = await fetch(/api/NAFWebsite/issue//emails);
        if (res.ok) {
          const data = await res.json();
          setEmailHistory(prev => ({ ...prev, [viewTicket.id]: data }));
        }
      } catch (err) {}
    };
    fetchEmails();
  }, [viewTicket]);

  if (viewTicket) {
    return <TicketDetailPage ticket={viewTicket} emails={emailHistory[viewTicket.id] || []} onBack={() => setViewTicket(null)} />;
  }

  return (
    <>
      <NewTicketModal isOpen={newTicketOpen} onClose={() => setNewTicketOpen(false)} isAuthenticated={isAuthenticated} onTicketCreated={(t) => setTickets(p => [t, ...p])} />
      <AdminDashboardView tickets={tickets} onNewTicket={() => setNewTicketOpen(true)} onTicketClick={t => setViewTicket(t)} />
    </>
  );
}
'''

app_jsx = re.sub(r'function AdminDashboard\(\{.*?\}\) \{.*?(?=\nexport default function App)', dashboard_wrapper, app_jsx, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_jsx)

