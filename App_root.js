export default function App() {
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
        const accountType = item.accountType || 'Not collected';

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

