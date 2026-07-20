const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/Home.jsx', 'utf8');

const lines = code.split('\n');
for (let i = 350; i < 550; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
