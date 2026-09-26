const fs = require('fs');
let content = fs.readFileSync('C:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

// Find the German button
const germanStart = content.indexOf('<button className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors group flex items-center gap-3"');
if (germanStart !== -1) {
   const textCheck = content.indexOf('German will be default', germanStart);
   if (textCheck !== -1 && textCheck < germanStart + 1000) {
      const germanEnd = content.indexOf('</button>', germanStart) + 9;
      content = content.substring(0, germanStart) + content.substring(germanEnd);
      console.log('Removed German option!');
   }
}

// Fix header
if (content.includes('header className="h-[72px] shrink-0 border-b border-white/5 px-6 flex items-center justify-between relative overflow-hidden"')) {
   content = content.replace(
      'header className="h-[72px] shrink-0 border-b border-white/5 px-6 flex items-center justify-between relative overflow-hidden"',
      'header className="h-[72px] shrink-0 border-b border-white/5 px-6 flex items-center justify-between relative"'
   );
   console.log('Removed overflow-hidden from header!');
}

fs.writeFileSync('C:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', content, 'utf8');
