const express = require("express");
const WebSocket = require("ws");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3002;
const WS_PORT = process.env.WS_PORT || 3003;
const API_URL = process.env.API_URL || "http://babillon-api:3001";

app.use(express.json());

// Agent registry
const agents = new Map();
const simulations = new Map();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "babillon-agents", 
    timestamp: new Date().toISOString(),
    activeAgents: agents.size,
    activeSimulations: simulations.size
  });
});

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  const agentId = uuidv4();
  agents.set(agentId, { 
    id: agentId, 
    ws, 
    status: "connected", 
    connected: new Date().toISOString()
  });
  
  console.log(`Agent ${agentId} connected. Total agents: ${agents.size}`);
  
  ws.send(JSON.stringify({ 
    type: "connected", 
    agentId, 
    message: "Welcome to Babillon Agent Network" 
  }));

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      await handleAgentMessage(agentId, data);
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: "error", 
        error: error.message 
      }));
    }
  });

  ws.on("close", () => {
    agents.delete(agentId);
    console.log(`Agent ${agentId} disconnected. Total agents: ${agents.size}`);
  });
});

async function handleAgentMessage(agentId, message) {
  const agent = agents.get(agentId);
  if (!agent) return;

  console.log(`Message from agent ${agentId}:`, message.type);

  switch (message.type) {
    case "sir_simulation":
      await handleSIRSimulation(agentId, message.data);
      break;
    
    case "navigate":
      await handleNavigation(agentId, message.data);
      break;
    
    case "status_update":
      await handleStatusUpdate(agentId, message.data);
      break;
    
    case "ping":
      agent.ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
      break;
    
    default:
      agent.ws.send(JSON.stringify({ 
        type: "error", 
        error: `Unknown message type: ${message.type}` 
      }));
  }
}

async function handleSIRSimulation(agentId, data) {
  const agent = agents.get(agentId);
  if (!agent) return;

  try {
    const simulationId = `sir_${agentId}_${Date.now()}`;
    
    // Store simulation in memory
    simulations.set(simulationId, {
      id: simulationId,
      agentId,
      type: "sir",
      parameters: data.parameters,
      scenario: data.scenario,
      status: "running",
      started: new Date().toISOString()
    });

    // Simulate SIR model progression
    const results = await runSIRSimulation(data.parameters, data.scenario);
    
    // Update simulation status
    const simulation = simulations.get(simulationId);
    simulation.status = "completed";
    simulation.results = results;
    simulation.completed = new Date().toISOString();

    // Send results back to agent
    agent.ws.send(JSON.stringify({
      type: "simulation_complete",
      simulationId,
      results
    }));

    // Optionally save to API server
    try {
      await axios.post(`${API_URL}/api/simulations/sir`, {
        parameters: data.parameters,
        scenario: data.scenario,
        duration: data.duration || 365,
        results
      });
    } catch (apiError) {
      console.warn("Failed to save to API server:", apiError.message);
    }

  } catch (error) {
    agent.ws.send(JSON.stringify({
      type: "simulation_error",
      error: error.message
    }));
  }
}

async function runSIRSimulation(parameters, scenario) {
  // Simple SIR model implementation
  const { beta, gamma, population, initialInfected } = parameters;
  const dt = 0.1;
  const steps = Math.floor(365 / dt); // 1 year simulation
  
  let S = population - initialInfected;
  let I = initialInfected;
  let R = 0;
  
  const results = {
    time: [],
    susceptible: [],
    infected: [],
    recovered: []
  };

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    
    // Apply scenario modifications
    let effectiveBeta = beta;
    if (scenario === "vaccination" && t > 100) {
      effectiveBeta = beta * 0.7; // 30% reduction due to vaccination
    }
    if (scenario === "lockdown" && t > 50 && t < 150) {
      effectiveBeta = beta * 0.3; // 70% reduction during lockdown
    }
    
    // SIR differential equations
    const dS = -effectiveBeta * S * I / population;
    const dI = effectiveBeta * S * I / population - gamma * I;
    const dR = gamma * I;
    
    // Update populations
    S += dS * dt;
    I += dI * dt;
    R += dR * dt;
    
    // Store results every day
    if (i % 10 === 0) {
      results.time.push(t);
      results.susceptible.push(Math.round(S));
      results.infected.push(Math.round(I));
      results.recovered.push(Math.round(R));
    }
  }

  return results;
}

async function handleNavigation(agentId, data) {
  const agent = agents.get(agentId);
  if (!agent) return;

  // Simulate navigation response
  agent.ws.send(JSON.stringify({
    type: "navigation_complete",
    location: data.target,
    status: "success"
  }));
}

async function handleStatusUpdate(agentId, data) {
  const agent = agents.get(agentId);
  if (!agent) return;

  agent.status = data.status;
  agent.lastUpdate = new Date().toISOString();
  
  // Broadcast status to all connected agents
  broadcastToAllAgents({
    type: "agent_status_update",
    agentId,
    status: data.status
  });
}

function broadcastToAllAgents(message) {
  agents.forEach((agent) => {
    if (agent.ws.readyState === WebSocket.OPEN) {
      agent.ws.send(JSON.stringify(message));
    }
  });
}

// REST API endpoints
app.get("/api/agents", (req, res) => {
  const agentList = Array.from(agents.values()).map(agent => ({
    id: agent.id,
    status: agent.status,
    connected: agent.connected,
    lastUpdate: agent.lastUpdate
  }));
  res.json(agentList);
});

app.get("/api/simulations", (req, res) => {
  const simulationList = Array.from(simulations.values());
  res.json(simulationList);
});

app.get("/api/simulations/:id", (req, res) => {
  const simulation = simulations.get(req.params.id);
  if (simulation) {
    res.json(simulation);
  } else {
    res.status(404).json({ error: "Simulation not found" });
  }
});

// Start HTTP server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Babillon Agents HTTP server running on port ${PORT}`);
  console.log(`Babillon Agents WebSocket server running on port ${WS_PORT}`);
  console.log(`API URL: ${API_URL}`);
});
