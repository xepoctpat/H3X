#!/usr/bin/env node

/**
 * H3X Hexperiment Labs Setup Verification
 * Checks that the system is properly configured
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

// Check package.json exists and has required scripts
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for essential scripts
    const scripts = packageJson.scripts || {};
    const requiredScripts = ['dev', 'start', 'standalone'];
    
    let missingScripts = [];
    requiredScripts.forEach(script => {
        if (!scripts[script]) {
            missingScripts.push(script);
        }
    });
    
    if (missingScripts.length === 0) {
        console.log('✅ All required scripts found in package.json');
    } else {
        console.log(`⚠️  Missing required scripts: ${missingScripts.join(', ')}`);
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
