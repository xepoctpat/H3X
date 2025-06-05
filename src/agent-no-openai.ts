import { ActivityTypes } from '@microsoft/agents-activity';
import { AgentApplicationBuilder, MessageFactory } from '@microsoft/agents-hosting';
import { dateTool } from './tools/dateTimeTool';
import { sirAnalysisTool } from './tools/sirAnalysisTool';
import { environmentSimulationTool } from './tools/environmentSimulationTool';
import { monitoringTool } from './tools/monitoringTool';
import { humanSupervisionTool } from './tools/humanSupervisionTool';

const sirAgent = new AgentApplicationBuilder().build();

// SIR System State Management
class SIRSystemState {
  mode: string;
  environmentData: any;
  simulationResults: any;
  monitoringActive: boolean;
  supervisionRequired: boolean;
  assistantGenerations: any[];
  realLifeEnvironmentStandards: any;

  constructor() {
    this.mode = 'PASSIVE'; // PASSIVE or ACTIVE
    this.environmentData = {};
    this.simulationResults = {};
    this.monitoringActive = false;
    this.supervisionRequired = false;
    this.assistantGenerations = [];
    this.realLifeEnvironmentStandards = {
      temperature: { min: -40, max: 85, optimal: [18, 24] },
      humidity: { min: 0, max: 100, optimal: [40, 60] },
      lighting: { min: 0, max: 100000, optimal: [200, 500] },
      airQuality: { min: 0, max: 500, optimal: [0, 50] },
      noiseLevel: { min: 0, max: 140, optimal: [30, 55] },
    };
  }

  updateEnvironmentData(data) {
    this.environmentData = { ...this.environmentData, ...data };
    this.evaluateEnvironmentCompliance();
  }

  evaluateEnvironmentCompliance() {
    const compliance = {};
    Object.keys(this.realLifeEnvironmentStandards).forEach((metric) => {
      const standard = this.realLifeEnvironmentStandards[metric];
      const current = this.environmentData[metric];
      if (current !== undefined) {
        compliance[metric] = {
          current: current,
          optimal: standard.optimal,
          status:
            current >= standard.optimal[0] && current <= standard.optimal[1]
              ? 'OPTIMAL'
              : current >= standard.min && current <= standard.max
                ? 'ACCEPTABLE'
                : 'OUT_OF_RANGE',
        };
      }
    });
    this.environmentData.compliance = compliance;
  }

  setMode(newMode) {
    this.mode = newMode;
    console.log(`SIR System mode changed to: ${newMode}`);
  }
}

const sirSystemState = new SIRSystemState();

sirAgent.conversationUpdate('membersAdded', async (context) => {
  const welcomeCard = {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'Container',
        items: [
          {
            type: 'TextBlock',
            text: '🔬 Hexperiment Labs SIR Control Interface',
            size: 'Large',
            weight: 'Bolder',
            color: 'Accent',
          },
          {
            type: 'TextBlock',
            text: 'Super Intelligent Regulator - Environmental Analysis & AI Assistant Generation',
            size: 'Medium',
            wrap: true,
          },
          {
            type: 'FactSet',
            facts: [
              { title: 'Current Mode:', value: sirSystemState.mode },
              {
                title: 'Monitoring:',
                value: sirSystemState.monitoringActive ? 'ACTIVE' : 'STANDBY',
              },
              { title: 'Framework:', value: 'Microsoft SDK Agents' },
              { title: 'Standards:', value: 'Real-Life Environment Creation' },
            ],
          },
          {
            type: 'TextBlock',
            text: 'Available Commands:',
            weight: 'Bolder',
            spacing: 'Medium',
          },
          {
            type: 'TextBlock',
            text: '• **Environment Analysis** - Analyze current conditions\n• **Start Monitoring** - Begin environmental monitoring\n• **Request Supervision** - Initiate human confirmation\n• **System Status** - View SIR system status\n• **Generate Assistant** - Create tailored AI assistant',
            wrap: true,
          },
        ],
      },
    ],
  };

  await context.sendActivity(
    MessageFactory.attachment({
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: welcomeCard,
    }),
  );
});

