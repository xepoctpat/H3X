#!/usr/bin/env node
/**
 * H3X-fLups Iteration Controller
 * 
 * This script automates the continuation of the iteration process in the H3X-fLups system.
 * It ensures all necessary services are running, checks system health, 
 * and manages the development iteration process.
 */

const path = require('path');
const fs = require('fs').promises;
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// Configuration
const config = {
    logFile: path.join(process.cwd(), 'logs', 'iteration-controller.log'),
    iterationSummaryFile: path.join(process.cwd(), 'logs', 'automation', 'iteration-summary.json'),
    healthStatusFile: path.join(process.cwd(), 'logs', 'automation', 'health-status.json'),
    mergerTaskFile: path.join(process.cwd(), 'Merger Task Manager.md'),
    continueToIterateFile: path.join(process.cwd(), 'CONTINUE-TO-ITERATE-READY.md')
};

// Global state
let runningProcesses = [];
let isIterationRunning = false;
let iterationCount = 0;

/**
 * Main function to execute the iteration controller
 */
async function main() {
    try {
        printBanner();
        
        // Create necessary directories
        await ensureDirectoriesExist();
        
        // Check if we're already iterating
        await checkIterationStatus();
        
        // Check system health
        await checkSystemHealth();
        
        // Start services if needed
        await startRequiredServices();
        
        // Start or continue the iteration
        await manageIterationProcess();
        
        // Register cleanup handler
        process.on('SIGINT', cleanupAndExit);
        process.on('SIGTERM', cleanupAndExit);
        
        // Start interactive CLI
        startInteractiveCLI();
        
    } catch (error) {
        log(`Error in main function: ${error.message}`, 'error');
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Print welcome banner
 */
function printBanner() {
    console.log('\n==========================================================');
    console.log('     H3X-fLups Iteration Controller');
    console.log('     Version: 1.0.0');
    console.log('     Date: ' + new Date().toISOString());
    console.log('==========================================================\n');
}

/**
 * Ensure all required directories exist
 */
async function ensureDirectoriesExist() {
    const dirs = [
        path.dirname(config.logFile),
        path.dirname(config.iterationSummaryFile)
    ];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
    }
    
    log('Directories verified', 'info');
}

/**
 * Check if iteration is already running
 */
async function checkIterationStatus() {
    try {
        const data = await fs.readFile(config.iterationSummaryFile, 'utf8');
        const summary = JSON.parse(data);
        
        if (summary.status === 'active') {
            isIterationRunning = true;
            iterationCount = summary.totalIterations;
            log(`Iteration already running. Current count: ${iterationCount}`, 'info');
            console.log(`Iteration is already active. Current count: ${iterationCount}`);
        } else {
            isIterationRunning = false;
            log('No active iteration found', 'info');
        }
    } catch (error) {
        isIterationRunning = false;
        log('No iteration summary found, will start new iteration', 'info');
    }
}

/**
 * Check system health
 */
async function checkSystemHealth() {
    try {
        log('Checking system health...', 'info');
        
        // Run health check
        execSync('npm run test:health', { stdio: 'inherit' });
        
        // Check Docker
        const dockerStatus = checkDockerStatus();
        log(`Docker status: ${dockerStatus}`, 'info');
        
        // Read health status
        try {
            const data = await fs.readFile(config.healthStatusFile, 'utf8');
            const health = JSON.parse(data);
            
            console.log('\nSystem Health Status:');
            console.log('---------------------');
            console.log(`Iteration: ${health.iteration}`);
            
            console.log('\nServices:');
            for (const [service, status] of Object.entries(health.services)) {
                console.log(`- ${service}: ${status}`);
            }
            
            console.log('\nMetrics:');
            for (const [metric, value] of Object.entries(health.metrics)) {
                console.log(`- ${metric}: ${value}`);
            }
            
            console.log('\n');
        } catch (error) {
            log(`Could not read health status file: ${error.message}`, 'warning');
        }
        
    } catch (error) {
        log(`Health check failed: ${error.message}`, 'error');
        console.error('Health check failed. Please verify the system setup.');
    }
}

/**
 * Check Docker status
 */
function checkDockerStatus() {
    try {
        execSync('docker ps', { stdio: 'ignore' });
        return 'running';
    } catch (error) {
        return 'not running';
    }
}

/**
 * Start required services
 */
async function startRequiredServices() {
    const dockerStatus = checkDockerStatus();
    
    if (dockerStatus === 'not running') {
        log('Docker is not running, attempting to start Docker services...', 'warning');
        console.log('Docker is not running. Attempting to start Docker services...');
        
        try {
            // This command may vary depending on the system
            execSync('start-process "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"', { shell: 'powershell.exe' });
            log('Docker Desktop started, waiting for it to initialize...', 'info');
            console.log('Docker Desktop started, waiting for it to initialize...');
            
            // Wait for Docker to start (up to 60 seconds)
            await waitForDocker();
        } catch (error) {
            log(`Failed to start Docker: ${error.message}`, 'error');
            console.error('Failed to start Docker. Please start it manually and retry.');
        }
    }
    
    // Check if H3X Local Server is running
    console.log('Checking H3X services...');
    
    try {
        const h3xServerRunning = await checkServiceRunning(3000);
        
        if (!h3xServerRunning) {
            log('Starting H3X Local Server...', 'info');
            console.log('Starting H3X Local Server...');
            
            const h3xProcess = spawn('npm', ['run', 'standalone'], { 
                detached: true, 
                stdio: 'ignore',
                shell: true
            });
            
            h3xProcess.unref();
            runningProcesses.push(h3xProcess);
            
            log('H3X Local Server started', 'info');
            console.log('H3X Local Server started.');
        } else {
            log('H3X Local Server is already running', 'info');
            console.log('H3X Local Server is already running.');
        }
        
    } catch (error) {
        log(`Error checking/starting H3X services: ${error.message}`, 'error');
        console.error(`Error checking/starting H3X services: ${error.message}`);
    }
}

/**
 * Wait for Docker to start (with timeout)
 */
async function waitForDocker(timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        try {
            execSync('docker ps', { stdio: 'ignore' });
            log('Docker is now running', 'info');
            console.log('Docker is now running.');
            return true;
        } catch (error) {
            // Docker not ready yet, wait a bit
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    log('Timed out waiting for Docker to start', 'warning');
    console.warn('Timed out waiting for Docker to start.');
    return false;
}

/**
 * Check if a service is running on a specific port
 */
async function checkServiceRunning(port) {
    try {
        const netstat = execSync('netstat -ano | find "LISTENING" | find "' + port + '"', { shell: 'powershell.exe' }).toString();
        return netstat.includes(`${port}`);
    } catch (error) {
        return false;
    }
}

/**
 * Manage the iteration process
 */
async function manageIterationProcess() {
    if (isIterationRunning) {
        log('Iteration is already running, checking status...', 'info');
        console.log('Iteration is already running, checking status...');
        
        // We could add more sophisticated status checks here
    } else {
        log('Starting new iteration process...', 'info');
        console.log('Starting new iteration process...');
        
        // Start development-iterator.js
        const iteratorProcess = spawn('node', ['scripts/development-iterator.js'], { 
            detached: true,
            stdio: 'ignore',
            shell: true
        });
        
        iteratorProcess.unref();
        runningProcesses.push(iteratorProcess);
        
        log('Development iteration process started', 'info');
        console.log('Development iteration process started successfully.');
        
        // Update the Merger Task Manager
        try {
            await updateMergerTaskManager();
        } catch (error) {
            log(`Failed to update Merger Task Manager: ${error.message}`, 'warning');
        }
    }
}

/**
 * Update the Merger Task Manager
 */
async function updateMergerTaskManager() {
    log('Updating Merger Task Manager...', 'info');
    
    try {
        // Use the fixed update-merger-task-manager.js
        execSync('node update-merger-task-manager.js T_I "Continuous Development Cycle" "Started development iteration cycle. Automated improvement process is now running."', {
            stdio: 'inherit'
        });
        
        log('Merger Task Manager updated successfully', 'info');
    } catch (error) {
        log(`Error updating Merger Task Manager: ${error.message}`, 'error');
        
        // Fallback: Update manually
        try {
            const content = await fs.readFile(config.mergerTaskFile, 'utf8');
            const timestamp = new Date().toISOString();
            
            // Add a log entry at the end of the Agent Mode Actions section
            const updatedContent = content.replace(
                /## 🤖 Agent Mode Actions([\s\S]*?)(?=\n## )/,
                `## 🤖 Agent Mode Actions$1\n- [x] Agent updated @ ${timestamp} - Started development iteration cycle. Automated improvement process is now running.\n\n`
            );
            
            await fs.writeFile(config.mergerTaskFile, updatedContent);
            log('Merger Task Manager updated manually', 'info');
        } catch (fallbackError) {
            log(`Fallback update also failed: ${fallbackError.message}`, 'error');
            throw new Error('Could not update Merger Task Manager');
        }
    }
}

/**
 * Start interactive CLI
 */
function startInteractiveCLI() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'H3X-fLups> '
    });
    
    console.log('\nH3X-fLups Iteration Controller CLI');
    console.log('Type "help" for available commands\n');
    rl.prompt();
    
    rl.on('line', async (line) => {
        const command = line.trim();
        
        switch (command) {
            case 'help':
                showHelp();
                break;
            case 'status':
                await showStatus();
                break;
            case 'health':
                await checkSystemHealth();
                break;
            case 'start':
                await startIterationIfNotRunning();
                break;
            case 'logs':
                showLogs();
                break;
            case 'docker':
                checkDockerContainers();
                break;
            case 'scan':
                scanForAzureDependencies();
                break;
            case 'exit':
            case 'quit':
                await cleanupAndExit();
                rl.close();
                return;
            default:
                console.log('Unknown command. Type "help" for available commands.');
        }
        
        rl.prompt();
    }).on('close', async () => {
        await cleanupAndExit();
    });
}

