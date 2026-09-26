const fs = require('fs');
let content = fs.readFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

// The Machine one should have the JS fallback
content = content.replace(
  /<span className="text-\[10px\] text-\[#6B707D\]">Machine<\/span>\s*<span className="text-\[10px\] font-medium text-\[#B8BDC7\]">[^<]+<\/span>/g,
  '<span className="text-[10px] text-[#6B707D]">Machine</span>\n              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.machineId || ticket.location || \'—\'}</span>'
);

content = content.replace(
  /<span className="text-\[10px\] text-\[#6B707D\]">Location<\/span>\s*<span className="text-\[10px\] font-medium text-\[#B8BDC7\]">[^<]+<\/span>/g,
  '<span className="text-[10px] text-[#6B707D]">Location</span>\n              <span className="text-[10px] font-medium text-[#B8BDC7]">{ticket.location || \'—\'}</span>'
);

fs.writeFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', content, 'utf8');
