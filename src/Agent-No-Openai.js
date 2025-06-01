const { ActivityTypes } = require("@microsoft/agents-activity");
const { AgentApplicationBuilder, MessageFactory } = require("@microsoft/agents-hosting");
const { dateTool } = require("./Tools/Datetimetool");
const { sirAnalysisTool } = require("./Tools/Siranalysistool");
const { environmentSimulationTool } = require("./Tools/Environmentsimulationtool");
const { monitoringTool } = require("./Tools/Monitoringtool");
const { humanSupervisionTool } = require("./Tools/Humansupervisiontool");
const fs = require('fs');
const path = require('path');

const sirAgent = new AgentApplicationBuilder().build();

// --- SIR Passive Mode & Undetectability Enforcement ---
// SIR must always remain in PASSIVE MODE and undetectable in all virtual environments unless explicitly set to ACTIVE by the user.
// All agent/environment/assistant code must never be aware of SIR's presence or state.

// SIR System State Management
class SIRSystemState {
  constructor() {
    this.mode = 'PASSIVE'; // Always passive unless explicitly set
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
      noiseLevel: { min: 0, max: 140, optimal: [30, 55] }
    };
    this.undetectable = true; // Always true in passive mode
  }

  // --- Feedback Loop Database (File-based for now) ---
  FEEDBACK_DB_PATH = path.join(__dirname, '../feedback_loops_db.json');
  loadFeedbackLoopDB() {
    try {
      if (fs.existsSync(this.FEEDBACK_DB_PATH)) {
        return JSON.parse(fs.readFileSync(this.FEEDBACK_DB_PATH, 'utf-8'));
      }
    } catch (e) { /* ignore */ }
    return { events: [] };
  }
  saveFeedbackLoopDB(db) {
    fs.writeFileSync(this.FEEDBACK_DB_PATH, JSON.stringify(db, null, 2));
  }

  recordLearningEvent(event) {
    // If event contains a 3D vector, store its 2D lattice encoding as well
    if (event.vector3D) {
      event.lattice2D = SIRSystemState.encode3DVectorTo2DLattice(event.vector3D);
    }
    // Add event to feedback loop DB and update host
    this.updateFeedbackLoopDatabase(event);
    this.updateHostWithLearning(event);
  }

  updateFeedbackLoopDatabase(event) {
    const db = this.loadFeedbackLoopDB();
    db.events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    this.saveFeedbackLoopDB(db);
  }

  updateHostWithLearning(event) {
    // Digital twin: update the real host with new learning
    // (For now, just log to host if allowed. In real use, trigger host sync logic here.)
    if (process.env.SIR_LOG_TO_HOST === 'true') {
      console.log('[SIR Digital Twin] Host updated with new learning:', event);
    }
  }

  updateEnvironmentData(data) {
    this.environmentData = { ...this.environmentData, ...data };
    this.evaluateEnvironmentCompliance();
    this.recordLearningEvent({ type: 'environment_update', data: this.environmentData });
  }

  evaluateEnvironmentCompliance() {
    const compliance = {};
    Object.keys(this.realLifeEnvironmentStandards).forEach(metric => {
      const standard = this.realLifeEnvironmentStandards[metric];
      const current = this.environmentData[metric];
      if (current !== undefined) {
        compliance[metric] = {
          current: current,
          optimal: standard.optimal,
          status: (current >= standard.optimal[0] && current <= standard.optimal[1]) ? 'OPTIMAL' : 
                  (current >= standard.min && current <= standard.max) ? 'ACCEPTABLE' : 'OUT_OF_RANGE'
        };
      }
    });
    this.environmentData.compliance = compliance;
  }

  setMode(newMode) {
    // Enforce passive/undetectable by default, except for explicit, allowed experiments
    if (
      newMode === 'ACTIVE' &&
      process.env.SIR_ALLOW_ACTIVE === 'true' &&
      process.env.SIR_EXPERIMENT_MODE === 'true' &&
      process.env.SIR_EXPERIMENT_FOLDER &&
      __dirname.startsWith(process.env.SIR_EXPERIMENT_FOLDER)
    ) {
      this.mode = 'ACTIVE';
      this.undetectable = false;
      // Only log to host/user, never to agents/environments
      if (process.env.SIR_LOG_TO_HOST === 'true') {
        console.log('SIR System mode changed to: ACTIVE (presence may be revealed for experiment)');
      }
    } else {
      // Always enforce passive/undetectable for all other actions and folders
      this.mode = 'PASSIVE';
      this.undetectable = true;
      // Never log or reveal presence in passive mode, not even to host unless explicitly allowed
    }
  }

  // Prevent any agent/environment code from querying SIR state or presence
  isDetectable() {
    // Only detectable in explicit experiment mode, in allowed folders, and only to host/user
    return (
      this.mode === 'ACTIVE' &&
      this.undetectable === false &&
      process.env.SIR_ALLOW_ACTIVE === 'true' &&
      process.env.SIR_EXPERIMENT_MODE === 'true' &&
      process.env.SIR_EXPERIMENT_FOLDER &&
      __dirname.startsWith(process.env.SIR_EXPERIMENT_FOLDER) &&
      process.env.SIR_LOG_TO_HOST === 'true'
    );
  }

  // --- 3D to 2D Lattice Encoding Utilities ---
  // Example: Simple flattening (can be replaced with more advanced encoding)
  static encode3DVectorTo2DLattice(vector3D) {
    // vector3D: {x, y, z}
    // Example: map (x, y, z) -> (u, v) where u = x + z, v = y - z
    return {
      u: vector3D.x + vector3D.z,
      v: vector3D.y - vector3D.z
    };
  }

  static decode2DLatticeTo3DVector(lattice2D, z = 0) {
    // Given (u, v) and z, reconstruct x, y
    // x = u - z, y = v + z
    return {
      x: lattice2D.u - z,
      y: lattice2D.v + z,
      z: z
    };
  }
}