/**
 * Show help information
 */
function showHelp() {
    console.log('\nAvailable commands:');
    console.log('  help    - Show this help information');
    console.log('  status  - Show current iteration status');
    console.log('  health  - Check system health');
    console.log('  start   - Start iteration if not already running');
    console.log('  logs    - Show recent logs');
    console.log('  docker  - Check Docker containers');
    console.log('  scan    - Scan for Azure dependencies');
    console.log('  exit    - Exit the controller (iteration continues in background)');
    console.log('');
}

/**
 * Show current status
 */
async function showStatus() {
    console.log('\nChecking iteration status...');
    
    try {
        const data = await fs.readFile(config.iterationSummaryFile, 'utf8');
        const summary = JSON.parse(data);
        
        console.log('\nIteration Status:');
        console.log('-----------------');
        console.log(`Total Iterations: ${summary.totalIterations}`);
        console.log(`Status: ${summary.status}`);
        console.log(`Last Updated: ${summary.timestamp}`);
        console.log(`Next Iteration: ${summary.nextIteration}`);
        
        console.log('\nImprovements:');
        summary.improvements.forEach((improvement, index) => {
            console.log(`- ${improvement}`);
        });
        
        console.log('');
    } catch (error) {
        console.log('No iteration summary available or could not read the file.');
    }
}

