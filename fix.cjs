const fs = require('fs');
let content = fs.readFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Interface language')) {
    lines[i+3] = '                  <span className="text-xs font-medium" style={{ color: COLORS.primary[500] }}>English ?</span>';
    lines[i+7] = '                  <span className="text-xs font-medium" style={{ color: COLORS.text.body }}>Deutsch · Coming later</span>';
  }
  if (lines[i].includes('Ticket created</span>')) {
    lines[i] = '          <span className="text-[24px] font-semibold text-[#78EF63] font-heading">? Ticket created</span>';
    lines[i+1] = '          <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>';
  }
  if (lines[i].includes('Send a ticket confirmation to the customer</span>')) {
    lines[i] = '          <span className="text-[12px] text-[#EFF2F0]">? Send a ticket confirmation to the customer</span>';
  }
}

fs.writeFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', lines.join('\n'), 'utf8');