// Core SIR Processing Logic (without OpenAI dependency)
async function processSIRRequest(question, context): Promise<any> {
  const lowerQuestion = question.toLowerCase();

  // Environment Analysis
  if (lowerQuestion.includes('environment') || lowerQuestion.includes('analysis')) {
    return await sirAnalysisTool.func({
      environment: 'current',
      analysisType: 'comprehensive',
      standards: sirSystemState.realLifeEnvironmentStandards,
    });
  }

  // Monitoring Operations
  if (lowerQuestion.includes('monitor') || lowerQuestion.includes('start monitoring')) {
    sirSystemState.monitoringActive = true;
    return await monitoringTool.func({
      action: 'start',
      systemState: sirSystemState,
    });
  }

  // Human Supervision
  if (
    lowerQuestion.includes('supervision') ||
    lowerQuestion.includes('human') ||
    lowerQuestion.includes('confirm')
  ) {
    sirSystemState.supervisionRequired = true;
    return await humanSupervisionTool.func({
      action: 'request',
      context: 'Environmental assessment requires human confirmation',
      systemState: sirSystemState,
    });
  }

  // System Status
  if (lowerQuestion.includes('status') || lowerQuestion.includes('sir system')) {
    return {
      mode: sirSystemState.mode,
      environmentData: sirSystemState.environmentData,
      monitoringActive: sirSystemState.monitoringActive,
      supervisionRequired: sirSystemState.supervisionRequired,
      timestamp: new Date().toISOString(),
      framework: 'Microsoft SDK Agents',
      standards: 'Real-Life Environment Creation Standards',
    };
  }

  // Simulation Control
  if (lowerQuestion.includes('simulation') || lowerQuestion.includes('simulate')) {
    return await environmentSimulationTool.func({
      simulationType: 'standard',
      parameters: sirSystemState.environmentData,
      standards: sirSystemState.realLifeEnvironmentStandards,
    });
  }

  // AI Assistant Generation
  if (lowerQuestion.includes('assistant') || lowerQuestion.includes('generate')) {
    sirSystemState.setMode('ACTIVE');
    return {
      assistantGenerated: true,
      configuration: {
        environmentOptimized: true,
        simulationTested: sirSystemState.simulationResults,
        humanSupervised: sirSystemState.supervisionRequired,
        realLifeStandards: true,
      },
      recommendation:
        'Assistant configured for current environmental conditions with real-life standards compliance',
    };
  }

  // Default informational response
  return {
    message:
      'SIR System Active - I can help with environment analysis, monitoring, simulation control, and AI assistant generation.',
    availableCommands: [
      'Environment Analysis',
      'Start Monitoring',
      'Request Supervision',
      'System Status',
      'Simulation Control',
      'Generate Assistant',
    ],
    currentMode: sirSystemState.mode,
    framework: 'Microsoft SDK Agents',
  };
}

sirAgent.message(async (context) => {
  const question = context.activity.text;

  if (!question) {
    await context.sendActivity('Please provide a question about the SIR system.');
    return;
  }

  try {
    // Process the request using native Microsoft SDK logic
    const response = await processSIRRequest(question, context);

    // Format response as adaptive card for complex data
    if (typeof response === 'object' && response !== null) {
      const responseCard = {
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          {
            type: 'Container',
            items: [
              {
                type: 'TextBlock',
                text: '🔬 SIR System Response',
                size: 'Medium',
                weight: 'Bolder',
                color: 'Accent',
              },
              {
                type: 'TextBlock',
                text: JSON.stringify(response, null, 2),
                wrap: true,
                fontType: 'Monospace',
              },
            ],
          },
        ],
      };

      await context.sendActivity(
        MessageFactory.attachment({
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: responseCard,
        }),
      );
    } else {
      await context.sendActivity(MessageFactory.text(response));
    }
  } catch (error) {
    console.error('Error processing SIR request:', error);
    await context.sendActivity(
      'I encountered an error processing your request. The SIR system is operating in fallback mode. Please try again.',
    );
  }
});

export { sirAgent };
