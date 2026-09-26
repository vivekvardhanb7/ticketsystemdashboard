const fs = require('fs');
let content = fs.readFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', 'utf8');

// Replace corrupted empty states in the Transaction/Payment panel
// We know they are inside spans with specific classes, or inside JS fallbacks.

// For the hardcoded empty ones:
content = content.replace(/<span className="text-\[10px\] font-medium text-\[#B8BDC7\]">([^<]+)<\/span>/g, (match, p1) => {
    if (p1.includes('A') || p1.includes('') || p1.includes('?')) {
        return '<span className="text-[10px] font-medium text-[#B8BDC7]">—</span>';
    }
    return match;
});

// For the JS template fallbacks:
content = content.replace(/{ticket\.machineId \|\| ticket\.location \|\| '([^']+)'}/g, (match, p1) => {
    if (p1.includes('A') || p1.includes('') || p1.includes('?')) {
        return "{ticket.machineId || ticket.location || '—'}";
    }
    return match;
});

content = content.replace(/{ticket\.location \|\| '([^']+)'}/g, (match, p1) => {
    if (p1.includes('A') || p1.includes('') || p1.includes('?')) {
        return "{ticket.location || '—'}";
    }
    return match;
});

fs.writeFileSync('c:/Users/vivek/Desktop/LD Projects/ticketsupportfinal/src/App.jsx', content, 'utf8');
