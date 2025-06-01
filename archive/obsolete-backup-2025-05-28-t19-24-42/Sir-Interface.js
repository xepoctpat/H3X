#!/usr/bin/env node

/**
 * SIR Interactive Command Line Interface
 * Provides an interactive terminal interface for the H3X SIR Control System
 */

const readline = require('readline');
const chalk = require('chalk');
const { SIRLMStudioAgent } = require('./src/agent-lmstudio');

class SIRInterface {
    constructor() {
        this.agent = new SIRLMStudioAgent();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.cyan('SIR> ')
        });
        
        this.isRunning = false;
        this.autoMode = false;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.rl.on('line', async (input) => {
            await this.handleCommand(input.trim());
            if (this.isRunning && !this.autoMode) {
                this.rl.prompt();
            }
        });

        this.rl.on('close', () => {
            this.shutdown();
        });

        process.on('SIGINT', () => {
            this.shutdown();
        });
    }

    async start() {
        this.isRunning = true;
        this.showBanner();
        this.showHelp();
        this.rl.prompt();
    }

    showBanner() {
        console.log(chalk.blue.bold(`
╔══════════════════════════════════════════════════════════════╗
║                    H3X SIR CONTROL INTERFACE                ║
║                  Super Intelligent Regulator                ║
║                     Interactive Terminal                     ║
╚══════════════════════════════════════════════════════════════╝
        `));
    }

    showHelp() {
        console.log(chalk.yellow(`
Available Commands:
  ${chalk.green('help')}          - Show this help message
  ${chalk.green('status')}        - Check system status
  ${chalk.green('analyze')}       - Run SIR analysis
  ${chalk.green('simulate')}      - Run environment simulation
  ${chalk.green('monitor')}       - Start system monitoring
  ${chalk.green('chat <msg>')}    - Chat with SIR agent
  ${chalk.green('autorun')}       - Start automatic task execution
  ${chalk.green('demo')}          - Run demonstration sequence
  ${chalk.green('clear')}         - Clear screen
  ${chalk.green('exit')}          - Exit interface

Examples:
  SIR> analyze performance metrics
  SIR> simulate high-traffic scenario
  SIR> chat How is the system performing?
        `));
    }

    async handleCommand(input) {
        if (!input) return;

        const [command, ...args] = input.split(' ');
        const message = args.join(' ');

        try {
            switch (command.toLowerCase()) {
                case 'help':
                case 'h':
                    this.showHelp();
                    break;

                case 'status':
                    await this.showStatus();
                    break;

                case 'analyze':
                    await this.runAnalysis(message);
                    break;

                case 'simulate':
                    await this.runSimulation(message);
                    break;

                case 'monitor':
                    await this.startMonitoring();
                    break;

                case 'chat':
                    if (!message) {
                        console.log(chalk.red('Please provide a message. Usage: chat <your message>'));
                        break;
                    }
                    await this.chatWithAgent(message);
                    break;

                case 'autorun':
                    await this.startAutorun();
                    break;

                case 'demo':
                    await this.runDemo();
                    break;

                case 'clear':
                    console.clear();
                    this.showBanner();
                    break;

                case 'exit':
                case 'quit':
                case 'q':
                    this.shutdown();
                    return;

                default:
                    if (input.startsWith('/')) {
                        // Treat as direct command
                        await this.chatWithAgent(input);
                    } else {
                        console.log(chalk.red(`Unknown command: ${command}`));
                        console.log(chalk.yellow('Type "help" for available commands.'));
                    }
            }
        } catch (error) {
            console.log(chalk.red(`Error: ${error.message}`));
        }
    }

    async showStatus() {
        console.log(chalk.blue('\n🔍 System Status Check...\n'));
        
        try {
            const response = await this.agent.processMessage('Check system status');
            console.log(chalk.green('✅ System Status:'));
            console.log(response);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Running in standalone mode (LMStudio not connected)'));
            console.log(chalk.cyan('Demo Status: All systems operational in simulation mode'));
        }
    }

    async runAnalysis(query) {
        const analysisQuery = query || 'system performance analysis';
        console.log(chalk.blue(`\n📊 Running SIR Analysis: ${analysisQuery}\n`));
        
        try {
            const response = await this.agent.processMessage(`Analyze: ${analysisQuery}`);
            console.log(chalk.green('📈 Analysis Results:'));
            console.log(response);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Demo Mode Analysis:'));
            console.log(chalk.cyan(`Simulated analysis for: ${analysisQuery}`));
            console.log(chalk.cyan('- Performance metrics: OPTIMAL'));
            console.log(chalk.cyan('- System health: 97.3%'));
            console.log(chalk.cyan('- Anomalies detected: 0'));
        }
    }

    async runSimulation(scenario) {
        const simScenario = scenario || 'standard environment simulation';
        console.log(chalk.blue(`\n🔬 Running Simulation: ${simScenario}\n`));
        
        try {
            const response = await this.agent.processMessage(`Simulate: ${simScenario}`);
            console.log(chalk.green('🎯 Simulation Results:'));
            console.log(response);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Demo Mode Simulation:'));
            console.log(chalk.cyan(`Simulated scenario: ${simScenario}`));
            console.log(chalk.cyan('- Simulation cycles: 2,847'));
            console.log(chalk.cyan('- Data points: 1.2M'));
            console.log(chalk.cyan('- Success rate: 98.7%'));
        }
    }

    async startMonitoring() {
        console.log(chalk.blue('\n📡 Starting System Monitoring...\n'));
        
        try {
            const response = await this.agent.processMessage('Start monitoring');
            console.log(chalk.green('📊 Monitoring Active:'));
            console.log(response);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Demo Mode Monitoring:'));
            console.log(chalk.cyan('Monitoring dashboard active:'));
            console.log(chalk.cyan('- CPU usage: 23%'));
            console.log(chalk.cyan('- Memory: 67%'));
            console.log(chalk.cyan('- Network: 2.4 GB/s'));
            console.log(chalk.cyan('- Active processes: 247'));
        }
    }

    async chatWithAgent(message) {
        console.log(chalk.blue(`\n💬 Chatting with SIR Agent...\n`));
        
        try {
            const response = await this.agent.processMessage(message);
            console.log(chalk.green('🤖 SIR Agent:'));
            console.log(response);
        } catch (error) {
            console.log(chalk.yellow('⚠️  Demo Mode Response:'));
            console.log(chalk.cyan(`SIR Agent (Demo): I understand you said "${message}". `));
            console.log(chalk.cyan('All systems are operating within normal parameters. How can I assist you further?'));
        }
    }

    async startAutorun() {
        console.log(chalk.blue('\n🚀 Starting Autorun Mode...\n'));
        this.autoMode = true;
        
        const tasks = [
            'System status check',
            'Performance analysis',
            'Environment simulation',
            'Security monitoring',
            'Data collection review'
        ];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            console.log(chalk.cyan(`\n[${i + 1}/${tasks.length}] Executing: ${task}`));
            
            try {
                const response = await this.agent.processMessage(task);
                console.log(chalk.green(`✅ ${task} completed`));
                console.log(response.substring(0, 200) + '...');
            } catch (error) {
                console.log(chalk.yellow(`⚠️  Demo execution: ${task}`));
                console.log(chalk.cyan(`Simulated completion of ${task}`));
            }
            
            // Wait between tasks
            await this.sleep(2000);
        }
        
        console.log(chalk.green('\n✅ Autorun sequence completed!'));
        this.autoMode = false;
        console.log(chalk.yellow('Returning to interactive mode...'));
        this.rl.prompt();
    }

    async runDemo() {
        console.log(chalk.blue('\n🎭 Running SIR Demonstration Sequence...\n'));
        
        const demoSteps = [
            { action: 'status', desc: 'System initialization' },
            { action: 'analyze performance metrics', desc: 'Performance analysis' },
            { action: 'simulate high-load scenario', desc: 'Load testing' },
            { action: 'monitor', desc: 'System monitoring' }
        ];

        for (const step of demoSteps) {
            console.log(chalk.magenta(`\n🔄 Demo Step: ${step.desc}`));
            await this.handleCommand(step.action);
            await this.sleep(1500);
        }
        
        console.log(chalk.green('\n🎉 Demonstration completed!'));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    shutdown() {
        console.log(chalk.yellow('\n👋 Shutting down SIR Interface...'));
        console.log(chalk.green('Thank you for using H3X SIR Control System!'));
        this.isRunning = false;
        this.rl.close();
        process.exit(0);
    }
}

// Auto-start if called directly
if (require.main === module) {
    const interface = new SIRInterface();
    interface.start().catch(console.error);
}

module.exports = SIRInterface;
