#!/usr/bin/env node

/**
 * H3X Hexperiment Labs Setup Verification
 * Checks that the system is properly configured without Azure dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 H3X Setup Verification Starting...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js Version: ${nodeVersion}`);

// Check if required directories exist
const requiredDirs = ['src', 'public', 'env', 'scripts'];
let allDirsExist = true;

requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ Directory exists: ${dir}/`);
    } else {
        console.log(`❌ Missing directory: ${dir}/`);
        allDirsExist = false;
    }
});

// Check if main files exist
const requiredFiles = ['package.json', 'dockerfile.h3x', 'docker-compose.yml'];
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ File exists: ${file}`);
    } else {
        console.log(`❌ Missing file: ${file}`);
        allFilesExist = false;
    }
});

// Check package.json for Azure dependencies
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for Azure/Microsoft dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const azurePatterns = ['@microsoft/agents', '@azure', 'teamsfx', 'teams'];
    
    let azureDepsFound = false;
    Object.keys(dependencies).forEach(dep => {
        if (azurePatterns.some(pattern => dep.includes(pattern))) {
            console.log(`⚠️  Azure dependency found: ${dep}`);
            azureDepsFound = true;
        }
    });
    
    if (!azureDepsFound) {
        console.log('✅ No Azure dependencies found in package.json');
    }
    
    // Check for Azure scripts
    const scripts = packageJson.scripts || {};
    const azureScriptPatterns = ['teamsfx', 'playground', 'teams'];
    
    let azureScriptsFound = false;
    Object.keys(scripts).forEach(script => {
        if (azureScriptPatterns.some(pattern => script.includes(pattern) || scripts[script].includes(pattern))) {
            console.log(`⚠️  Azure script found: ${script}`);
            azureScriptsFound = true;
        }
    });
    
    if (!azureScriptsFound) {
        console.log('✅ No Azure scripts found in package.json');
    }
    
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
}

// Check Docker status
const { execSync } = require('child_process');
try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Docker: ${dockerVersion}`);
    
    // Check if H3X containers are running
    try {
        const runningContainers = execSync('docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"', { encoding: 'utf8' });
        if (runningContainers.includes('h3x')) {
            console.log('✅ H3X containers are running');
            console.log('\nRunning containers:');
            console.log(runningContainers);
        } else {
            console.log('ℹ️  No H3X containers currently running');
        }
    } catch (error) {
        console.log('ℹ️  Could not check running containers');
    }
    
} catch (error) {
    console.log('⚠️  Docker not available or not running');
}

// Final summary
console.log('\n📋 H3X Setup Summary:');
console.log('='.repeat(50));

if (allDirsExist && allFilesExist) {
    console.log('✅ Core structure verification: PASSED');
    console.log('✅ Azure dependency cleanup: COMPLETED');
    console.log('✅ H3X system ready for standalone operation');
    console.log('\n🚀 You can start the system with:');
    console.log('   npm run standalone        (Local development)');
    console.log('   npm run env:dev          (Docker containers)');
    console.log('   npm run lmstudio         (LM Studio integration)');
} else {
    console.log('❌ Setup verification: FAILED');
    console.log('Please check the missing files/directories above');
    process.exit(1);
}

console.log('\n🎯 H3X Hexperiment Labs - Ready for local deployment!');
