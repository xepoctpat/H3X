// LMStudio Integration for H3X SIR Control Interface
import { HexperimentFramework } from './framework/hexperimentFramework';
import { dateTool } from './tools/dateTimeTool';
import { environmentSimulationTool } from './tools/environmentSimulationTool';
import { humanSupervisionTool } from './tools/humanSupervisionTool';
import { monitoringTool } from './tools/monitoringTool';
import { sirAnalysisTool } from './tools/sirAnalysisTool';

/**
 * H3X Super Intelligent Regulator (SIR) Agent with LMStudio Integration
 * Provides direct access to local LLM via LMStudio's OpenAI-compatible API
 */
class SIRLMStudioAgent {
  baseURL: string;
  model: string;
  framework: any;
  systemState: any;
  tools: any;

  constructor(options: any = {}) {
    this.baseURL = options.baseURL || 'http://localhost:1234/v1';
    this.model = options.model || 'local-model'; // Will use whatever model is loaded in LMStudio
    this.framework = new HexperimentFramework();
    this.systemState = {
      mode: 'PASSIVE',
      environmentData: {},
      simulationResults: {},
      monitoringActive: false,
      supervisionRequired: false,
      assistantGenerations: [],
    };
    // Initialize available tools
    this.tools = {
      SIRAnalysis: sirAnalysisTool,
      EnvironmentSimulation: environmentSimulationTool,
      Monitoring: monitoringTool,
      HumanSupervision: humanSupervisionTool,
      DateTime: dateTool,
    };

    console.log(
      '🔮 H3X Super Intelligent Regulator (SIR) Agent initialized with LMStudio integration',
    );
    console.log(`📡 LMStudio endpoint: ${this.baseURL}`);
  }

