// proof/convert-unicode-to-ascii.js
// Automates conversion of problematic Unicode symbols to ASCII for LaTeX/PDF compatibility
// Usage: node proof/convert-unicode-to-ascii.js <input> <output>

const fs = require('fs');
const path = require('path');

const replacements = [
  [/●/g, '*'],
  [/○/g, 'o'],
  [/╭/g, '+'],
  [/╮/g, '+'],
  [/╯/g, '+'],
  [/╰/g, '+'],
  [/━/g, '-'],
  [/┃/g, '|'],
  [/╲/g, '/'],
  [/╱/g, '\\'],
  [/│/g, '|'],
  [/─/g, '-'],
  [/═/g, '='],
  [/╳/g, 'x'],
  [/▲/g, '^'],
  [/▼/g, 'v'],
  [/■/g, '#'],
  [/□/g, '[ ]'],
  [/╔/g, '+'],
  [/╗/g, '+'],
  [/╝/g, '+'],
  [/╚/g, '+'],
  [/┌/g, '+'],
  [/┐/g, '+'],
  [/┘/g, '+'],
  [/└/g, '+'],
  [/┼/g, '+'],
  [/┬/g, '+'],
  [/┴/g, '+'],
  [/┤/g, '+'],
  [/├/g, '+'],
  [/─/g, '-'],
  [/│/g, '|']
];

if (process.argv.length < 4) {
  console.error('Usage: node convert-unicode-to-ascii.js <input> <output>');
  process.exit(1);
}

const input = process.argv[2];
const output = process.argv[3];

let data = fs.readFileSync(input, 'utf-8');
replacements.forEach(([pattern, replacement]) => {
  data = data.replace(pattern, replacement);
});
fs.writeFileSync(output, data);
console.log(`Converted ${input} to ASCII-safe ${output}`);
