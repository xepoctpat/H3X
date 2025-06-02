#!/usr/bin/env node
/**
 * Script to rename all files and folders to follow W3C naming conventions (kebab-case)
 * This script will:
 * 1. Convert all file names to kebab-case
 * 2. Convert all folder names to kebab-case
 * 3. Update references in package.json and other configuration files
 * 4. Handle special cases like README.md, LICENSE, etc.
 */
const fs = require('fs');
const path = require('path');

function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .replace(/([A-Z]+)/g, '-$1')
        .replace(/--+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
}

// Files that should keep their original names (case-sensitive)
const PRESERVE_FILES = new Set([
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.gitignore',
    '.dockerignore',
    '.env',
    '.env.example',
    'Web.config',
    'web.config',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'tsconfig.json',
    'jsconfig.json',
    'eslint.config.js',
    '.eslintrc.js',
    '.eslintrc.json',
    'prettier.config.js',
    '.prettierrc',
    'vite.config.js',
    'webpack.config.js',
    'rollup.config.js',
    'jest.config.js',
    'vitest.config.js'
]);

// File extensions that should preserve their case
const PRESERVE_EXTENSIONS = new Set([
    '.md',
    '.MD'
]);

// Folders that should keep their original names
const PRESERVE_FOLDERS = new Set([
    'node_modules',
    'Node_Modules',
    '.git',
    '.vscode',
    '.vs',
    'bin',
    'obj',
    'dist',
    'build',
    'coverage',
    '.nyc_output',
    'tmp',
    'temp'
]);

function shouldPreserveName(itemName, isDirectory = false) {
    // Check if it's a preserved file
    if (!isDirectory && PRESERVE_FILES.has(itemName)) {
        return true;
    }
    
    // Check if it's a preserved folder
    if (isDirectory && PRESERVE_FOLDERS.has(itemName)) {
        return true;
    }
    
    // Check if it's a file with preserved extension
    if (!isDirectory) {
        const ext = path.extname(itemName);
        if (PRESERVE_EXTENSIONS.has(ext)) {
            return true;
        }
    }
    
    // Check if it starts with dot (hidden files/folders)
    if (itemName.startsWith('.')) {
        return true;
    }
    
    return false;
}

function getNewName(oldName, isDirectory = false) {
    if (shouldPreserveName(oldName, isDirectory)) {
        return oldName;
    }
    
    if (isDirectory) {
        return kebabCase(oldName);
    }
    
    // For files, preserve the extension but convert the name
    const ext = path.extname(oldName);
    const nameWithoutExt = path.basename(oldName, ext);
    
    // Special handling for certain file patterns
    if (oldName.match(/^[A-Z][A-Z_-]*\.(md|txt)$/i)) {
        // Keep uppercase documentation files as-is
        return oldName;
    }
    
    return kebabCase(nameWithoutExt) + ext;
}

function renameItem(oldPath, newPath) {
    try {
        if (oldPath === newPath) {
            return false; // No change needed
        }
        
        // Check if target already exists
        if (fs.existsSync(newPath)) {
            console.log(`⚠️  Target already exists, skipping: ${newPath}`);
            return false;
        }
        
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error renaming ${oldPath} to ${newPath}:`, error.message);
        return false;
    }
}

function processDirectory(dirPath, level = 0) {
    const items = fs.readdirSync(dirPath);
    const renamedItems = new Map(); // oldName -> newName
    
    // First pass: rename files
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isFile()) {
            const newName = getNewName(item, false);
            if (newName !== item) {
                const newPath = path.join(dirPath, newName);
                if (renameItem(itemPath, newPath)) {
                    renamedItems.set(item, newName);
                }
            }
        }
    }
    
    // Second pass: rename directories and recurse
    const updatedItems = fs.readdirSync(dirPath);
    for (const item of updatedItems) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            // Skip problematic directories
            if (PRESERVE_FOLDERS.has(item)) {
                console.log(`⏭️  Skipping preserved folder: ${item}`);
                continue;
            }
            
            // Recurse into subdirectory first
            processDirectory(itemPath, level + 1);
            
            // Then rename the directory itself
            const newName = getNewName(item, true);
            if (newName !== item) {
                const newPath = path.join(dirPath, newName);
                if (renameItem(itemPath, newPath)) {
                    renamedItems.set(item, newName);
                }
            }
        }
    }
    
    return renamedItems;
}

function updateFileReferences(rootDir, renamedItems) {
    console.log('\n📝 Updating file references...');
    
    // Files that might contain references to renamed files
    const referenceFiles = [
        'package.json',
        'tsconfig.json',
        'jsconfig.json',
        'webpack.config.js',
        'vite.config.js',
        'rollup.config.js'
    ];
    
    function updateReferencesInFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            for (const [oldName, newName] of renamedItems) {
                const oldRef = new RegExp(`"([^"]*/)?(${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})"`, 'g');
                const newContent = content.replace(oldRef, (match, pathPrefix, fileName) => {
                    updated = true;
                    return `"${pathPrefix || ''}${newName}"`;
                });
                content = newContent;
            }
            
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated references in: ${path.basename(filePath)}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${filePath}:`, error.message);
        }
    }
    
    // Update reference files
    for (const fileName of referenceFiles) {
        const filePath = path.join(rootDir, fileName);
        if (fs.existsSync(filePath)) {
            updateReferencesInFile(filePath);
        }
    }
}

// Main execution
const rootDir = path.join(__dirname, '..');
console.log('🚀 Starting W3C naming convention fixes...');
console.log(`📁 Processing directory: ${rootDir}\n`);

try {
    const allRenamedItems = new Map();
    
    // Process the entire directory tree
    function processRecursively(dir, basePath = '') {
        const renamedItems = processDirectory(dir);
        
        // Add to global renamed items map with full paths
        for (const [oldName, newName] of renamedItems) {
            const fullOldPath = path.join(basePath, oldName);
            const fullNewPath = path.join(basePath, newName);
            allRenamedItems.set(fullOldPath, fullNewPath);
        }
    }
    
    processRecursively(rootDir);
    
    // Update file references
    if (allRenamedItems.size > 0) {
        updateFileReferences(rootDir, allRenamedItems);
    }
    
    console.log('\n🎉 W3C naming convention fixes completed!');
    console.log(`📊 Total items renamed: ${allRenamedItems.size}`);
    
} catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
}