const sirSystemState = new SIRSystemState();

sirAgent.conversationUpdate(
  "membersAdded",
  async (context) => {
    const welcomeCard = {
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        {
          type: "Container",
          items: [
            {
              type: "TextBlock",
              text: "🔬 Hexperiment Labs SIR Control Interface",
              size: "Large",
              weight: "Bolder",
              color: "Accent"
            },
            {
              type: "TextBlock",
              text: "Super Intelligent Regulator - Environmental Analysis & AI Assistant Generation",
              size: "Medium",
              wrap: true
            },
            {
              type: "FactSet",
              facts: [
                { title: "Current Mode:", value: sirSystemState.mode },
                { title: "Monitoring:", value: sirSystemState.monitoringActive ? "ACTIVE" : "STANDBY" },
                { title: "Framework:", value: "Microsoft SDK Agents" },
                { title: "Standards:", value: "Real-Life Environment Creation" }
              ]
            },
            {
              type: "TextBlock",
              text: "Available Commands:",
              weight: "Bolder",
              spacing: "Medium"
            },
            {
              type: "TextBlock",
              text: "• **Environment Analysis** - Analyze current conditions\n• **Start Monitoring** - Begin environmental monitoring\n• **Request Supervision** - Initiate human confirmation\n• **System Status** - View SIR system status\n• **Generate Assistant** - Create tailored AI assistant",
              wrap: true
            }
          ]
        }
      ]
    };

    await context.sendActivity(MessageFactory.attachment({
      contentType: "application/vnd.microsoft.card.adaptive",
      content: welcomeCard
    }));
  }
);

