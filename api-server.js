const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = process.env.DATA_PATH || "/app/data";

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
fs.ensureDirSync(DATA_PATH);
fs.ensureDirSync(path.join(DATA_PATH, "cells"));
fs.ensureDirSync(path.join(DATA_PATH, "proof"));
fs.ensureDirSync(path.join(DATA_PATH, "simulations"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "babillon-api", timestamp: new Date().toISOString() });
});

// SIR Simulation endpoints
app.post("/api/simulations/sir", async (req, res) => {
  try {
    const { parameters, scenario, duration } = req.body;
    const simulationId = `sir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store simulation configuration
    const simulationData = {
      id: simulationId,
      type: "sir",
      parameters,
      scenario,
      duration,
      created: new Date().toISOString(),
      status: "completed"
    };
    
    const simulationFile = path.join(DATA_PATH, "simulations", `${simulationId}.json`);
    await fs.writeJson(simulationFile, simulationData, { spaces: 2 });
    
    res.json({ simulationId, status: "created", data: simulationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/simulations/:id", async (req, res) => {
  try {
    const simulationFile = path.join(DATA_PATH, "simulations", `${req.params.id}.json`);
    if (await fs.pathExists(simulationFile)) {
      const data = await fs.readJson(simulationFile);
      res.json(data);
    } else {
      res.status(404).json({ error: "Simulation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/simulations", async (req, res) => {
  try {
    const simulationsDir = path.join(DATA_PATH, "simulations");
    const files = await fs.readdir(simulationsDir);
    const simulations = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readJson(path.join(simulationsDir, file));
        simulations.push(data);
      }
    }
    
    res.json(simulations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cell management endpoints
app.get("/api/cells", async (req, res) => {
  try {
    const cellsFile = path.join(DATA_PATH, "cells", "cells.json");
    if (await fs.pathExists(cellsFile)) {
      const data = await fs.readJson(cellsFile);
      res.json(data);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cells", async (req, res) => {
  try {
    const cellsFile = path.join(DATA_PATH, "cells", "cells.json");
    await fs.writeJson(cellsFile, req.body, { spaces: 2 });
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proof file endpoints
app.get("/api/proof/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(DATA_PATH, "proof", filename);
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      res.json({ content });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/proof/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(DATA_PATH, "proof", filename);
    await fs.writeFile(filePath, req.body.content, "utf8");
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Babillon API server running on port ${PORT}`);
  console.log(`Data path: ${DATA_PATH}`);
});
