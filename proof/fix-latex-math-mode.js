// proof/fix-latex-math-mode.js
// Ensures all LaTeX math commands (e.g., \mathbb) are wrapped in $...$ for math mode
// Usage: node proof/fix-latex-math-mode.js <input> <output>

const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node fix-latex-math-mode.js <input> <output>');
  process.exit(1);
}

const input = process.argv[2];
const output = process.argv[3];

let data = fs.readFileSync(input, 'utf-8');

// Regex: find \mathbb{...} not already inside $...$
// This is a simple heuristic and may need refinement for complex cases
const mathbbPattern = /([^$])\\mathbb\{([^}]+)\}/g;
data = data.replace(mathbbPattern, '$1$\\mathbb{$2}$');

// Also wrap \mathcal, \mathfrak, \mathsf, \mathbf, \mathrm, \mathit, \mathscr
const mathCmds = ['mathcal', 'mathfrak', 'mathsf', 'mathbf', 'mathrm', 'mathit', 'mathscr'];
mathCmds.forEach(cmd => {
  const pattern = new RegExp(`([^$])\\${cmd}\\{([^}]+)\\}`, 'g');
  data = data.replace(pattern, `$1$\\${cmd}{$2}$`);
});

fs.writeFileSync(output, data);
console.log(`Fixed LaTeX math mode in ${input} -> ${output}`);
