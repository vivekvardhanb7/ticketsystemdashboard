import re

with open('reconstructed_App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix error 1: Duplicate timer
code = code.replace('''
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
''', '''
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
''')

# Fix error 2: Missing CSS header
missing_css_header = '''
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

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Power Grotesk';
        src: url('/fonts/PowerGrotesk-Regular.woff2') format('woff2');
        font-weight: normal;
'''
code = code.replace(
    'export default function App() {\n        font-style: normal;',
    'export default function App() {\n' + missing_css_header + '        font-style: normal;'
)

# Strip all // MISSING LINE comments
code = re.sub(r'// MISSING LINE \d+\n?', '', code)

# Fix duplicated PillButton
code = re.sub(r'function PillButton.*?\n\s*\}\n\s*function PillButton', 'function PillButton', code, flags=re.DOTALL)

with open('App_fixed.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Created App_fixed.jsx")
