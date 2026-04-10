const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const hexes = new Set();
const tailwindHexes = new Set();

walkDir('.', (filePath) => {
    if (filePath.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Match Tailwind arbitrary hex classes like text-[#FFF] or bg-[#000]
        const tailwindMatches = content.match(/[a-z0-9\-]+-\[#[0-9a-fA-F]{3,6}\]/g);
        if (tailwindMatches) {
            tailwindMatches.forEach(m => tailwindHexes.add(m));
        }

        // Match generic hex codes
        const matches = content.match(/#[0-9a-fA-F]{3,6}/g);
        if (matches) {
            matches.forEach(m => hexes.add(m.toUpperCase()));
        }
    }
});

let out = "=== TAILWIND HEX CLASSES ===\n" + Array.from(tailwindHexes).sort().join('\n');
out += "\n\n=== ALL HEX CODES ===\n" + Array.from(hexes).sort().join('\n');
fs.writeFileSync('hex_out_utf8.txt', out, 'utf8');
