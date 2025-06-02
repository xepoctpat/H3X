// proof/automation-full.js
// Full automation: concatenate, convert Unicode, fix math mode, export PDF
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const proofDir = __dirname;
const proofFiles = fs.readdirSync(proofDir).filter(f => f.startsWith('flups-') && f.endsWith('.md'));
const concatFile = path.join(proofDir, 'flups-proof-all.md');
const asciiFile = path.join(proofDir, 'flups-proof-all-ascii.md');
const mathFile = path.join(proofDir, 'flups-proof-all-ascii-math.md');
const pdfFile = path.join(proofDir, 'flups-proof-all.pdf');

// 1. Concatenate
let output = '# fLups Proofs: All Parts\n\n';
proofFiles.forEach(file => {
  output += `---\n\n## ${file}\n\n`;
  output += fs.readFileSync(path.join(proofDir, file), 'utf-8');
  output += '\n\n';
});
fs.writeFileSync(concatFile, output);
console.log('Concatenated all proof parts.');

// 2. Unicode to ASCII
execSync(`node ./convert-unicode-to-ascii.js ${concatFile} ${asciiFile}`, { cwd: proofDir });
console.log('Converted Unicode to ASCII.');

// 3. Fix LaTeX math mode
execSync(`node ./fix-latex-math-mode.js ${asciiFile} ${mathFile}`, { cwd: proofDir });
console.log('Fixed LaTeX math mode.');

// 4. Export to PDF
try {
  execSync(`pandoc ${mathFile} -o ${pdfFile} --pdf-engine=xelatex`, { stdio: 'inherit' });
  console.log('Exported to PDF.');
} catch (e) {
  console.error('PDF export failed. Check for LaTeX errors.');
}
