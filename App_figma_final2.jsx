const ACCOUNT_TYPE_MAPPING = {
  "user": "Customer / Guest",
  "member": "NAF Member",
  "business": "Business / Partner",
  "other": "Other",
  "not_collected": "Not collected",
  "Not collected": "Not collected"
};

const REQUEST_TYPE_MAPPING = {
  "technical": "Machine Issue",
  "payment": "Payment / Refund",
  "membership": "NAF Membership",
  "wallet": "NAF Wallet",
  "mobile_app": "Mobile App",
  "naf_cloud": "NAF Cloud System",
  "reservation": "Reservation / Pickup",
  "complaint": "Complaint",
  "feedback": "Feedback / Suggestion",
  "partnership": "Partnership / Business Support",
  "other": "Other"
};

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

      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes shrinkWidth {
// MISSING LINE 161
// MISSING LINE 162
// MISSING LINE 163
// MISSING LINE 164
// MISSING LINE 165
// MISSING LINE 166
// MISSING LINE 167
// MISSING LINE 168
// MISSING LINE 169
// MISSING LINE 170
// MISSING LINE 171
// MISSING LINE 172
// MISSING LINE 173
// MISSING LINE 174
// MISSING LINE 175
// MISSING LINE 176
// MISSING LINE 177
// MISSING LINE 178
// MISSING LINE 179
// MISSING LINE 180
// MISSING LINE 181
// MISSING LINE 182
// MISSING LINE 183
// MISSING LINE 184
// MISSING LINE 185
// MISSING LINE 186
// MISSING LINE 187
// MISSING LINE 188
// MISSING LINE 189
// MISSING LINE 190
// MISSING LINE 191
// MISSING LINE 192
// MISSING LINE 193
// MISSING LINE 194
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .kpi-animate { animation: fadeInUp 0.2s ease-out; }

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
        const descText = item.description || item.bodyPreview || "";

        let extractedEmail = item.email || item.from || item.senderEmail || item.customerEmail || item.contactEmail || "";
        let contactName = item.fullName || item.contactPerson || item.senderName || "";

        if (typeof extractedEmail === 'object') {
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

        const year = new Date(item.submittedAt || item.createdDateTime || item.receivedDateTime || Date.now()).getFullYear();
        let numericId = 0;
        if (typeof item.id === 'number') {
           numericId = item.id;
        } else if (typeof item.id === 'string') {
           numericId = Math.abs(item.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) % 10000;
        }

        let parsedLocation = item.machineLocation || item.location;
        if (!parsedLocation && descText) {
          const locMatch = descText.match(/Machine Location:\s*(.+)/i);
          if (locMatch) parsedLocation = locMatch[1].trim();
        }

        const rawDate = item.submittedAt || item.createdDateTime || item.receivedDateTime || new Date().toISOString();
        const createdAt = rawDate && !rawDate.endsWith('Z') && !rawDate.includes('+') ? rawDate + 'Z' : rawDate;

        return {
          id: item.id?.toString() || Math.random().toString(36),
          ticketId: `NAF-${year}-${1000 + numericId}`,
          contactPerson: contactName || "Unknown User",
          email: typeof extractedEmail === 'string' ? extractedEmail : "",
          phone: item.phoneNumber || item.phone || "",
        };

        // ── Smart request type inference ──
        let requestType = item.requestType;
        if (!requestType || requestType === 'Email Support' || requestType === 'WhatsApp Support') {
          const subj = (item.subject || '').toLowerCase();
          const desc = (descText || '').toLowerCase();
          const combined = subj + ' ' + desc;
          if (/machine|automat|vending|gerät/i.test(combined)) requestType = 'Machine Issue';
          else if (/pay|refund|zahlung|erstattung|invoice|rechnung/i.test(combined)) requestType = 'Payment / Refund';
          else if (/member|mitglied/i.test(combined)) requestType = 'NAF Membership';
          else if (/wallet|guthaben/i.test(combined)) requestType = 'NAF Wallet';
          else if (/app|mobile/i.test(combined)) requestType = 'Mobile App';
          else if (/cloud|naf\.cloud/i.test(combined)) requestType = 'NAF.Cloud';
          else if (/reserv|pickup|abhol/i.test(combined)) requestType = 'Reservation / Pickup';
          else if (/complaint|beschwerde/i.test(combined)) requestType = 'Complaint';
          else if (/feedback|suggestion|vorschlag/i.test(combined)) requestType = 'Feedback / Suggestion';
          else if (/partner|business|geschäft/i.test(combined)) requestType = 'Partnership / Business Support';
          else requestType = 'Other';
        }

        // ── Smart channel detection ──
        let channel = item.channel || item.source || '';
        if (!channel || channel === 'Website form') {
          // Infer channel from API data shape
          if (item.source === 'Manual Entry') channel = item.channel || 'Email';
          else if (item.submittedAt && item.requestType) channel = 'Website form'; // website form has structured fields
          else if (item.from || item.senderEmail || item.receivedDateTime) channel = 'Email';
          else if (item.phoneNumber && !item.email && !item.from) channel = 'WhatsApp';
          else if (item.channel) channel = item.channel;
          else channel = 'Website form';
        }

        // ── Account type: only available from website form / manual entry ──
        const accountType = ACCOUNT_TYPE_MAPPING[item.accountType] || item.accountType || 'Customer';

        return {
          id: item.id?.toString() || Math.random().toString(36),
          ticketId: `NAF-${year}-${1000 + numericId}`,
          contactPerson: contactName || "Unknown User",
          email: typeof extractedEmail === 'string' ? extractedEmail : "",
          phone: item.phoneNumber || item.phone || "",
          requestType,
          problemType: item.subject || "Issue",
          subject: item.subject || "No Subject",
          description: descText,
          location: parsedLocation || "",
          machineId: item.machineId || "",
          accountType,
          channel,
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
            >
              <Globe className="w-4 h-4" style={{ color: COLORS.text.body }} />
              <span className="text-[13px] font-medium" style={{ color: COLORS.text.body }}>Language: English ↓</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[284px] p-4 rounded-[10px] border z-50 flex flex-col gap-3"
                style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
                <span className="text-[14px] font-semibold" style={{ color: COLORS.text.heading }}>Interface language</span>
                
              </div>
            )}
          </div>

          {/* Admin badge / Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border hover:bg-white/5 transition-colors cursor-pointer"
            style={{ backgroundColor: COLORS.backgrounds.sidebar, borderColor: '#26292E' }}
            title="Logout"
          >
            <span className="text-[11px] font-medium" style={{ color: '#A8ADB8' }}>Admin</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-6">
        {children}
      </main>
    </div>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[284px] p-4 rounded-[10px] border z-50 flex flex-col gap-3"
                style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
                <span className="text-[14px] font-semibold" style={{ color: COLORS.text.heading }}>Interface language</span>
                
              </div>
            )}
                  { code: 'en', label: 'English (EN)' },
                  { code: 'fr', label: 'Français (FR)' },
                  { code: 'it', label: 'Italiano (IT)' },
                  { code: 'es', label: 'Español (ES)' },
                ].map(lang => (
                  <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setLangOpen(false); }}
                    className="text-left text-[13px] font-normal leading-[20px] transition-colors hover:opacity-80"
                    style={{ color: selectedLang === lang.code ? '#78EF63' : '#EFF2F0' }}>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin badge / Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border hover:bg-white/5 transition-colors cursor-pointer"
            style={{ backgroundColor: COLORS.backgrounds.sidebar, borderColor: '#26292E' }}
            title="Logout"
          >
            <span className="text-[11px] font-medium" style={{ color: '#A8ADB8' }}>Admin</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-6">
        {children}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PILL BUTTON (reusable filter chip)                                          */
/* -------------------------------------------------------------------------- */

function PillButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {label}{count != null ? `  ${count}` : ''}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* ADMIN DASHBOARD                                                            */
/* -------------------------------------------------------------------------- */
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PILL BUTTON (reusable filter chip)                                          */
/* -------------------------------------------------------------------------- */

function PillButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {label}{count != null ? `  ${count}` : ''}
    </button>
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

function FilterSelect({ value, onChange, options, defaultLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-[34px] pl-3 pr-8 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors outline-none cursor-pointer"
        style={{
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderColor: active ? COLORS.activeBorder : COLORS.border,
          color: active ? COLORS.primary[500] : COLORS.text.body,
        }}
      >
        {active ? value : defaultLabel}
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[10px]" style={{ color: COLORS.text.disabled }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="absolute top-[38px] left-0 z-50 min-w-[180px] py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[260px] overflow-y-auto">
          <button onClick={() => { onChange('All'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === 'All' ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
            {defaultLabel}
          </button>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update status: ${response.status} ${errText}`);
      }

/* -------------------------------------------------------------------------- */
/* ADMIN DASHBOARD                                                            */
/* -------------------------------------------------------------------------- */

const TICKETS_PER_PAGE = 5;




function PillButton({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center h-[34px] px-3 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors"
      style={{
        backgroundColor: active ? COLORS.activeBg : 'transparent',
        borderColor: active ? COLORS.activeBorder : COLORS.border,
        color: active ? COLORS.primary[500] : COLORS.text.body,
      }}
    >
      {label}{count != null ? `  ${count}` : ''}
    </button>
  );
}



function FilterSelect({ value, onChange, options, defaultLabel }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-[34px] pl-3 pr-8 rounded-[7px] border text-xs font-medium whitespace-nowrap transition-colors outline-none cursor-pointer"
        style={{
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderColor: active ? COLORS.activeBorder : COLORS.border,
          color: active ? COLORS.primary[500] : COLORS.text.body,
        }}
      >
        {active ? value : defaultLabel}
      </button>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[10px]" style={{ color: COLORS.text.disabled }}>{open ? '▼' : '▼'}</span>
      </div>
      {open && (
        <div className="absolute top-[38px] left-0 z-50 min-w-[180px] py-1 rounded-[8px] border border-[#24262B] bg-[#111215] shadow-xl shadow-black/40 max-h-[260px] overflow-y-auto">
          <button onClick={() => { onChange('All'); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === 'All' ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
            {defaultLabel}
          </button>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-[#47EB3D] bg-[#142917]' : 'text-[#B8BDC7] hover:bg-[#1A1C20]'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
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


function QueueStat({ label, value, subtitle, valueColor }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border" style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>
      <span className="text-[13px] font-medium" style={{ color: COLORS.text.heading }}>{label}</span>
      <span className="text-[28px] font-bold font-heading" style={{ color: valueColor || COLORS.text.heading }}>{value}</span>
      {subtitle && <span className="text-[11px]" style={{ color: COLORS.text.disabled }}>{subtitle}</span>}
    </div>
  );
}


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

function AdminTicketRow({ ticket, isSelected, onClick }) {
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
/* -------------------------------------------------------------------------- */

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



﻿    </div>
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
            <span className="text-xs font-medium text-[#B2B8C2]">â† Back</span>
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[20px] font-semibold text-[#EBEDF2] font-heading">#{ticket.ticketId} Â· {ticket.subject || ticket.problemType || 'No Subject'}</span>
            <span className="text-[11px] text-[#737885]">{channel} Â· {ticket.contactPerson} Â· Created {formatDate(ticket.createdAt)}</span>
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
              <span className="text-[10px] font-medium text-[#B8BDC7]">â€”</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Payment</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">â€”</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Amount</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">â€”</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Machine</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.machineId || ticket.location || 'â€”'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#6B707D]">Location</span>
              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.location || 'â€”'}</span>
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
            <span className="text-[10px] text-[#6E7380]">{channel === 'WhatsApp' ? 'WhatsApp â†’ WhatsApp replies' : `${channel} â†’ Email replies`}</span>
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
                      {isInternal ? 'Internal note' : isServiceTeam ? `${msg.senderName} Â· Internal` : `${msg.senderName} Â· ${isCustomer ? channel : 'Email'}`}
                    </span>
                    <span className="text-[10px] text-[#666B78]">{timeStr}</span>
                  </div>
                  <div className="text-[12px] text-[#C4C9D1] whitespace-pre-wrap">{msg.message}</div>
                  
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {msg.attachments.map((att, j) => (
                        <span key={j} className="text-[11px] text-[#78EF63] cursor-pointer hover:underline">
                          {att.name} Â· {att.type?.startsWith('image') ? 'Image' : 'File'}
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
                <span className="text-[9px] text-[#575C66]">{channel === 'WhatsApp' ? `To: ${ticket.phone} Â· Replies stay on WhatsApp.` : `To: ${ticket.email} Â· Replies stay on email.`}</span>
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
                    placeholder={replyMode === 'email' ? `Write a reply to ${ticket.contactPerson}â€¦` : "Write an internal noteâ€¦"}
                    className="w-full bg-transparent p-3.5 text-[12px] text-[#C4C9D1] outline-none resize-none min-h-[80px]"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-[#575C66]">
                    {replyMode === 'email' 
                      ? (channel === 'WhatsApp' ? `To: ${ticket.phone} Â· Replies stay on WhatsApp.` : `To: ${ticket.email} Â· Replies stay on email.`)
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

function EmailModal({ ticket, onClose, setToast, onEmailSent }) {
  const [subject, setSubject] = useState(`Re: ${ticket.subject || ticket.ticketId}`);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {


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
/* -------------------------------------------------------------------------- */


