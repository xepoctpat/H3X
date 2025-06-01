#!/usr/bin/env node
/**
 * Azure Dependency Scanner
 * Scans the entire codebase for Azure and Microsoft 365 references
 * Helps identify any remaining dependencies that need to be removed
 */

const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

// Patterns to search for
const patterns = [
  'Azure',
  'Microsoft 365',
  'AZURE_',
  'MS_',
  'Teams',
  '@microsoft',
  '@azure',
  'teamsfx'
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  'archive',
  'obsolete-backup'
];

// File extensions to include
const includeExtensions = [
  '.js', '.ts', '.jsx', '.tsx', '.html', '.css',
  '.json', '.yml', '.yaml', '.md', '.ps1', '.sh'
];

// Results tracking
const results = {
  totalFiles: 0,
  totalMatches: 0,
  fileMatches: []
};

/**
 * Scan a file for Azure/Microsoft patterns
 */
async function scanFile(filePath) {
  try {
    // Skip excluded directories
    if (excludeDirs.some(dir => filePath.includes(dir))) {
      return;
    }
    
    // Only include specific file extensions
    const ext = path.extname(filePath).toLowerCase();
    if (!includeExtensions.includes(ext)) {
      return;
    }

    results.totalFiles++;
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check for patterns
    const fileMatches = [];
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        const line = content.substring(0, match.index).split('\n').length;
        const matchedLine = content.split('\n')[line - 1].trim();
        
        fileMatches.push({
          pattern,
          line,
          matchedLine
        });
        
        results.totalMatches++;
      }
    }
    
    if (fileMatches.length > 0) {
      results.fileMatches.push({
        filePath,
        matches: fileMatches
      });
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively scan a directory
 */
async function scanDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.some(dir => entry.name === dir || entry.name.includes(dir))) {
          await scanDirectory(fullPath);
        }
      } else {
        await scanFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Generate a report of findings
 */
function generateReport() {
  const report = [
    '# Azure & Microsoft 365 Dependency Scan Report',
    '',
    `**Date**: ${new Date().toISOString()}`,
    `**Total Files Scanned**: ${results.totalFiles}`,
    `**Total Matches Found**: ${results.totalMatches}`,
    '',
    '## Files with Dependencies',
    ''
  ];
  
  if (results.fileMatches.length === 0) {
    report.push('✅ **No dependencies found!** The project is Azure-free.');
  } else {
    for (const fileMatch of results.fileMatches) {
      report.push(`### ${fileMatch.filePath}`);
      report.push('');
      report.push('| Line | Pattern | Content |');
      report.push('|------|---------|---------|');
      
      for (const match of fileMatch.matches) {
        report.push(`| ${match.line} | ${match.pattern} | \`${match.matchedLine.replace(/\|/g, '\\|')}\` |`);
      }
      
      report.push('');
    }
    
    report.push('## Recommended Actions');
    report.push('');
    report.push('1. Review each file listed above and determine if the Azure/Microsoft 365 references need to be removed');
    report.push('2. For documentation files, consider if historical references should be kept for context');
    report.push('3. For code files, remove all dependencies and replace with alternative implementations');
    report.push('4. Re-run this scan after making changes to verify all dependencies have been removed');
  }
  
  return report.join('\n');
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();
  console.log('🔍 Starting Azure & Microsoft 365 dependency scan...');
  
  // Get the project root directory
  const rootDir = process.cwd();
  console.log(`Scanning directory: ${rootDir}`);
  
  await scanDirectory(rootDir);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Scan complete!`);
  console.log(`Scanned ${results.totalFiles} files in ${duration} seconds`);
  console.log(`Found ${results.totalMatches} potential Azure/Microsoft 365 references`);
  
  // Generate and save report
  const report = generateReport();
  const reportPath = path.join(rootDir, 'azure-dependency-scan-report.md');
  await fs.writeFile(reportPath, report);
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
