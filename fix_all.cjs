const fs = require('fs');
let content = fs.readFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

// The replacement character was literally just that Unicode replacement char: \uFFFD
content = content.replace(/\uFFFD/g, '�');
content = content.replace(/â€¦/g, '...');
content = content.replace(/â†“/g, '?');
content = content.replace(/â€“/g, '-');
content = content.replace(/â†� /g, '?');
content = content.replace(/Â·/g, '�');
content = content.replace(/â€� /g, '�');

fs.writeFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', content, 'utf8');
