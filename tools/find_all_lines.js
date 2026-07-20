const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/Home.jsx', 'utf8');

const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('border') || line.includes('hr') || line.includes('divider') || line.includes('line-') || line.includes('border-')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
