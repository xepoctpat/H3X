#!/usr/bin/env node
/**
 * Manual fixes for remaining W3C naming convention issues
 * This script handles files that couldn't be automatically renamed
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

function renameIfExists(oldPath: string, newPath: string) {
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
      return true;
    } catch (error) {
      console.error(`❌ Error renaming ${oldPath}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  } else if (fs.existsSync(newPath)) {
    console.log(`⚠️  Target already exists: ${path.basename(newPath)}`);
    return false;
  } else {
    console.log(`⚠️  Source not found: ${path.basename(oldPath)}`);
    return false;
  }
}

const rootDir = path.join(__dirname, '..');

console.log('🔧 Applying manual W3C naming fixes...\n');

// Handle specific file renames that had conflicts
const manualRenames = [
  // Root level files
  ['Package.json', 'package.json'],
  ['Package-Lock.json', 'package-lock.json'],
  ['Index.html', 'index.html'],
  ['Web.config', 'web.config'],

  // Documentation files with mixed case
  ['Readme.md', 'readme.md'],
  ['Readme-No-Openai.md', 'readme-no-openai.md'],

  // Test files
  ['Test-Client-No-Openai.js', 'test-client-no-openai.js'],
  ['Test-Generators.js', 'test-generators.js'],
  ['Test-Tools-Simple.js', 'test-tools-simple.js'],

  // Folder renames
  ['Public', 'public'],
  ['Scripts', 'scripts'],
  ['Src', 'src'],
  ['Apppackage', 'apppackage'],
  ['Archive', 'archive'],
  ['Devtools', 'devtools'],
  ['Infra', 'infra'],
  ['Env', 'env'],

  // Dockerfile special case
  ['Dockerfile.h3x', 'dockerfile.h3x'],
];

for (const [oldName, newName] of manualRenames) {
  const oldPath = path.join(rootDir, oldName);
  const newPath = path.join(rootDir, newName);
  renameIfExists(oldPath, newPath);
}

// Handle subfolder renames
const subfolderRenames = [
  // Public folder contents
  ['public/Js', 'public/js'],
  ['public/Css', 'public/css'],

  // Src folder contents
  ['src/Tools', 'src/tools'],
  ['src/Protocol', 'src/protocol'],
  ['src/Generators', 'src/generators'],
  ['src/Framework', 'src/framework'],

  // Infrastructure folder
  ['infra/Botregistration', 'infra/botregistration'],

  // DevTools
  ['devtools/Playground', 'devtools/playground'],
];

for (const [oldPath, newPath] of subfolderRenames) {
  const fullOldPath = path.join(rootDir, oldPath);
  const fullNewPath = path.join(rootDir, newPath);
  renameIfExists(fullOldPath, fullNewPath);
}

// Handle individual files in renamed folders
const fileRenames = [
  // Public/Js files
  ['public/js/Sir-Dashboard.js', 'public/js/sir-dashboard.js'],
  ['public/Js/Sir-Dashboard.js', 'public/js/sir-dashboard.js'], // In case folder wasn't renamed yet

  // Src files
  ['src/Hello.Test.js', 'src/hello.test.js'],
  ['src/Agent-No-Openai.js', 'src/agent-no-openai.js'],
  ['src/Agent-Lmstudio.js', 'src/agent-lmstudio.js'],

  // Infrastructure files
  ['infra/Azure.Parameters.json', 'infra/azure.parameters.json'],
  ['infra/Azure.bicep', 'infra/azure.bicep'],

  // Archive files that may have been missed
  ['archive/obsolete-backup-2025-05-28T19-24-42', 'archive/obsolete-backup-2025-05-28t19-24-42'],
];

for (const [oldPath, newPath] of fileRenames) {
  const fullOldPath = path.join(rootDir, oldPath);
  const fullNewPath = path.join(rootDir, newPath);
  renameIfExists(fullOldPath, fullNewPath);
}

console.log('\n🎉 Manual W3C naming fixes completed!');

// Create a summary of the current state
console.log('\n📊 Checking current state...');
function checkDirectory(dir: string, level = 0): void {
  const items = fs.readdirSync(dir);
  const indent = '  '.repeat(level);

  for (const item of items) {
    if (item.startsWith('.')) continue; // Skip hidden files

    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Check if folder name follows kebab-case
      const expected = kebabCase(item);
      if (expected !== item && !['node_modules', 'Node_Modules'].includes(item)) {
        console.log(`${indent}📁 ${item} (should be: ${expected})`);
      }

      // Don't recurse into large folders
      if (!['node_modules', 'Node_Modules', '.git'].includes(item) && level < 2) {
        checkDirectory(itemPath, level + 1);
      }
    } else {
      // Check if file name follows conventions
      const ext = path.extname(item);
      const nameWithoutExt = path.basename(item, ext);
      const expected = kebabCase(nameWithoutExt) + ext;

      // Skip files that should preserve their names
      const preserveFiles = [
        'README.md',
        'LICENSE',
        'package.json',
        'package-lock.json',
        'Web.config',
        'web.config',
      ];
      if (!preserveFiles.includes(item) && expected !== item && !item.startsWith('.')) {
        console.log(`${indent}📄 ${item} (should be: ${expected})`);
      }
    }
  }
}

try {
  checkDirectory(rootDir);
} catch (error) {
  console.error('Error checking directory:', error instanceof Error ? error.message : String(error));
}

console.log('\n✨ W3C naming convention analysis complete!');