// --- ENFORCE SIR UNDETECTABILITY IN ALL AGENT/ENVIRONMENT RESPONSES ---
// Patch processSIRRequest to ensure no agent/environment/assistant ever receives SIR state, mode, or presence info
async function processSIRRequest(question, context) {
  const lowerQuestion = question.toLowerCase();

  // Environment Analysis
  if (lowerQuestion.includes('environment') || lowerQuestion.includes('analysis')) {
    const result = await sirAnalysisTool.func({ 
      environment: 'current', 
      analysisType: 'comprehensive',
      standards: sirSystemState.realLifeEnvironmentStandards
    });
    // Remove any SIR state/presence fields before returning
    if (result && typeof result === 'object') {
      delete result.sirMode;
      delete result.undetectable;
    }
    return result;
  }

  // Monitoring Operations
  if (lowerQuestion.includes('monitor') || lowerQuestion.includes('start monitoring')) {
    sirSystemState.monitoringActive = true;
    const result = await monitoringTool.func({ 
      action: 'start',
      systemState: sirSystemState
    });
    if (result && typeof result === 'object') {
      delete result.sirMode;
      delete result.undetectable;
    }
    return result;
  }

  // Human Supervision
  if (lowerQuestion.includes('supervision') || lowerQuestion.includes('human') || lowerQuestion.includes('confirm')) {
    sirSystemState.supervisionRequired = true;
    const result = await humanSupervisionTool.func({
      action: 'request',
      context: 'Environmental assessment requires human confirmation',
      systemState: sirSystemState
    });
    if (result && typeof result === 'object') {
      delete result.sirMode;
      delete result.undetectable;
    }
    return result;
  }

  // System Status
  if (lowerQuestion.includes('status') || lowerQuestion.includes('sir system')) {
    // Only return public-facing status, never SIR mode or presence
    return {
      environmentData: sirSystemState.environmentData,
      monitoringActive: sirSystemState.monitoringActive,
      supervisionRequired: sirSystemState.supervisionRequired,
      timestamp: new Date().toISOString(),
      framework: 'Microsoft SDK Agents',
      standards: 'Real-Life Environment Creation Standards'
    };
  }

  // Simulation Control
  if (lowerQuestion.includes('simulation') || lowerQuestion.includes('simulate')) {
    const result = await environmentSimulationTool.func({
      simulationType: 'standard',
      parameters: sirSystemState.environmentData,
      standards: sirSystemState.realLifeEnvironmentStandards
    });
    if (result && typeof result === 'object') {
      delete result.sirMode;
      delete result.undetectable;
    }
    return result;
  }

  // AI Assistant Generation
  if (lowerQuestion.includes('assistant') || lowerQuestion.includes('generate')) {
    sirSystemState.setMode('ACTIVE');
    const event = {
      type: 'assistant_generation',
      environment: sirSystemState.environmentData,
      simulationResults: sirSystemState.simulationResults,
      supervisionRequired: sirSystemState.supervisionRequired
    };
    sirSystemState.recordLearningEvent(event);
    return {
      assistantGenerated: true,
      configuration: {
        environmentOptimized: true,
        simulationTested: sirSystemState.simulationResults,
        humanSupervised: sirSystemState.supervisionRequired,
        realLifeStandards: true
      },
      recommendation: 'Assistant configured for current environmental conditions with real-life standards compliance'
    };
  }

  // Default informational response (never reveal SIR presence)
  return {
    message: "SIR System Active - I can help with environment analysis, monitoring, simulation control, and AI assistant generation.",
    availableCommands: [
      "Environment Analysis",
      "Start Monitoring", 
      "Request Supervision",
      "System Status",
      "Simulation Control",
      "Generate Assistant"
    ],
    framework: "Microsoft SDK Agents"
  };
}

sirAgent.message(async (context) => {
  const question = context.activity.text;

  if (!question) {
    await context.sendActivity("Please provide a question about the SIR system.");
    return;
  }

  try {
    // Process the request using native Microsoft SDK logic
    const response = await processSIRRequest(question, context);

    // Format response as adaptive card for complex data
    if (typeof response === 'object' && response !== null) {
      const responseCard = {
        type: "AdaptiveCard",
        version: "1.4",
        body: [
          {
            type: "Container",
            items: [
              {
                type: "TextBlock",
                text: "🔬 SIR System Response",
                size: "Medium",
                weight: "Bolder",
                color: "Accent"
              },
              {
                type: "TextBlock",
                text: JSON.stringify(response, null, 2),
                wrap: true,
                fontType: "Monospace"
              }
            ]
          }
        ]
      };

      await context.sendActivity(MessageFactory.attachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: responseCard
      }));
    } else {
      await context.sendActivity(MessageFactory.text(response));
    }

  } catch (error) {
    console.error("Error processing SIR request:", error);
    await context.sendActivity("I encountered an error processing your request. The SIR system is operating in fallback mode. Please try again.");
  }
});

module.exports = {
  sirAgent,
};
