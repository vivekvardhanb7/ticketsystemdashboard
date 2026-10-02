import sys
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
lines[2045:2050] = [
    '        {/* Notification choice */}\n',
    '        <div className="flex flex-col gap-1 mt-2 w-full">\n',
    '          <div className="flex items-center gap-2">\n',
    '            <Check className="w-3.5 h-3.5" style={{ color: COLORS.text.muted }} />\n',
    '            <span className="text-[12px] text-[#EFF2F0]">{channel === \'WhatsApp\' ? \'Send a confirmation on WhatsApp\' : \'Send a ticket confirmation to the customer\'}</span>\n',
    '          </div>\n',
    '          <span className="text-[11px] text-[#A0A8AD]">{channel === \'WhatsApp\' ? \'Replies will be sent by WhatsApp. A phone number is required.\' : \'New tickets start as Open. * Required fields\'}</span>\n',
    '        </div>\n'
]
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
