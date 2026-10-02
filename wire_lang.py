import re

with open('AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import
if 'import LanguageDropdown' not in code:
    code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport LanguageDropdown from './LanguageDropdown';")

# Add state
if 'const [langOpen, setLangOpen]' not in code:
    code = code.replace("const [selectedTicket, setSelectedTicket] = useState(null);", "const [selectedTicket, setSelectedTicket] = useState(null);\n  const [langOpen, setLangOpen] = useState(false);")

# Update button
btn_code = '''
          <div className="relative">
            <div onClick={() => setLangOpen(!langOpen)} className="flex h-[38px] px-3 items-center gap-2 rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#A0A8AD"/>
                <path d="M2 8H14M8 2C11.3333 5.33333 11.3333 10.6667 8 14C4.66667 10.6667 4.66667 5.33333 8 2Z" stroke="#A0A8AD"/>
              </svg>
              <span className="text-[#A0A8AD] text-[13px] font-medium">Language: English ↓</span>
            </div>
            {langOpen && (
              <div className="absolute top-[46px] right-0 z-50">
                <LanguageDropdown />
              </div>
            )}
          </div>
'''
code = re.sub(r'<div className="flex h-\[38px\].*?Language: English.*?</div>', btn_code.strip(), code, flags=re.DOTALL)

with open('AdminDashboardView.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Wired Language Dropdown")
