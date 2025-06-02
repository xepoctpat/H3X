# fLups Proof Automation Script

# This script automates the update, validation, and export of all proof documents in the proof/ folder.
# Place this file as proof/automation.js and run with: node proof/automation.js

const fs = require('fs');
const path = require('path');

const proofDir = path.join(__dirname);
const proofFiles = fs.readdirSync(proofDir).filter(f => f.startsWith('flups-') && f.endsWith('.md'));
const outputFile = path.join(proofDir, 'flups-proof-all.md');

let output = '# fLups Proofs: All Parts\n\n';

proofFiles.forEach(file => {
  output += `---\n\n## ${file}\n\n`;
  output += fs.readFileSync(path.join(proofDir, file), 'utf-8');
  output += '\n\n';
});

fs.writeFileSync(outputFile, output);
console.log('All proof parts concatenated to', outputFile);

// Optionally, add PDF/HTML export using Pandoc or similar tools
// Example (requires Pandoc installed):
// const { execSync } = require('child_process');
// execSync(`pandoc ${outputFile} -o ${outputFile.replace('.md', '.pdf')}`);
// console.log('PDF export complete.');