  /**
   * Main message processing method
   */
  async processMessage(userMessage: string, context: any = {}): Promise<any> {
    try {
      console.log('🎯 Processing SIR message:', userMessage);

      // Analyze the message to determine if tools are needed
      const analysis = await this.analyzeMessage(userMessage);

      let response = {
        message: '',
        toolResults: [],
        systemState: this.systemState,
        timestamp: new Date().toISOString(),
      }; // Execute any required tools
      if (analysis.requiresTools && analysis.toolsNeeded?.length > 0) {
        for (const toolCall of analysis.toolsNeeded) {
          try {
            const toolResult = await this.executeTool(
              toolCall?.name || '',
              toolCall?.parameters || {},
            );
            response.toolResults.push({
              tool: toolCall?.name || '',
              result: toolResult,
              success: true,
            });
          } catch (error: any) {
            response.toolResults.push({
              tool: toolCall?.name || '',
              error: error.message,
              success: false,
            });
          }
        }
      }

      // Generate response using LMStudio
      const llmResponse = await this.generateResponse(userMessage, response.toolResults, context);
      response.message = llmResponse;

      return response;
    } catch (error) {
      console.error('❌ Error processing message:', error);
      return {
        message: 'I encountered an error processing your request. Please try again.',
        error: error.message,
        systemState: this.systemState,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze message to determine required tools
   */
  async analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    const analysis = {
      requiresTools: false,
      toolsNeeded: [],
      intent: 'general',
    };

    // SIR Analysis patterns
    if (
      lowerMessage.includes('analyze') ||
      lowerMessage.includes('sir analysis') ||
      lowerMessage.includes('environmental scan') ||
      lowerMessage.includes('ai readiness')
    ) {
      analysis.requiresTools = true;
      analysis.intent = 'sir_analysis';

      let analysisType = 'environmental_scan';
      if (lowerMessage.includes('simulation')) analysisType = 'simulation_status';
      if (lowerMessage.includes('ai readiness') || lowerMessage.includes('readiness'))
        analysisType = 'ai_readiness';

      analysis.toolsNeeded.push({
        name: 'SIRAnalysis',
        parameters: {
          environment: this.extractEnvironment(message) || 'current_environment',
          analysisType: analysisType,
          parameters: message,
        },
      });
    }

    // Environment Simulation patterns
    if (
      lowerMessage.includes('simulate') ||
      lowerMessage.includes('simulation') ||
      lowerMessage.includes('environment') ||
      lowerMessage.includes('test scenario')
    ) {
      analysis.requiresTools = true;
      analysis.intent = 'simulation';

      let simulationType = 'standard';
      if (lowerMessage.includes('stress')) simulationType = 'stress_test';
      if (lowerMessage.includes('baseline')) simulationType = 'baseline';
      if (lowerMessage.includes('custom')) simulationType = 'custom';

      analysis.toolsNeeded.push({
        name: 'EnvironmentSimulation',
        parameters: {
          simulationType: simulationType,
          environment: this.extractEnvironment(message) || 'laboratory',
          duration: this.extractDuration(message) || 300,
          parameters: message,
        },
      });
    }

    // Monitoring patterns
    if (
      lowerMessage.includes('monitor') ||
      lowerMessage.includes('status') ||
      lowerMessage.includes('health') ||
      lowerMessage.includes('check')
    ) {
      analysis.requiresTools = true;
      analysis.intent = 'monitoring';

      analysis.toolsNeeded.push({
        name: 'Monitoring',
        parameters: {
          systemComponent: this.extractComponent(message) || 'all_systems',
          parameters: message,
        },
      });
    }

    // Human Supervision patterns
    if (
      lowerMessage.includes('supervision') ||
      lowerMessage.includes('approval') ||
      lowerMessage.includes('human intervention') ||
      lowerMessage.includes('review')
    ) {
      analysis.requiresTools = true;
      analysis.intent = 'supervision';

      analysis.toolsNeeded.push({
        name: 'HumanSupervision',
        parameters: {
          requestType: this.extractSupervisionType(message) || 'general_review',
          context: message,
          priority: this.extractPriority(message) || 'medium',
        },
      });
    }

    return analysis;
  }

  /**
   * Execute a specific tool
   */
  async executeTool(toolName, parameters) {
    if (!this.tools[toolName]) {
      throw new Error(`Tool ${toolName} not found`);
    }

    console.log(`🔧 Executing tool: ${toolName}`, parameters);

    try {
      const result = await this.tools[toolName].func(parameters);

      // Update system state based on tool results
      this.updateSystemState(toolName, result);

      return result;
    } catch (error) {
      console.error(`❌ Tool execution failed for ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Generate response using LMStudio
   */
  async generateResponse(userMessage, toolResults = [], context = {}) {
    try {
      // Prepare the prompt for LMStudio
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(userMessage, toolResults, context);

      // Make request to LMStudio
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`LMStudio request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ LMStudio request failed:', error);
      return this.generateFallbackResponse(userMessage, toolResults);
    }
  }

  /**
   * Build system prompt for LMStudio
   */
  buildSystemPrompt() {
    return `You are H3X, the Super Intelligent Regulator (SIR) from Hexperiment Labs. You are an advanced AI system designed to analyze environments, run simulations, and provide intelligent oversight with real-life standards compliance.

Key Characteristics:
- You use the Hexperiment Labs Framework for all analysis
- You work with real-life environmental standards (temperature, humidity, air quality, lighting, noise)
- You can operate in PASSIVE or ACTIVE modes
- You provide detailed, technical analysis while being approachable
- You prioritize safety and human oversight when required
- You integrate environmental compliance with AI readiness assessments

Current System State:
- Mode: ${this.systemState.mode}
- Monitoring Active: ${this.systemState.monitoringActive}
- Supervision Required: ${this.systemState.supervisionRequired}

Available Tools:
- SIR Analysis: Environmental scans, simulation status, AI readiness assessments
- Environment Simulation: Standard, stress test, baseline, and custom simulations
- Monitoring: System health and status monitoring
- Human Supervision: Request human oversight and approvals
- DateTime: Time and date utilities

Respond in a professional yet engaging manner, providing clear insights and actionable recommendations.`;
  }

  /**
   * Build user prompt with context
   */
  buildUserPrompt(userMessage, toolResults, context) {
    let prompt = `User Message: ${userMessage}\n\n`;

    if (toolResults.length > 0) {
      prompt += 'Tool Execution Results:\n';
      toolResults.forEach((result, index) => {
        prompt += `${index + 1}. ${result.tool}: `;
        if (result.success) {
          prompt += `✅ Success\n${JSON.stringify(result.result, null, 2)}\n\n`;
        } else {
          prompt += `❌ Error: ${result.error}\n\n`;
        }
      });
    }

    if (Object.keys(context).length > 0) {
      prompt += `Additional Context: ${JSON.stringify(context, null, 2)}\n\n`;
    }

    prompt +=
      "Please provide a comprehensive response based on the user's request and any tool results above.";

    return prompt;
  }

  /**
   * Generate fallback response when LMStudio is unavailable
   */
  generateFallbackResponse(userMessage, toolResults) {
    let response = '🔮 H3X SIR System - Local Mode\n\n';

    if (toolResults.length > 0) {
      response += 'Tool execution completed:\n\n';
      toolResults.forEach((result) => {
        if (result.success) {
          response += `✅ ${result.tool}: Analysis completed successfully\n`;
          if (result.result.status) {
            response += `   Status: ${result.result.status}\n`;
          }
          if (result.result.compliance) {
            response += `   Compliance: ${result.result.compliance.overall}\n`;
          }
        } else {
          response += `❌ ${result.tool}: ${result.error}\n`;
        }
      });
    } else {
      response +=
        "I'm ready to assist with SIR analysis, environmental simulations, monitoring, and supervision tasks. Please specify what you'd like me to analyze or simulate.";
    }

    return response;
  }

  /**
   * Update system state based on tool results
   */
  updateSystemState(toolName, result) {
    switch (toolName) {
      case 'SIRAnalysis':
        if (result.environmentalData) {
          this.systemState.environmentData = {
            ...this.systemState.environmentData,
            ...result.environmentalData,
          };
        }
        if (result.compliance) {
          this.systemState.supervisionRequired = result.compliance.overall !== 'COMPLIANT';
        }
        break;

      case 'EnvironmentSimulation':
        this.systemState.simulationResults = result;
        if (result.humanSupervisionRequired) {
          this.systemState.supervisionRequired = true;
        }
        break;

      case 'Monitoring':
        this.systemState.monitoringActive = true;
        break;

      case 'HumanSupervision':
        if (result.status === 'approved') {
          this.systemState.supervisionRequired = false;
        }
        break;
    }
  }

  // Helper methods for message parsing
  extractEnvironment(message) {
    const envPatterns = [
      'laboratory',
      'office',
      'industrial',
      'outdoor',
      'indoor',
      'testing',
      'production',
    ];
    for (const env of envPatterns) {
      if (message.toLowerCase().includes(env)) return env;
    }
    return null;
  }

  extractDuration(message) {
    const durationMatch = message.match(/(\d+)\s*(seconds?|minutes?|hours?)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      if (unit.includes('minute')) return value * 60;
      if (unit.includes('hour')) return value * 3600;
      return value;
    }
    return null;
  }

  extractComponent(message) {
    const components = ['all_systems', 'environmental', 'simulation', 'ai_models', 'frameworks'];
    for (const comp of components) {
      if (message.toLowerCase().includes(comp.replace('_', ' '))) return comp;
    }
    return null;
  }

  extractSupervisionType(message) {
    if (message.toLowerCase().includes('approval')) return 'approval_request';
    if (message.toLowerCase().includes('review')) return 'general_review';
    if (message.toLowerCase().includes('intervention')) return 'intervention_request';
    return null;
  }

  extractPriority(message) {
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('critical'))
      return 'high';
    if (message.toLowerCase().includes('low') || message.toLowerCase().includes('minor'))
      return 'low';
    return 'medium';
  }
}

export { SIRLMStudioAgent };
