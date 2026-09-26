const fs = require('fs');
let content = fs.readFileSync('C:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

const regex = /<div className="flex items-center h-\[34px\].*?Deutsch.*?<\/div>\s*<span.*?German will be the default.*?<\/span>/gs;
content = content.replace(regex, '');

fs.writeFileSync('C:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', content, 'utf8');
console.log('Removed Deutsch from UI!');
