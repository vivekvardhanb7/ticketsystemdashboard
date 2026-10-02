import sys
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('function AdminLayout')
end_idx = content.find('function AdminDashboard', start_idx)

new_comp = """function AdminLayout({ children, onLogout }) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen" style={{ backgroundColor: '#0C0D0E', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1600px', padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <header className="flex items-center justify-between shrink-0" style={{ height: '56px' }}>
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-[10px]">
            <div className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#5CEB47"/>
                <text x="12" y="16" fontSize="14" fontWeight="bold" fill="#000" textAnchor="middle">N</text>
              </svg>
            </div>
            <span className="font-semibold text-[17px]" style={{ color: '#EDF0F2' }}>NAF Support</span>
          </div>

          {/* Right: Language + Admin */}
          <div className="flex items-center gap-[10px]">
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center h-[38px] px-[12px] gap-[8px] rounded-[7px] border hover:opacity-80 transition-opacity"
                style={{ borderColor: '#282C2F' }}
              >
                <Globe className="w-[16px] h-[16px]" style={{ color: '#A0A8AD' }} />
                <span className="text-[13px] font-medium" style={{ color: '#A0A8AD' }}>Language: English</span>
                <ChevronDown className="w-[16px] h-[16px]" style={{ color: '#A0A8AD' }} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-12 w-[284px] rounded-[10px] p-4 flex flex-col gap-3 shadow-xl z-50" style={{ backgroundColor: '#111315', border: '1px solid #282C2F' }}>
                  <div className="text-[14px] font-semibold" style={{ color: '#EDF0F2' }}>Interface language</div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] border cursor-default" style={{ backgroundColor: '#17241A', borderColor: '#345135' }}>
                    <span className="text-[12px] font-medium" style={{ color: '#5CEB47' }}>English</span>
                    <Check className="w-3.5 h-3.5 ml-auto" style={{ color: '#5CEB47' }} />
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] border cursor-not-allowed opacity-55" style={{ borderColor: '#282C2F' }}>
                    <span className="text-[12px] font-medium" style={{ color: '#A0A8AD' }}>Deutsch &middot; Coming later</span>
                  </div>
                  
                  <div className="text-[11px]" style={{ color: '#6B707D' }}>
                    German will be the default at launch.
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={onLogout}
              className="flex items-start px-[12px] py-[8px] gap-[6px] rounded-[8px] border cursor-pointer hover:bg-white/5 transition-colors" 
              style={{ borderColor: '#26292E', backgroundColor: '#131416' }}
              title="Click to logout"
            >
              <span className="text-[11px] font-medium" style={{ color: '#A8ADB8' }}>Admin</span>
            </div>
          </div>
        </header>

        <main className="flex flex-col w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

"""

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content[:start_idx] + new_comp + content[end_idx:])
