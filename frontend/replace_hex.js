const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            // skip node_modules
            if (!dirPath.includes('node_modules')) walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const tailwindMap = {
    'bg-[#2d5a27]': 'bg-primary-dark',
    'bg-[#E4BF57]': 'bg-secondary',
    'bg-[#f9bf29]': 'bg-secondary',
    'bg-[#fff9ea]': 'bg-secondary/10',
    'border-[#E4BF57]': 'border-secondary',
    'border-[#f9bf29]': 'border-secondary',
    'text-[#111]': 'text-dark',
    'text-[#1e1e1e]': 'text-dark',
    'text-[#2d5a27]': 'text-primary-dark',
    'text-[#E4BF57]': 'text-secondary',
    'text-[#f9bf29]': 'text-secondary',
};

// CSS Var Map
const hexMap = {
    '#111': 'var(--color-dark)',
    '#111827': 'var(--color-dark)',
    '#166534': 'var(--color-success)',
    '#198754': 'var(--color-success)',
    '#1E1E1E': 'var(--color-dark)',
    '#22C55E': 'var(--color-success)',
    '#2A4538': 'var(--color-primary-dark)',
    '#2D4A40': 'var(--color-primary-dark)',
    '#2D5A27': 'var(--color-primary-dark)',
    '#2F2F2F': 'var(--color-dark)',
    '#34A853': 'var(--color-success)',
    '#3B5D50': 'var(--color-primary)',
    '#3B82F6': 'var(--color-primary)',
    '#4285F4': 'var(--color-primary)',
    '#4A7060': 'var(--color-primary-light)',
    '#5A7D6D': 'var(--color-primary-light)',
    '#64B5F6': 'var(--color-primary-light)',
    '#6A6A6A': 'var(--color-body)',
    '#6B7280': 'var(--color-body)',
    '#81C784': 'var(--color-success)',
    '#991B1B': 'var(--color-error)',
    '#999': 'var(--color-body)',
    '#9CA3AF': 'var(--color-body)',
    '#AAA': 'var(--color-body)',
    '#BA68C8': 'var(--color-secondary)',
    '#BBF7D0': 'var(--color-light)',
    '#DC3545': 'var(--color-error)',
    '#E4BF57': 'var(--color-secondary)',
    '#E57373': 'var(--color-error)',
    '#E5E7EB': 'var(--color-light)',
    '#EA4335': 'var(--color-error)',
    '#EF4444': 'var(--color-error)',
    '#F0FDF4': 'var(--color-lighter)',
    '#F3F4F6': 'var(--color-lighter)',
    '#F8B810': 'var(--color-secondary-dark)',
    '#F9BF29': 'var(--color-secondary)',
    '#F9F9F9': 'var(--color-white)',
    '#FBBC05': 'var(--color-secondary)',
    '#FECACA': 'var(--color-light)',
    '#FEE2E2': 'var(--color-light)',
    '#FEF2F2': 'var(--color-lighter)',
    '#FF7A7A': 'var(--color-error)',
    '#FF8080': 'var(--color-error)',
    '#FFD966': 'var(--color-secondary)',
    '#FFF': 'var(--color-white)',
    '#FFF9EA': 'rgba(249, 191, 41, 0.1)',
    '#FFFFFF': 'var(--color-white)',
};

walkDir('.', (filePath) => {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // 1. Replace Tailwind arbitrary hex classes
        // E.g. bg-[#111] -> bg-dark (or whatever is in tailwindMap)
        content = content.replace(/[a-z0-9\-]+-\[#[0-9a-fA-F]{3,6}\]/g, (match) => {
            // Try EXACT match first
            if (tailwindMap[match]) return tailwindMap[match];

            // Try to resolve the inner part
            const prefix = match.split('-[')[0]; // e.g., 'bg'
            const innerHex = match.match(/\[(#[0-9a-fA-F]{3,6})\]/)[1].toUpperCase();
            if (hexMap[innerHex]) {
                // If it's a tailwind variable map (like text-primary, bg-secondary)
                let twVar = hexMap[innerHex].replace('var(--color-', '').replace(')', '');
                return `${prefix}-${twVar}`; // e.g., text-dark
            }
            return match; // Fallback
        });

        // 2. Replace generic hex codes
        // We only want to replace #abc or #abcdef, but not within URLs like href="#foo"
        // Also avoid breaking partial matches.
        content = content.replace(/#[0-9a-fA-F]{3,6}\b/g, (match) => {
            const upper = match.toUpperCase();
            if (hexMap[upper]) {
                // Return string with quotes if needed? Typically these are in inline styles: `color: '#111'` -> `color: 'var(--color-dark)'`
                // But replacing the hex directly means `'#111'` becomes `'var(--color-dark)'`.
                // Actually since `var(--color-dark)` is a CSS variable, inside style JSX it works as a string: `style={{ color: 'var(--color-dark)' }}`
                // Perfect.
                return hexMap[upper];
            }
            return match;
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
console.log("Done hex replacement.");
