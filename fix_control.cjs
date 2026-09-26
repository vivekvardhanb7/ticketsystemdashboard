const fs = require('fs');
let content = fs.readFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

// The whitelist of allowed non-ASCII characters
const whitelist = ['?', '?', '·', '×', '+', '?', '?', '—', '…'];

// Convert whitelist to an array of char codes to keep
const keepCodes = whitelist.map(c => c.charCodeAt(0));

// Build a new string dropping any non-ASCII character NOT in the whitelist
let newContent = '';
for (let i = 0; i < content.length; i++) {
  const code = content.charCodeAt(i);
  if (code <= 127 || keepCodes.includes(code)) {
    newContent += content[i];
  } else {
    console.log('Dropping bad character code:', code.toString(16), 'at index', i);
  }
}

fs.writeFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', newContent, 'utf8');