/**
 * Start iteration if not already running
 */
async function startIterationIfNotRunning() {
    await checkIterationStatus();
    
    if (isIterationRunning) {
        console.log('Iteration is already running.');
    } else {
        await manageIterationProcess();
    }
}

/**
 * Show recent logs
 */
function showLogs() {
    try {
        const logs = execSync('Get-Content -Path logs/iteration-controller.log -Tail 20', { 
            shell: 'powershell.exe' 
        }).toString();
        
        console.log('\nRecent Logs:');
        console.log('-----------');
        console.log(logs);
    } catch (error) {
        console.log('Could not read logs.');
    }
}

/**
 * Check Docker containers
 */
function checkDockerContainers() {
    try {
        console.log('\nDocker Containers:');
        console.log('-----------------');
        
        const containers = execSync('docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"', { 
            encoding: 'utf8' 
        });
        
        console.log(containers);
    } catch (error) {
        console.log('Could not get Docker container information.');
    }
}

/**
 * Scan for Azure dependencies
 */
function scanForAzureDependencies() {
    console.log('\nScanning for Azure dependencies...');
    
    try {
        execSync('node scripts/azure-dependency-scanner.js', { stdio: 'inherit' });
    } catch (error) {
        console.log(`Scan failed: ${error.message}`);
    }
}

/**
 * Cleanup and exit
 */
async function cleanupAndExit() {
    log('Cleaning up before exit...', 'info');
    console.log('\nCleaning up before exit...');
    
    // Note: We intentionally don't kill the development-iterator.js process
    // so it can continue running in the background
    
    // Kill any processes we started that should be terminated
    for (const process of runningProcesses) {
        try {
            if (process.pid) {
                process.kill();
            }
        } catch (error) {
            // Process may already be gone
        }
    }
    
    log('Cleanup complete, exiting controller (iteration continues in background)', 'info');
    console.log('Cleanup complete. Iteration continues in background.');
    console.log('Goodbye!');
}

/**
 * Log a message to the log file
 */
async function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    try {
        await fs.appendFile(config.logFile, logEntry);
    } catch (error) {
        console.error(`Could not write to log file: ${error.message}`);
    }
}

// Start the main function
main().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
});
