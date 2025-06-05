#!/usr/bin/env node
/**
 * Script to convert all id and class attribute values in HTML files under /Public to kebab-case
 */
import * as fs from 'fs';
import * as path from 'path';

function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/([A-Z]+)/g, '-$1')
    .replace(/--+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

function processHtmlFile(filePath: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace id="..."
  content = content.replace(/id\s*=\s*"([^"]+)"/gi, (match, value) => {
    return `id="${kebabCase(value)}"`;
  });
  // Replace id='...'
  content = content.replace(/id\s*=\s*'([^']+)'/gi, (match, value) => {
    return `id='${kebabCase(value)}'`;
  });
  // Replace class="..."
  content = content.replace(/class\s*=\s*"([^"]+)"/gi, (match, value) => {
    const classes = value.split(/\s+/).map(kebabCase).join(' ');
    return `class="${classes}"`;
  });
  // Replace class='...'
  content = content.replace(/class\s*=\s*'([^']+)'/gi, (match, value) => {
    const classes = value.split(/\s+/).map(kebabCase).join(' ');
    return `class='${classes}'`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${filePath}`);
}

function walkDir(dir: string, callback: (filePath: string) => void): void {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.html')) {
      callback(dirPath);
    }
  });
}

const publicDir = path.join(__dirname, '../Public');
if (!fs.existsSync(publicDir)) {
  console.error('❌ Public directory not found.');
  process.exit(1);
}
walkDir(publicDir, processHtmlFile);
console.log('🎉 All id/class attributes converted to kebab-case!');
