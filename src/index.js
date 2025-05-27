// Import required packages
const { authorizeJWT, CloudAdapter, loadAuthConfigFromEnv } = require("@microsoft/agents-hosting");
const express = require("express");

// This bot's main dialog.
const { weatherAgent } = require("./agent");

// Create authentication configuration
const authConfig = loadAuthConfigFromEnv();
const adapter = new CloudAdapter(authConfig);

// Create express application.
const server = express();
server.use(express.json());

// Health check endpoint (no auth required)
server.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    service: "Weather Agent", 
    timestamp: new Date().toISOString(),
    port: process.env.port || process.env.PORT || 3978
  });
});

// Status endpoint (no auth required)
server.get("/", (req, res) => {
  res.json({
    service: "Microsoft 365 Weather Agent",
    version: "1.0.0",
    status: "running",
    environment: process.env.TEAMSFX_ENV || "development",
    endpoints: {
      "POST /api/messages": "Bot Framework endpoint for conversations",
      "GET /health": "Health check endpoint",
      "GET /": "Service status"
    },
    features: [
      "OpenAI GPT-4 integration",
      "Weather forecasting",
      "Date/time assistance",
      "Microsoft 365 Agents framework"
    ],
    timestamp: new Date().toISOString()
  });
});

// Apply JWT authorization only to bot endpoints
server.use("/api", authorizeJWT(authConfig));

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await weatherAgent.run(context);
  });
});

const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () => {
  console.log(
    `\nServer listening to port ${port} for appId ${authConfig.clientId} debug ${process.env.DEBUG}`
  );
});
